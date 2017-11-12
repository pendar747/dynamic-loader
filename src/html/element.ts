export interface PostHtmlASTNode {
    tag: string;
    attrs?: any;
    content?: Array<PostHtmlASTNode|string>;
}

// TODO: finish implementing the html element class

export default class Element {
    private _tag: string = '';
    private _attrs: any = {};
    private _childrenById: Map<string, Element|string>;
    private _childrenByClass: Map<string, Element|string>;

    private static _indexChild (node: string | PostHtmlASTNode): 
        [string, string|Element] {

        const key: string = 
            typeof node === 'string' ? 'content' : node.attrs.id;
        const value: string|Element = 
            typeof node === 'string' ? '' : new Element(node);
        return [key, value];
    }

    private _indexChildren (node: PostHtmlASTNode) {
        const { content = [] } = node;
        const mapIterable: [string, string|Element][] = 
            content.map(node => Element._indexChild(node));
            
        this._childrenById = new Map(mapIterable);
    }

    constructor (node: PostHtmlASTNode) {
        this._tag = node.tag;
        this._attrs = node.attrs;
        this._indexChildren(node);
    }

    query (selector) {

    }
}
