import Asset from '../asset/asset';
import * as cssParser from 'css';
import { Stylesheet } from './cssAst';
import Path from '../general/path';
import Project from '../general/project';
import mixVirtualAsset from '../asset/mix-virtual-asset';

export default class CssStyle extends Asset {
    private _ast: StyleSheet;
    private _parseOptions = {};
    private _renderOptions;
    private _indentSize = 4;
    
    set indentSize (value: number) {
        this._indentSize = value;
        this._renderOptions.indent = ' '.repeat(value);
    }

    protected _processContent () {
        this._ast = cssParser.parse(this._rawContent, this._parseOptions);
    }

    public render (): string {
        return this._ast && typeof this._ast === 'object'
            ? cssParser.stringify(this._ast, this._renderOptions)
            : '';
    }

    constructor (path: Path, project: Project) {
        super(path, project);
        this._parseOptions = {
            source: this.path.absolutePath
        };
        this._renderOptions = {};
        this.indentSize = 4;
        this.readFile();
    }

    readFile () {
        super.readFile();
        this._processContent();
    }
}

export class VirtualStyle extends mixVirtualAsset(CssStyle) {
    set rawContent (value) {
        this._rawContent = value;
        this._processContent();
    } 
}
