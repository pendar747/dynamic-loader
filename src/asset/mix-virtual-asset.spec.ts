import test from 'ava';
import * as sinon from 'sinon';

import Asset from '../asset/asset';
import Path from '../general/path';
import Project from '../general/project';

import mixVirtualAsset from './mix-virtual-asset';

let sandbox: sinon.SinonSandbox;

test.before(() => {
    sandbox = sinon.sandbox.create();
});

test.afterEach(() => {
    sandbox.restore();
});

test('mix virtual asset should create a virtual asset based on the' +
    'given base asset', t => {

    const readFileStub = sinon.stub(Asset.prototype, 'readFile')
        .callsFake(function (this: any) {
            this._rawContent = 'foo';
        });

    const Foo = mixVirtualAsset(Asset);

    const foo = new Foo(new Path('/'), new Project(new Path('/')), 'foo bar');

    t.false(readFileStub.called);
    
    t.is(foo.run(), 'foo bar');

    foo.rawContent = 'foo foo';

    t.is(foo.run(), 'foo foo');
});
