import test from 'ava';
import Path from './path';
import * as sionon from 'sinon';
import * as os from 'os';
import * as fs from 'fs';
import * as sinon from 'sinon';


test('should reject non absolute paths', t => {
    t.throws(() => {
        new Path('../foo');
    });
    t.notThrows(() => {
        new Path('/Users/foo/vue-designer');
    });
});

test('should get the basename and directory', t => {
    const path = new Path('/Users/foo/vue-designer');
    t.is(path.basename, 'vue-designer');
    t.true(path.directory.isEqualTo(new Path('/Users/foo')));
});

test('resolves the absolute path to a path relative to this one', t => {
    const path = new Path('/Users/foo/vue-designer');
    const other = path.resolvePathTo('../bar');
    t.true(other.isEqualTo(new Path('/Users/foo/bar')));

    const other2 = path.resolvePathTo('./nam/num');
    t.is(other2.absolutePath, '/Users/foo/vue-designer/nam/num');
});

test('can correctly check equality and splitting paths to segments', t => {
    const path = new Path('/Users/foo/vue-designer');
    const path2 = new Path('/Users/foo/vue-designer');
    t.deepEqual(path.segments, path2.segments);

    t.true(path.isEqualTo(path2));

    const path3 = new Path('/foo/bar');
    t.false(path3.isEqualTo(path));
});

test('can create a path given an absolute and a relative path', t => {
    const path = Path.createPathFrom('../foo/bar', '/Users/Public');
    t.true(path.isEqualTo(new Path('/Users/foo/bar')));

    t.throws(() => {
        Path.createPathFrom('/foo', '/bar');
    }, /relativePath|relative/);
    t.throws(() => {
        Path.createPathFrom('./foo', '../bar/foo');
    }, /absolutePath|absolute/);
});

test('must get the correct platform resolver', t => {
    const osType = sionon.stub(os, 'type').returns('Linux');

    const path = new Path('/foo/bar');
    t.deepEqual(path.segments, ['foo', 'bar']);

    osType.returns('Windows_NT');
    const path2 = new Path('/foo/bar');
    t.deepEqual(path2.segments, ['foo', 'bar']);

    osType.restore();
});

test('must create a new path by joining other paths', t => {
    const path = Path.join('/foo/bar', 'meo');
    t.true(path.isEqualTo(new Path('/foo/bar/meo')));

    t.throws(() => {
        Path.join('./foo', 'bar');
    }, /basePath|absolute/);
});

test('should determin if the path has any of the given extensions', t => {
    let path = new Path('/foo/bar/jo.js');
    t.true(path.hasExtension('js'));

    path = new Path('/foo/bar/bo');
    t.false(path.hasExtension('js', 'ts'));

    path = new Path('/bar/foo/j.ts');
    t.true(path.hasExtension('js', 'ts'));

    path = new Path('/bar/foo.ts/fubu');
    t.false(path.hasExtension('ts'));
});


test('Can resolve the asset file extension', t => {
    const sandbox = sinon.sandbox.create();
    const readdir = sandbox.stub(fs, 'readdirSync');
    
    let path = new Path('/foo/bar/ba');
    readdir.returns(['ba.spec.js', 'ba.js']);
    path.resolveExtension();
    t.true(path.isEqualTo(new Path('/foo/bar/ba.js')));

    path = new Path('/foo/bar/ba');
    readdir.returns(['ba.spec.js', 'ba.ts']);
    path.resolveExtension();
    t.true(path.isEqualTo(new Path('/foo/bar/ba.ts')));

    
    path = new Path('/foo/bar/ba');
    readdir.returns(['ba.jpeg']);
    path.resolveExtension();
    t.true(path.isEqualTo(new Path('/foo/bar/ba.jpeg')));
    
    path = new Path('/foo/bar/ba');
    readdir.returns(['foo.js']);
    t.throws(() => {
        path.resolveExtension();
    }, /No file|found in/);
});

test('utility for checking and getting file extension', t => {
    const path = new Path('/foo/boo/bar.txt');
    t.is(path.extension, '.txt');

    t.true(path.hasExtension('txt', 'js'));
});