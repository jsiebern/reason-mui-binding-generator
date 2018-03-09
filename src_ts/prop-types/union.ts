import * as Console from './../helpers/console';
import { capitalize } from './../helpers/generate-reason-name';

import GetClass from './get-class';
import Base from './base';

class Union extends Base {
    isType: PropTypeList = 'Union'
    propType: PropType$Union

    constructor(name: string, required: boolean, propType: PropType$Union) {
        super(name, required, propType);
        propType.value = propType.value || propType.elements;
        this.propType = propType;
        this.parse();
    }

    parse() {
        let hasEnum = false;
        let hasEnumArray = false;
        let hasShape = false;

        const unionProps = this.propType.value != null ? this.propType.value.map(prop => {
            if (prop.name === 'enum') {
                hasEnum = true;
            }
            else if (prop.name === 'shape') {
                hasShape = true;
            }
            const PropClass = GetClass(prop);
            return (PropClass) ? new PropClass(this.propName, this.propRequired, prop) : false;
        }).filter(prop => prop !== false && prop.valid) : [];

        const reasonTypes: string[] = [];
        const enums: string[] = [];
        const enumArrays: string[] = [];
        const shapes: string[] = [];
        unionProps.reduce((arr, prop) => {
            if (prop) {
                if (prop.getType() === 'Primitive') {
                    switch (prop.parsed.type) {
                        case 'string':
                        case 'bool':
                            arr.push(`${capitalize(prop.parsed.type)}(${prop.parsed.type})`);
                            break;
                        case '[ | `Int(int) | `Float(float) ]':
                            arr.push('Int(int)');
                            arr.push('Float(float)');
                            break;
                        case 'Js.t({..})':
                            arr.push('ObjectGeneric(Js.t({..}))');
                            break;
                        case 'ReasonReact.reactElement':
                        case 'Element<any>':
                        case 'element':
                        case 'Element':
                            arr.push('Element(ReasonReact.reactElement)');
                            break;
                        default:
                            Console.warn(`Warning: Unhandled primitive type ${Console.colors.red}${JSON.stringify(prop)}${Console.colors.yellow} in Union ${Console.colors.red}${this.propName}`);
                    }
                }
                else if (prop.getType() === 'Enum') {
                    arr.push(`Enum(${prop.parsed.type})`);
                    enums.push(prop.parsed.type);
                }
                else if (prop.getType() === 'Shape') {
                    arr.push(`Object(${prop.parsed.type})`);
                    shapes.push(prop.parsed.type);
                }
                else if (prop.getType() === 'ArrayOf') {
                    if (prop.parsed.type.substr(0, 1) === '[') {
                        prop.parsed.type
                            .replace('[', '')
                            .replace(']', '')
                            .split('|')
                            .map(t => t.trim().replace('`', ''))
                            .filter(t => t !== '')
                            .forEach(t => arr.push(t));
                    }
                    else {
                        const type = prop.parsed.type.replace('`', '');
                        if (type.indexOf('EnumArray') > -1) {
                            hasEnumArray = true;
                            enumArrays.push(type.replace('EnumArray(array(', '').replace('))', ''));
                        }
                        arr.push(type);
                    }
                }
                else {
                    Console.warn(`Warning: Unhandled complex type ${Console.colors.red}${JSON.stringify(prop)}${Console.colors.yellow} in Union ${Console.colors.red}${this.propName}`);
                }
            }

            return arr;
        }, reasonTypes);

        unionProps.forEach(prop => {
            this.parsed.addToComponent = [...this.parsed.addToComponent, ...(prop ? prop.parsed.addToComponent : [])];
        });

        this.parsed.type = `[ ${reasonTypes.map(type => `| \`${type} `).join('')} ]`;
        const combinedLength = enums.length + enumArrays.length + shapes.length;
        if (this.propRequired) {
            if (hasEnum || hasShape || hasEnumArray) {
                this.parsed.wrapJs = (name) => `
                    (fun
                        ${enums.map(x => `| \`Enum(v) => unwrapValue(\`String(${x}ToJs(v)))`).join('\n')}
                        ${enumArrays.map(x => `| \`EnumArray(v) => unwrapValue(\`Element(Array.map(${x}ToJs, v)))`).join('\n')}
                        ${shapes.map(x => `| \`Object(v) => unwrapValue(\`Element(${x}ToJs(v)))`).join('\n')}
                        ${reasonTypes.length > combinedLength ? '| v => unwrapValue(v)' : ''}
                    )(${name})
                `;
            }
            else {
                this.parsed.wrapJs = (name) => `unwrapValue(${name})`;
            }
        }
        else {
            if (hasEnum || hasShape || hasEnumArray) {
                this.parsed.wrapJs = (name) => `
                    Js.Option.map([@bs] ((v) => switch v {
                        ${enums.map(x => `| \`Enum(v) => unwrapValue(\`String(${x}ToJs(v)))`).join('\n')}
                        ${enumArrays.map(x => `| \`EnumArray(v) => unwrapValue(\`Element(Array.map(${x}ToJs, v)))`).join('\n')}
                        ${shapes.map(x => `| \`Object(v) => unwrapValue(\`Element(${x}ToJs(v)))`).join('\n')}
                        ${reasonTypes.length > combinedLength ? '| v => unwrapValue(v)' : ''}
                    }), ${name})
                `;
            }
            else {
                this.parsed.wrapJs = (name) => `Js.Option.map([@bs] (v => unwrapValue(v)), ${name})`;
            }
        }

        this.parsed.jsType = `'union_${Math.random().toString(36).substr(2, 1)}`;
    }
}

export default Union;
