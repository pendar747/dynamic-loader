import Path from './path';
import * as ts from 'typescript';
import * as path from 'path';
import * as fs from 'fs';
import Logger from '../utils/logger';

export default class Project {
    private _rootPath: Path;
    private static _relativePattern: RegExp = /^\.+[\//]/;

    get rootPath () {
        return this._rootPath;
    }

    get nodeModulesPath (): Path {
        const absolutePath = path.join(
            this._rootPath.absolutePath, 
            `node_modules`
        );
        return new Path(absolutePath);
    }

    constructor (rootPath: Path) {
        this._rootPath = rootPath;
    }

    static moduleIsRelative (moduleName: string): boolean {
        return Project._relativePattern.test(moduleName);
    }

    private _getMainModuleFile (moduleName: string): Path | undefined {
        Logger.info('resolving path for module', moduleName);
        const packageJsonPath = Path.join(
            this.nodeModulesPath.absolutePath,
            moduleName,
            'package.json'
        );
        if (!fs.existsSync(packageJsonPath.absolutePath)) {
            Logger.info(
                'failed to find package.json at', 
                packageJsonPath.absolutePath
            );
            return undefined;
        }
        Logger.info('reading package json at', packageJsonPath.absolutePath);
        const content = fs.readFileSync(
            packageJsonPath.absolutePath, { encoding: 'utf8'});
        const packageJson = JSON.parse(content);
        return Path.join(
            this.nodeModulesPath.absolutePath,
            moduleName,
            packageJson.main
        );
    }

    resolveDependency (file: Path, dependencyPath: string): Path | undefined {
        return Project.moduleIsRelative(dependencyPath)
            ? file.directory.resolvePathTo(dependencyPath)
            : this._getMainModuleFile(dependencyPath);
    }
        
}