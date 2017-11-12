interface Declaration extends ASTNode {
    type: 'Declaration';

    /**
     * The property name, trimmed from whitespace and comments.
     * May not be empty.
     */
    property: string;

    /**
     * The value of the property, trimmed from whitespace and comments.
     * Empty values are allowed.
     */
    value: string;
}

type Rules = (Rule|Comment|Charset|CustomMedia|Document|FontFace|Host|Import|
    KeyFrames|KeyFrame|Media|Namespace|Page|Supports)[];

/**
 * A rule-level or declaration-level comment. 
 * Comments inside selectors, properties and values etc. are lost.
 */
interface Comment extends ASTNode {
    type: 'comment';

    /**
     * The part between the starting and the ending 
     * of the comment, including whitespace.
     */
    comment: string;
}

/**
 * The @charset at-rule.
 */
interface Charset extends ASTNode {
    type: 'charset';

    /**
     * The part following `@charset`.
     */
    charset: string;
}

/**
 * The `@custom-media` at-rule.
 */
interface CustomMedia extends ASTNode {
    type: 'custom-media';

    /**
     * The `--`-prefixed name.
     */
    name: string;

    /**
     * The part following the name.
     */
    media: string;
}

/**
 * The @document at-rule.
 */
interface Document extends ASTNode {
    type: 'document';

    /**
     * The part following @document.
     */
    document: string;

    /**
     * The vendor prefix in @document, or undefined if there is none.
     */
    vendor: string;

    /**
     * 
     */
    rules: Rules;
}

/**
 * The @font-face at-rule.
 */
interface FontFace extends ASTNode {
    type: 'font-face';

    declarations: (Declaration|Comment)[];
}

/**
 * The `@host` at-rule.
 */
interface Host extends ASTNode {
    type: 'host';

    rules: Rules;
}

/**
 * The @keyframes at-rule.
 */
interface KeyFrames extends ASTNode {
    type: 'keyframes';

    /**
     * The name of the keyframes rule.
     */
    name: string;

    /**
     * The vendor prefix in @keyframes, or undefined if there is none.
     */
    vendor: string;
    
    keyframes: (KeyFrame|Comment)[];
}

interface KeyFrame extends ASTNode {
    type: 'keyframe';

    /**
     * The list of “selectors” of the keyframe rule, 
     * split on commas. Each “selector” is trimmed from whitespace.
     */
    values: string[];

    declaration: (Declaration|Comment)[];
}

/**
 * The @media at-rule.
 */
interface Media extends ASTNode {
    type: 'media';
    media: string;
    rules: Rules;
}

interface Namespace extends ASTNode {
    type: 'namespace';
    /**
     * The part following `@namespace`.
     */
    namespace: string;
}

/**
 * The @supports at-rule.
 */
interface Supports {
    type: 'supports';
    supports: string;
    rules: Rules;
}

interface Page {
    type: 'page';
    /**
     * The list of selectors of the rule, split on commas. 
     * Each selector is trimmed from whitespace and comments.
     */
    selectors: string;

    rules: Rules;
}

/**
 * The `@import` at-rule.
 */
interface Import extends ASTNode {
    type: 'import';
    /**
     * The part following @import.
     */
    import: String;
}

interface Rule extends ASTNode {
    type: 'rule';

    /**
     * The list of selectors of the rule, split on commas.
     * Each selector is trimmed from whitespace and comments.
     */
    selectors: string[];

    declarations: (Declaration|Comment)[];
}

interface Position {
    type: 'position';
    start: {
        line: number;
        column: number;
    };
    end: {
        line: number;
        column: Number;
    };
    /**
     * The value of `options.source` if passed to 
     * `css.parse`. Otherwise undefined.
     */
    source: string|undefined;

    /**
     * The full source string passed to css.parse.
     */
    content: string;
}

export interface ASTNode {
    type: string;

    /**
     * Information about the position in the source 
     * string that corresponds to the node.
     */
    position: Position;

    /**
     * A reference to the parent node, or null if the node has no parent.
     */
    parent: ASTNode|null;
}

export interface Stylesheet extends ASTNode {
    type: 'stylesheet';

    stylesheet: {
        rules: Rules;

        /**
         * Errors collected during parsing when option silent is true.
         */
        parsingErrors: Error[];
    };
}
