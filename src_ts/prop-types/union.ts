import * as Console from './../helpers/console';
import { capitalize } from './../helpers/generate-reason-name';

import GetClass from './get-class';
import Base from './base';

class Union extends Base {
    isType: PropTypeList = 'Union'
    propType: PropType$Union

    constructor(name: string, required: boolean, propType: PropType$Union) {
        super(name, required, propType);
        this.propType = propType;
        this.parse();
    }

    parse() {
        let hasEnum = false;

        const unionProps = this.propType.value.map(prop => {
            if (prop.name === 'enum') {
                hasEnum = true;
            }
            const PropClass = GetClass(prop);
            return (PropClass) ? new PropClass(this.propName, this.propRequired, prop) : false;
        }).filter(prop => prop !== false && prop.valid);

        const reasonTypes: string[] = [];
        const enums: string[] = [];
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
                        case 'ReasonReact.reactElement':
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
        if (this.propRequired) {
            if (hasEnum) {
                this.parsed.wrapJs = (name) => `
                    (fun
                        ${enums.map(x => `| \`Enum(${x}) => unwrapValue(\`String(${x}ToJs(${x})))`).join('\n')}
                        | x => unwrapValue(x)
                    )(${name})
                `;
            }
            else {
                this.parsed.wrapJs = (name) => `unwrapValue(${name})`;
            }
        }
        else {
            if (hasEnum) {
                this.parsed.wrapJs = (name) => `
                    optionMap(fun
                        ${enums.map(x => `| \`Enum(${x}) => unwrapValue(\`String(${x}ToJs(${x})))`).join('\n')}
                        | x => unwrapValue(x)
                    , ${name})
                `;
            }
            else {
                this.parsed.wrapJs = (name) => `optionMap(unwrapValue, ${name})`;
            }
        }
    }
}

export default Union;