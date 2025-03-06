import { Node, VoidNode } from './nodes.js';

function text(value) {
    if (value == '') return [];
    const result = [];
    let i = 0;
    for (const match of value.matchAll(/(?<g>[_*]{1,3}|`|~~)(.*?)\k<g>|( {2}$)/g)) {
        result.push(text(value.substring(i, match.index)));
        const [, style, body, br] = match;
        switch (true) {
            case Boolean(br): result.push(new VoidNode('br')); break;
            case style == '`': result.push(new Node('code', {}, body)); break;
            case style.length == 1: result.push(new Node('i', {}, text(body))); break;
            case style.length == 2: result.push(new Node('b', {}, text(body))); break;
            case style.length == 3: result.push(new Node('i', {}, new Node('b', {}, text(body)))); break;
        }
        i = match.index + match[0].length;
    }
    if (i < value.length) result.push(value.substring(i));
    return result;
}

export function markdownParser(data) {
    const result = [];

    let list;
    function add(item) {
        const last = result.at(-1);
        if (typeof (item) == 'string') {
            if (last?.tag == 'p')
                last.add(text(item));
            else
                result.push(new Node('p', {}, text(item)));
        } else {
            if (last?.tag == 'p' && last.length == 0) result.pop();
            result.push(item);
        }
    }
    function closeLevel() {
        const last = new Node('ul', {}, list.pop().slice(1));
        list.at(-1).at(-1).add(last);
    }
    for (const line of data.split(/\r?\n/)) {
        if (line == '') { result.at(-1)?.tag == 'p' && add(new Node('p')); continue; }
        const [valid, br, header, offset, body] = line.match(/^(?:(-+)|(?:(#{1,6})|( *)[-*])\s+(.+))$/) || [];
        if (list && offset === undefined) {
            while (list.length > 1) closeLevel();
            result.push(new Node('ul', {}, list[0].slice(1)));
            list = undefined;
        }
        switch (true) {
            case !valid: add(line); break;
            case Boolean(br): add(new Node('hr')); break;
            case Boolean(header): add(new Node('h' + header.length, {}, body)); break;
            case offset !== undefined:
                if (list) {
                    const last = list.at(-1);
                    switch (Math.sign(last[0] - offset.length)) {
                        case 0: last.push(new Node('li', {}, text(body))); break;
                        case -1: list.push([offset.length, new Node('li', {}, text(body))]); break;
                        case 1:
                            closeLevel();
                            list.at(-1).push(new Node('li', {}, text(body)));
                            break;
                    }
                } else {
                    list = [[offset.length, new Node('li', {}, text(body))]];
                }
                break;
        }
    }
    return result;
}