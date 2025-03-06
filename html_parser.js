import { Node, VoidNode, DocumentNode, HiddenNode } from "./nodes.js";

const charset = Object.setPrototypeOf({
    nbsp: '\xA0',
    lt: '<',
    gt: '>',
    amp: '&',
    quot: '"',
    apos: '\''
}, null);
const tags = Object.setPrototypeOf({
    'html': DocumentNode,
    'title': HiddenNode,
    'head': HiddenNode,
    'body': DocumentNode,
    'p': Node,
    'b': Node,
    'i': Node,
    's': Node,
    'em': Node,
    'strong': Node,
    'div': Node,
    'h1': Node,
    'h2': Node,
    'h3': Node,
    'ul': Node,
    'ol': Node,
    'li': Node,
    'code': Node,
    'br': VoidNode,
    'hr': VoidNode,
    'link': VoidNode
}, null);

export function htmlParser(data) {
    const stack = [new DocumentNode('#doc')];
    function close() { stack.at(-2)?.add(stack.pop()); }

    for (const [, tag, args, text] of data.matchAll(/\s+|<(?:!--.*?--|([/!]?[a-z0-6]+)([^>]*)?)>|([^<]*)/gsi)) {
        switch (true) {
            case Boolean(tag) && tag[0] == '/' && (tag.substring(1) in tags):
                close();
                break;
            case Boolean(tag) && tag[0] != '!' && (tag in tags):
                const element = tags[tag];
                stack.push(new element(tag));
                if (args?.endsWith('/') || element.isVoid) close();
                break;
            case text !== undefined:
                stack.at(-1).add(text.replace(/&([a-z]+);/g, (_, x) => charset[x] ?? '##'));
                break;
        }
    }

    while (stack.length > 1) close();
    return stack;
}