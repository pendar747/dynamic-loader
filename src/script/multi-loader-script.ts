import Script from './script';
import Path from '../general/path';
import Asset from '../asset/asset';
import VueSfc from '../vue/vue-sfc';
import TranspiledAsset from '../asset/transpiled-asset';
import mixVirtualAsset from '../asset/mix-virtual-asset';

/**
 * A script loader that can handler different types of imports
 * e.g. json, pug/jade, css etc
 */
export default class MultiLoaderScript extends Script {
    private _assetMap: Array<[RegExp, typeof Asset]> = [
        [/ts|js/, MultiLoaderScript],
        [/vue/, VueSfc],
        [/.*/, Asset]
    ];

    protected mapDependencyPath (path: Path) {
        const [, AssetClass] = this._assetMap.find(conf =>
            conf[0].test(path.extension)) || [null, Asset];
        return new AssetClass(path, this._project);
    }
}

export class VirtualScript extends mixVirtualAsset(MultiLoaderScript) {}
