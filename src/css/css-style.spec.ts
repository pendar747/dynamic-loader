import test from 'ava';
import CssStyle from './css-style';
import Asset from '../asset/asset';
import * as sinon from 'sinon';
import Path from '../general/path';
import Project from '../general/project';

test('Css style should create an ast from content', t => {
    const sampleCss = 'body {\n' +
    '    width: 400px;\n' +
    '    background-color: blue;\n' +
    '}';
    sinon.stub(Asset.prototype, 'readFile').callsFake(function (this: any) {
        this._rawContent = sampleCss;
    });

    const style = new CssStyle(new Path('/'), new Project(new Path('/')));
    
    t.is(style.render(), sampleCss);
});