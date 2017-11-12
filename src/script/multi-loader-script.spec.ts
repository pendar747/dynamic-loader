import test from 'ava';
import MultiLoaderScript from './multi-loader-script';
import Path from '../general/path';
import Asset from '../asset/asset';
import VueSfc from '../vue/vue-sfc';
import Project from '../general/project';
import * as sinon from 'sinon';

test('should load the correct assets', t => {
    class Foo extends MultiLoaderScript {
        testLoad () {
            let AssetClass = this.mapDependencyPath(
                new Path('/foo/bar/a.js'));
            t.true(AssetClass instanceof MultiLoaderScript);

            AssetClass = this.mapDependencyPath(
                new Path('/foo/bar/b.txt'));
            t.true(AssetClass instanceof Asset);

            AssetClass = this.mapDependencyPath(
                new Path('/foo/button.vue'));
            t.true(AssetClass instanceof VueSfc);
        }
    }

    sinon.stub(Asset.prototype, 'readFile').returns('');

    t.plan(3);
    new Foo(new Path('/'), new Project(new Path('/'))).testLoad();
});