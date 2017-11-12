import HtmlAsset from '../html/html-asset';
import { PostHtmlASTNode } from '../html/element';
import Asset from '../asset/asset';
import Path from '../general/path';
import Project from '../general/project';
import Script from '../script/script';
import CssStyle from '../css/css-style';

type Constructor<T = {}> = new (...args: any[]) => T;

const mixVirtualAsset = <AssetType extends Constructor<Asset>>
    (assetType: AssetType) => {
    return class VirtualAsset extends assetType {
        set rawContent (value: string) {
            this._rawContent = value;
        }

        constructor (...args: any[]) {
            super(...args);
            if (args.length === 3 && args[2]) {
                this.rawContent = args[2];
            }
        }

        readFile () {}
    };
};

export default mixVirtualAsset;
