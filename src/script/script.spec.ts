import * as sinon from 'sinon';
import * as ts from 'typescript';
import * as fs from 'fs';
import test from 'ava';
import Asset from '../asset/asset';

import Script from './script';
import Project from '../general//project';
import Path from '../general//path';

let sandbox: sinon.SinonSandbox;

test.before(t => {
    sandbox = sinon.sandbox.create();
});

test.afterEach(t => {
    sandbox.restore();
});

test('can find the imported module names', t => {
    t.plan(3);
    const sampleFile = '\
        import foo from "foo";\
        import j from "./j";\
        import a from "../a";\
        \
        function foobar () {};\
    ';

    class TestScript extends Script {
        readFile () {
            t.pass('readFile is called.');
            this._rawContent = sampleFile;
        }
        scanDependencyPaths (): string[] {
            const res = super.scanDependencyPaths();
            t.deepEqual(res, ['foo', './j', '../a']);
            return res;
        }
    }
    
    const resolvePathToDependency = sandbox
        .stub(Project.prototype, 'resolveDependency')
        .returns(new Path('/'));
    
    sandbox.stub(Path.prototype, 'hasExtension').returns(true);

    sandbox.stub(ts, 'transpileModule').returns('');

    sandbox.stub(fs, 'readFileSync').returns('const foo = \'hello\';');


    const project = new Project(new Path('/'));
    const script = new TestScript(new Path('/'), project);

    script.transpile();
    t.is(resolvePathToDependency.callCount, 3);
});

test('should find the correct resolved module paths', t => {
    const sampleFile = '\
        import foo from "foo";\
        import j from "./j";\
        import a from "../a";\
        \
        function foobar () {};\
    ';
    
    class TestScript extends Script {
        readFile () {
            t.pass('readFile is called.');
            this._rawContent = sampleFile;
        }
        scanDependencyPaths (): string[] {
            const res = super.scanDependencyPaths();
            t.deepEqual(res, ['foo', './j', '../a']);
            return res;
        }
    }

    sandbox.stub(fs, 'readFileSync').returns('{"main": "dist/index.js"}');
    sandbox.stub(fs, 'existsSync').returns(true);
    const readdir = sandbox.stub(fs, 'readdirSync')
        .onFirstCall().returns(['index.js'])
        .onSecondCall().returns(['jo.js'])
        .onThirdCall().returns(['a.ts']);

    const project = new Project(new Path('/foo/bar'));
    const script = new TestScript(new Path('/foo/bar/jo.js'), project);

    script.transpile();
    t.is(script.dependencies.length, 3);
    t.true(script.dependencies[0].path
        .isEqualTo(new Path('/foo/bar/node_modules/foo/dist/index.js')));
    t.true(script.dependencies[1].path
        .isEqualTo(new Path('/foo/bar/jo.js')));
    t.true(script.dependencies[2].path
        .isEqualTo(new Path('/foo/a.ts')));
});

test('should be able to run in vm', t => {
    const fooFile = 'module.exports.default = "foo";';
    const jFile = 'module.exports.default = "j"';
    const aFile = 'module.exports.default = "a"';
    const sampleFile = '\
        import foo from "foo";\
        import j from "./j";\
        import a from "../a";\
        \
        export default function foobar () {\
            return foo+j+a;\
        };\
    ';
    
    class TestScript extends Script {
        readFile () {
            t.pass('readFile is called.');
            this._rawContent = sampleFile;
        }
        scanDependencyPaths (): string[] {
            const res = super.scanDependencyPaths();
            t.deepEqual(res, ['foo', './j', '../a']);
            return res;
        }
    }
    
    sandbox.stub(Project.prototype, 'resolveDependency')
        .callsFake((file, mod) => {
            return new Path(`/foo/${mod}.js`);
        });

    sandbox.stub(Path.prototype, 'resolveExtension').returns(true);

    sandbox.stub(fs, 'readFileSync')
        .onCall(0).returns(fooFile)
        .onCall(1).returns(jFile)
        .onCall(2).returns(aFile);
    
    const originalTranspile = ts.transpileModule;

    const project = new Project(new Path('/foo/bar'));
    const script = new TestScript(new Path('/foo/bar/jo.js'), project);

    script.transpile();

    const foobar = script.run().default;
    t.is(foobar(), 'fooja');
});