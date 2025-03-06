function propsToString(props) {
    return Object.entries(props).map(x => ` ${x[0]}="${x[1]}"`).join('');
}

export class Node {
    constructor(tag, props = {}, ...items) {
        this.tag = tag;
        this.props = props;
        this.length = 0;
        this.add(items)
    }
    add(...items) {
        for (const item of items.flat(Infinity)) {
            this[this.length++] = item;
        }
    }
    toString() {
        return `<${this.tag}${propsToString(this.props)}>${Array.from(this).join('')}</${this.tag}>`;
    }
}
export class VoidNode extends Node {
    toString() {
        return `<${this.tag}${propsToString(this.props)}/>`;
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