import * as sinon from 'sinon';
import * as fs from 'fs';
import * as Vue from 'vue/dist/vue.common.js';
import * as browserEnv from 'browser-env';

import test from 'ava';

import VueSfc from './vue-sfc';
import Path from '../general/path';
import Project from '../general/project';
import Asset from '../asset/asset';

let sandbox: sinon.SinonSandbox;
let sampleFile: string; 
let path: Path;
let project: Project;

test.before(() => {
    sandbox = sinon.sandbox.create();
    sampleFile = [
        '<template><body>{{foo}}</body></template>',
        '<script>',
        'export default { data: () => ({ foo: "washing machine" })}',
        '</script>'
    ].join('\n');
    path = new Path('/foo/bar.js');
    project = new Project(new Path('/foo'));
});

test.afterEach(() => {
    sandbox.restore();
});

test('creates a vue component with the given template', t => {
    const path = new Path('/foo/bar.js');
    const project = new Project(new Path('/foo'));

    sandbox.stub(Asset.prototype, 'readFile')
        .callsFake(function (this: any) {
            this._rawContent = sampleFile;
        });

    const vueSfc = new VueSfc(path, project);
    const { default: VueComponent } = vueSfc.run();
    const vueInstance = new VueComponent();

    t.true(vueInstance instanceof Vue);
    const { $el } = vueInstance.$mount();
    
    t.is($el.innerHTML, 'washing machine');
    t.true($el.tagName.toLowerCase() === 'body');
    t.is(vueInstance.$options.template, '<body>{{foo}}</body>');
});

test('should load styles if they exist', t => {
    const styleTag = [
        '<style>',
        'body {',
        '    background-color: blue;',
        '}',
        '</style>'
    ].join('\n');
    
    sandbox.stub(Asset.prototype, 'readFile')
        .callsFake(function (this: any) {
            this._rawContent = sampleFile + styleTag;
        });

    const vueSfc = new VueSfc(path, project);
    t.is(vueSfc.styleContent, 
        'body {\n' +
        '    background-color: blue;\n' +
        '}');
});

test('style content should be empty if there is no style tag', t => {
    sandbox.stub(Asset.prototype, 'readFile')
        .callsFake(function (this: any) {
            this._rawContent = sampleFile;
        });
    const vueSfc = new VueSfc(path, project);
    t.is(vueSfc.styleContent, '');
});

test('should load and run vue components that import other components', t => {
    const example = [
        '<template>',
        '<div><list></list></div>',
        '</template>',
        '<script>',
        'import list from "./list.vue"',
        'export default { components: { list } }',
        '</script>'
    ].join('\n');

    const list = [
        '<template>',
        '<ul><li>{{foo[0]}}</li><li>{{foo[1]}}</li></ul>',
        '</template>',
        '<script>',
        'export default { data: () => ({ foo: ["bar", "boo"] }) }',
        '</script>'
    ].join('\n');
    
    sandbox.stub(Asset.prototype, 'readFile')
        .onFirstCall()
        .callsFake(function (this: any) {
            this._rawContent = example;
        })
        .onSecondCall()
        .callsFake(function (this: any) {
            this._rawContent = list;
        });

    sandbox.stub(Project.prototype, 'resolveDependency')
        .returns(new Path('/list.vue'));
    sandbox.stub(Path.prototype, 'resolveExtension');

    const vueSfc = new VueSfc(path, project);
    const { default: VueComponent } = vueSfc.run();
    const vueInstance = new VueComponent();

    t.true(vueInstance instanceof Vue);
    const { $el } = vueInstance.$mount();
    
    t.is($el.innerHTML, '<ul><li>bar</li><li>boo</li></ul>');
    t.is($el.tagName.toLowerCase(), 'div');
});

// TODO: test case: when no asset with given language is defined should 
// not throw error