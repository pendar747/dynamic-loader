import * as xmlParser from 'posthtml-parser';
import * as xmlRender from 'posthtml-render';

import { PostHtmlASTNode } from './element';
import Asset from '../asset/asset';

import mixVirtualAsset from '../asset/mix-virtual-asset';
import Path from '../general/path';
import Project from '../general/project';

export default class HtmlAsset extends Asset {
    private _ast: (PostHtmlASTNode|string)[];

    protected set ast (value: (PostHtmlASTNode|string)[]) {
        this._ast = value;
    }

    shallowTagSearch (tagName): PostHtmlASTNode|undefined {
        return <PostHtmlASTNode>this._ast
            .find((node: PostHtmlASTNode) => node.tag === tagName);
    }

    /**
     * returns the rendered ast
     */
    render (): string {
        return xmlRender(this._ast, { closingSingleTag: 'slash' });
    }

    private _processContent () {
        this._ast = xmlParser(this._rawContent);
    }

    readFile () {
        super.readFile();
        this._processContent();
    }
}


export class VirtualHtmlTemplate extends mixVirtualAsset(HtmlAsset) {

    constructor (path: Path, project: Project,
        ast: (PostHtmlASTNode|string)[]) {
        super(path, project);
        this.ast = ast;
        this._rawContent = this.render();
    }

}