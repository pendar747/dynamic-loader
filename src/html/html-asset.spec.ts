import test from 'ava';
import * as fs from 'fs';
import * as sinon from 'sinon';

import HtmlAsset, { VirtualHtmlTemplate } from './html-asset';
import Project from '../general/project';
import Path from '../general/path';
import Asset from '../asset/asset';

const sandbox = sinon.sandbox.create();

test('should parse the file correctly', t => {
    
    const sampleHtml = '<body class="bar" id="jo">foo</body>';
    sandbox.stub(Asset.prototype, 'readFile').callsFake(function (this: any) {
        this._rawContent = sampleHtml;
    });

    const asset = new HtmlAsset(
        new Path('/foo.html'), 
        new Project(new Path('/'))
    );

    const ast = {
        tag: 'body',
        attrs: {
            id: 'jo',
            class: 'bar'
        },
        content: ['foo']
    };
    t.deepEqual(asset.shallowTagSearch('body'), ast);

    t.deepEqual(asset.render(), sampleHtml);
});

test('virtual html template', t => {

    const ast = [{
        tag: 'body',
        content: ['bar'],
        attrs: {
            class: 'foobari'
        }
    }];

    const template = new VirtualHtmlTemplate(
        new Path('/'), 
        new Project(new Path('/')),
        ast
    );

    t.is(template.run(), '<body class="foobari">bar</body>');
});