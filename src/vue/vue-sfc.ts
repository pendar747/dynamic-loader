import Asset from '../asset/asset';
import Path from '../general/path';
import Project from '../general/project';
import * as Vue from 'vue/dist/vue.common.js';
import HtmlAsset from '../html/html-asset';
import { PostHtmlASTNode } from '../html/element';

import Logger from '../utils/logger';
import { VirtualStyle } from '../css/css-style';
import { VirtualHtmlTemplate } from '../html/html-asset';
import { VirtualScript } from '../script/multi-loader-script';
    

interface ITag {
    content: (PostHtmlASTNode|string)[]|string;
    lang: string;
}

/**
 * creates a vue component from the given file path
 * This class handles a single file component
 */
export default class VueSfc extends HtmlAsset {
    private _style: VirtualStyle;
    private _template: VirtualHtmlTemplate|string;
    private _script: VirtualScript;
    private _assetMap: [string, string, any][] = [
        ['script', 'js', VirtualScript],
        ['script', 'ts', VirtualScript],
        ['style', 'css', VirtualStyle],
        ['template', 'html', VirtualHtmlTemplate]
    ];

    private _defaultLang = {
        'script': 'js',
        'style': 'css',
        'template': 'html'
    };
    
    private _getTag (tagName: string): ITag {
        const tag = this.shallowTagSearch(tagName);
        return {
            content: tag && tag.content ? tag.content : '',
            lang: tag && tag.attrs && tag.attrs.lang
        };
    }
    
    private _getAsset (tagName: string) {
        const {
            lang = this._defaultLang[tagName],
            content
        } = this._getTag(tagName);
        
        const conf = this._assetMap.find(conf => 
            conf[1] === lang && conf[0] === tagName);
        const assetContent = content.length === 1 
            && typeof content[0] === 'string'
            ? content[0] : content;

        const assetType = conf ? conf[2] : Asset;
        if (assetType === Asset) {
            Logger.error(
                'File',
                this.path.absolutePath,
                '- could not find a suitable asset type for tag', 
                tagName, 'with language', lang
            );
        }
        return new assetType(this._path, this._project, assetContent);
    }

    private _assignPortions () {
        this._script = this._getAsset('script');
        this._style = this._getAsset('style');
        this._template = this._getAsset('template');
    }

    constructor (path: Path, project: Project) {
        super(path, project);
        this._assignPortions();
    }

    /**
     * gets rendered content of the style
     */
    get styleContent () {
        return this._style instanceof VirtualStyle 
            ? this._style.render()
            : '';
    }
    
    run (): typeof Vue {
        this._script.transpile();
        const { default: moduleExport } = this._script.run();
                
        const template = typeof this._template === 'string'
            ? this._template
            : this._template.run();
            
        const vueInstance = Vue.extend({
            extends: moduleExport,
            template
        });

        return { default: vueInstance };
    }
}