export class Node {
    constructor(tag, _props, ...items) {
        this.tag = tag;
        this.length = 0;
        this.add(items)
    }
    add(...items) {
        for (const item of items.flat(Infinity)) {
            this[this.length++] = item;
        }
    }
    toString() {
        return `<${this.tag}>${Array.from(this).join('')}</${this.tag}>`;
    }
}
export class VoidNode extends Node {
    toString() {
        return `<${this.tag}/>`;
    }
    static isVoid = true;
}
export class HiddenNode extends Node {
    toString() {
        return '';
    }
}
export class DocumentNode extends Node {
    toString() {
        return Array.from(this).join('');
    }
}

export class LinkNode extends Node {
    constructor(tag, props, ...items) {
        super(tag, props, ...items);
        this.href = props?.href ?? '';
    }
    toString() {
        return `<${this.tag} href="${this.href}">${Array.from(this).join('')}</${this.tag}>`;
    }
}