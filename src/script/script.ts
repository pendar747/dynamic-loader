import * as fs from 'fs';
import * as ts from 'typescript';
import Project from '../general//project';
import Asset from '../asset/asset';
import TranspiledAsset from '../asset/transpiled-asset';
import * as vm from 'vm';
import Path from '../general//path';
import * as assert from 'assert';
import Vue from 'vue';
import Logger from '../utils/logger';

export default class Script extends TranspiledAsset {
    protected _dependencies: Script[];

    protected scanDependencyPaths (): string[] {
        const source = ts.createSourceFile(
            this.path.basename,
            this._rawContent,
            this.compilerOptions.target || ts.ScriptTarget.ES5,
            true
        );

        const importedModules: string[] = [];
        const findImportPaths = (node: ts.Node): void => {
            if (ts.isImportDeclaration(node)) {
                const moduleName = node.moduleSpecifier.getText()
                    .replace(/["']/g, '');
                importedModules.push(moduleName);
            } else {
                node.forEachChild(findImportPaths);
            }
        };
 
        source.forEachChild(findImportPaths);

        return importedModules;
    }

    protected mapDependencyPath (path: Path) { 
        return path.hasExtension('ts', 'js')
            ? new Script(path, this._project)
            : new Asset(path, this._project);
    }

    protected mapModuleNameToPath (moduleName: string) {
        const path = this._project.resolveDependency(this._path, moduleName);
        assert.ok(path, `Missing dependency path for module ${moduleName}` +
            ` referenced from ${this._path.absolutePath}`);
        return path;
    }

    protected createDependencies () {
        this._dependencies = this.scanDependencyPaths()
            .map(this.mapModuleNameToPath.bind(this))
            .map((path: Path) => {
                path.resolveExtension();
                return path;
            })
            .map(this.mapDependencyPath.bind(this));
    }

    /**
     * Transpiles the script and fetches all its dependencies
     * Note: it throws an error if a dependency is missing.
     */
    transpile () {
        const res = ts.transpileModule(this._rawContent, {
            compilerOptions: this.compilerOptions,
            moduleName: this.path.basename
        });
        this.transpiledContent = res.outputText;
        this.createDependencies();

        // for now also transpile all the dependencies
        this.dependencies.forEach(script => {
            if (script instanceof TranspiledAsset) {
                script.transpile();
            }
        });
    }

    private _loadDependency (moduleName: string): Asset|undefined {
        const modulePath = this._project.resolveDependency(this._path, 
            moduleName);
        if (modulePath) {
            const preLoadedDep = this._dependencies
                .find(script => script.path.isEqualTo(modulePath));
            return preLoadedDep 
                ? preLoadedDep
                : this.mapDependencyPath(modulePath);
        }
        Logger.error('No path found for ', moduleName);
    }

    private _loadModule (moduleName: string) {
        if (moduleName.toLowerCase() === 'vue') {
            Logger.info('Resolving packaged vue');
            return { default: Vue };
        }
        const dep = this._loadDependency(moduleName);
        if (dep) {
            return dep.run();
        } else {
            Logger.debug('dependencies', this._dependencies);
            throw new Error(
                `No dependency found for ${moduleName} ` +
                `imported by ${this._path.absolutePath} `
            );
        }
    }

    run (): any {
        const vmOptions: vm.ScriptOptions = {
            filename: this.path.absolutePath
        };
        const virtualScript = new vm.Script(this.transpiledContent, vmOptions);
        const sandbox = {
            module: {
                exports: {}
            },
            exports: {},
            require: this._loadModule.bind(this),
            process: {
                env: 'development'
            },
            setTimeout: (cb, timeout) => setTimeout(cb, timeout),
            console
        };
        const context = vm.createContext(sandbox);
        virtualScript.runInContext(context);
        return Object.keys(sandbox.module.exports).length
            ? sandbox.module.exports
            : sandbox.exports;
    }

}