/**
 * With manifest V3, service workers are not able to access the DOM. This is a simple
 * implementation of a DOM parser that can be used to parse the HTML content of a page.
 * 
 * This does not include APIs such as querySelector or querySelectorAll.
 * 
 * This is directly taken from the npm package dom-parser and modified to work with ES6 modules. 
 * While this is really not an elegant solution, this project is designed to be a simple project 
 * and not depend on any build tools like webpack or babel.
 * https://www.npmjs.com/package/dom-parser/v/1.1.5
 */

export function parseFromString(html) {
    return new Dom_1.Dom(html);
}

const Dom_1 = (function() {
    const tagRegExp = /(<\/?(?:[a-z][a-z0-9]*:)?[a-z][a-z0-9-_.]*?[a-z0-9]*\s*(?:\s+[a-z0-9-_:]+(?:=(?:(?:'[\s\S]*?')|(?:"[\s\S]*?")))?)*\s*\/?>)|([^<]|<(?![a-z/]))*/gi;
    const attrRegExp = /\s[a-z0-9-_:]+\b(\s*=\s*('|")[\s\S]*?\2)?/gi;
    const splitAttrRegExp = /(\s[a-z0-9-_:]+\b\s*)(?:=(\s*('|")[\s\S]*?\3))?/gi;
    const startTagExp = /^<[a-z]/;
    const selfCloseTagExp = /\/>$/;
    const closeTagExp = /^<\//;
    const textNodeExp = /^[^<]/;
    const nodeNameExp = /<\/?((?:([a-z][a-z0-9]*):)?(?:[a-z](?:[a-z0-9-_.]*[a-z0-9])?))/i;
    const attributeQuotesExp = /^('|")|('|")$/g;
    const noClosingTagsExp = /^(?:area|base|br|col|command|embed|hr|img|input|link|meta|param|source)/i;
    // private
    function find(html, conditionFn, onlyFirst = false) {
        const generator = domGenerator(html);
        const result = [];
        for (const node of generator) {
            if (node && conditionFn(node)) {
                result.push(node);
                if (onlyFirst) {
                    return result;
                }
            }
        }
        return result;
    }
    function* domGenerator(html) {
        const tags = getAllTags(html);
        let cursor = null;
        for (let i = 0, l = tags.length; i < l; i++) {
            const tag = tags[i];
            const node = createNode(tag, cursor);
            cursor = node || cursor;
            if (isElementComposed(cursor, tag)) {
                yield cursor;
                cursor = cursor.parentNode;
            }
        }
        while (cursor) {
            yield cursor;
            cursor = cursor.parentNode;
        }
    }
    function isElementComposed(element, tag) {
        if (!tag) {
            return false;
        }
        const isCloseTag = closeTagExp.test(tag);
        const [, nodeName] = tag.match(nodeNameExp) || [];
        const isElementClosedByTag = isCloseTag && element.nodeName === nodeName;
        return isElementClosedByTag || element.isSelfCloseTag || element.nodeType === Node_1.NodeType.text;
    }
    function getAllTags(html) {
        return html.match(tagRegExp) || [];
    }
    function createNode(tag, parentNode) {
        const isTextNode = textNodeExp.test(tag);
        const isStartTag = startTagExp.test(tag);
        if (isTextNode) {
            return createTextNode(tag, parentNode);
        }
        if (isStartTag) {
            return createElementNode(tag, parentNode);
        }
        return null;
    }
    function createElementNode(tag, parentNode) {
        var _a;
        const [, nodeName, namespace] = tag.match(nodeNameExp) || [];
        const selfCloseTag = selfCloseTagExp.test(tag) || noClosingTagsExp.test(nodeName);
        const attributes = parseAttributes(tag);
        const elementNode = new Node_1.Node({
            nodeType: Node_1.NodeType.element,
            nodeName,
            namespace,
            attributes,
            childNodes: [],
            parentNode,
            selfCloseTag,
        });
        (_a = parentNode === null || parentNode === void 0 ? void 0 : parentNode.childNodes) === null || _a === void 0 ? void 0 : _a.push(elementNode);
        return elementNode;
    }
    function parseAttributes(tag) {
        return (tag.match(attrRegExp) || []).map((attributeString) => {
            splitAttrRegExp.lastIndex = 0;
            const exec = splitAttrRegExp.exec(attributeString) || [];
            const [, name = '', value = ''] = exec;
            return new NodeAttribute_1.NodeAttribute({
                name: name.trim(),
                value: value.trim().replace(attributeQuotesExp, ''),
            });
        });
    }
    function createTextNode(text, parentNode) {
        var _a;
        const textNode = new Node_1.Node({
            nodeType: Node_1.NodeType.text,
            nodeName: '#text',
            text,
            parentNode,
        });
        (_a = parentNode === null || parentNode === void 0 ? void 0 : parentNode.childNodes) === null || _a === void 0 ? void 0 : _a.push(textNode);
        return textNode;
    }
    
    class Dom {
        constructor(rawHTML) {
            this.rawHTML = rawHTML;
        }
        find(conditionFn, findFirst) {
            const result = find(this.rawHTML, conditionFn, findFirst);
            return findFirst ? result[0] || null : result;
        }
        getElementsByClassName(className) {
            const expr = new RegExp(`^(.*?\\s)?${className}(\\s.*?)?$`);
            return this.find((node) => Boolean(node.attributes.length && expr.test(node.getAttribute('class') || '')));
        }
        getElementsByTagName(tagName) {
            return this.find((node) => node.nodeName.toUpperCase() === tagName.toUpperCase());
        }
        getElementById(id) {
            return this.find((node) => node.getAttribute('id') === id, true);
        }
        getElementsByName(name) {
            return this.find((node) => node.getAttribute('name') === name);
        }
        getElementsByAttribute(attributeName, attributeValue) {
            return this.find((node) => node.getAttribute(attributeName) === attributeValue);
        }
    }
    
    return {
        Dom
    };
}());
const NodeAttribute_1 = (function() {
    class NodeAttribute {
        constructor({ name, value }) {
            this.name = name;
            this.value = value;
        }
    };
    
    return {
        NodeAttribute
    };
}());
const Node_1 = (function() {
    // private
    function searchElements(root, conditionFn) {
        if (root.nodeType === NodeType.text) {
            return [];
        }
        return root.childNodes.reduce((accumulator, childNode) => {
            if (childNode.nodeType !== NodeType.text && conditionFn(childNode)) {
                return [...accumulator, childNode, ...searchElements(childNode, conditionFn)];
            }
            return [...accumulator, ...searchElements(childNode, conditionFn)];
        }, []);
    }
    function searchElement(root, conditionFn) {
        for (let i = 0, l = root.childNodes.length; i < l; i++) {
            const childNode = root.childNodes[i];
            if (conditionFn(childNode)) {
                return childNode;
            }
            const node = searchElement(childNode, conditionFn);
            if (node) {
                return node;
            }
        }
        return null;
    }
    function stringifyAttributes(attributes) {
        return attributes.map((elem) => elem.name + (elem.value ? `="${elem.value}"` : '')).join(' ');
    }
    
    class Node {
        constructor({ nodeType, namespace, selfCloseTag, text, nodeName, childNodes, parentNode, attributes, }) {
            this.namespace = namespace || null;
            this.nodeType = nodeType;
            this.isSelfCloseTag = Boolean(selfCloseTag);
            this.text = text || null;
            this.nodeName = nodeType === NodeType.element ? nodeName : '#text';
            this.childNodes = childNodes || [];
            this.parentNode = parentNode;
            this.attributes = attributes || [];
        }
        get firstChild() {
            return this.childNodes[0] || null;
        }
        get lastChild() {
            return this.childNodes[this.childNodes.length - 1] || null;
        }
        get innerHTML() {
            return this.childNodes.reduce((html, node) => html + (node.nodeType === NodeType.text ? node.text : node.outerHTML), '');
        }
        get outerHTML() {
            if (this.nodeType === NodeType.text) {
                return this.textContent;
            }
            const attributesString = stringifyAttributes(this.attributes);
            const openTag = `<${this.nodeName}${attributesString.length ? ' ' : ''}${attributesString}${this.isSelfCloseTag ? '/' : ''}>`;
            if (this.isSelfCloseTag) {
                return openTag;
            }
            const childs = this.childNodes.map((child) => child.outerHTML).join('');
            const closeTag = `</${this.nodeName}>`;
            return [openTag, childs, closeTag].join('');
        }
        get textContent() {
            if (this.nodeType === NodeType.text) {
                return this.text;
            }
            return this.childNodes
                .map((node) => node.textContent)
                .join('')
                .replace(/\x20+/g, ' ');
        }
        getAttribute(name) {
            const attribute = this.attributes.find((a) => a.name === name);
            return attribute ? attribute.value : null;
        }
        getElementsByTagName(tagName) {
            return searchElements(this, (elem) => elem.nodeName.toUpperCase() === tagName.toUpperCase());
        }
        getElementsByClassName(className) {
            const expr = new RegExp(`^(.*?\\s)?${className}(\\s.*?)?$`);
            return searchElements(this, (node) => Boolean(node.attributes.length && expr.test(node.getAttribute('class') || '')));
        }
        getElementsByName(name) {
            return searchElements(this, (node) => Boolean(node.attributes.length && node.getAttribute('name') === name));
        }
        getElementById(id) {
            return searchElement(this, (node) => Boolean(node.attributes.length && node.getAttribute('id') === id));
        }
    }
    
    const NodeType = {
        element: 1,
        text: 3,
        1: "element",
        3: "text"
    };
    
    Node.ELEMENT_NODE = NodeType.element;
    Node.TEXT_NODE = NodeType.text;
    
    return {
        Node,
        NodeType
    };
}());