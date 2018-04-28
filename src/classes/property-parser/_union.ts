import * as Console from './../../helpers/console';
import { upperFirst } from 'lodash';
import { generateAny, convertUnionToEnum } from './helpers';
import Base from './base';
import * as Identify from './../../helpers/identify-prop-type';
import ResolveArgument from './resolve-argument';

const factory = (propertyType: PropType$Union) => {
    return class UnionParser extends Base {
        private _propertyType: PropType$Union = propertyType;

        private _hasEnum = false;
        private _hasEnumArray = false;
        private _hasShape = false;

        public executeParse() {
            const unionProps = this.resolveUnionProps();

            const reasonTypes: string[] = [];
            const enums: string[] = [];
            const enumArrays: string[] = [];
            const shapes: string[] = [];

            unionProps.forEach(unionProp => {
                const type = unionProp.property.signature.type;
                
                if (type != null) {
                    if (Identify.isPrimitive(type)) {
                        const pType = unionProp.reasonType.indexOf('\'any') === 0 ? 'any' : unionProp.reasonType;
                        switch (pType) {
                            case 'string':
                            case 'bool':
                            case 'any':
                                reasonTypes.push(`${upperFirst(pType)}(${unionProp.reasonType})`);
                                break;
                            case '[ | `Int(int) | `Float(float) ]':
                                reasonTypes.push('Int(int)');
                                reasonTypes.push('Float(float)');
                                break;
                            case 'Js.t({..})':
                                reasonTypes.push('ObjectGeneric(Js.t({..}))');
                                break;
                            case 'ReasonReact.reactElement':
                            case 'Element<any>':
                            case 'element':
                            case 'Node':
                            case 'node':
                            case 'Element':
                            case 'ComponentType<object>':
                                reasonTypes.push('Element(ReasonReact.reactElement)');
                                break;
                            default:
                                Console.error(`_union: Unhandled primitive type ${Console.colors.red}${JSON.stringify(unionProp)}${Console.colors.yellow} in Union ${Console.colors.red}${this.property.name}`);
                        }
                    }
                    else if (Identify.isEnum(type)) {
                        reasonTypes.push(`Enum(${unionProp.reasonType})`);
                        enums.push(unionProp.reasonType);
                    }
                    else if (Identify.isShape(type)) {
                        reasonTypes.push(`Object(${unionProp.reasonType})`);
                        shapes.push(unionProp.reasonType);
                    }
                    else if (Identify.isFunc(type)) {
                        reasonTypes.push(`Callback(${unionProp.reasonType})`);
                    }
                    else if (Identify.isArrayOf(type)) {
                        if (unionProp.reasonType.substr(0, 1) === '[') {
                            unionProp.reasonType
                                .replace('[', '')
                                .replace(']', '')
                                .split('|')
                                .map(t => t.trim().replace('`', ''))
                                .filter(t => t !== '')
                                .forEach(t => reasonTypes.push(t));
                        }
                        else if (unionProp.reasonType.substr(0, 5) === 'array') {
                            reasonTypes.push(`Array(${unionProp.reasonType})`);
                        }
                        else {
                            const arrayOfType = unionProp.reasonType.replace('`', '');
                            if (arrayOfType.indexOf('EnumArray') > -1) {
                                this._hasEnumArray = true;
                                enumArrays.push(arrayOfType.replace('EnumArray(array(', '').replace('))', ''));
                            }
                            reasonTypes.push(arrayOfType);
                        }
                    }
                    else {
                        Console.error(`_union: Unhandled complex type ${Console.colors.red}${JSON.stringify(unionProp)}${Console.colors.yellow} in Union ${Console.colors.red}${this.property.name}`);
                    }
                }
            });

            this._reasonType = `[ ${reasonTypes.map(type => `| \`${type} `).join('')} ]`;
            this._jsType = generateAny('union');

            const combinedLength = enums.length + enumArrays.length + shapes.length;
            if (this.property.signature.required) {
                if (this._hasEnum || this._hasShape || this._hasEnumArray) {
                    this._wrapJs = (name) => `
                    (fun
                        ${enums.map(x => `| \`Enum(v) => unwrapValue(\`String(${x}ToJs(v)))`).join('\n')}
                        ${enumArrays.map(x => `| \`EnumArray(v) => unwrapValue(\`Element(Array.map(${x}ToJs, v)))`).join('\n')}
                        ${shapes.map(x => `| \`Object(v) => unwrapValue(\`Element(convert${upperFirst(x.substr(4))}(v)))`).join('\n')}
                        ${reasonTypes.length > combinedLength ? '| v => unwrapValue(v)' : ''}
                    )(${name})
                `;
                }
                else {
                    this._wrapJs = (name) => `unwrapValue(${name})`;
                }
            }
            else {
                if (this._hasEnum || this._hasShape || this._hasEnumArray) {
                    this._wrapJs = (name) => `
                    Js.Option.map([@bs] ((v) => switch v {
                        ${enums.map(x => `| \`Enum(v) => unwrapValue(\`String(${x}ToJs(v)))`).join('\n')}
                        ${enumArrays.map(x => `| \`EnumArray(v) => unwrapValue(\`Element(Array.map(${x}ToJs, v)))`).join('\n')}
                        ${shapes.map(x => `| \`Object(v) => unwrapValue(\`Element(convert${upperFirst(x.substr(4))}(v)))`).join('\n')}
                        ${reasonTypes.length > combinedLength ? '| v => unwrapValue(v)' : ''}
                    }), ${name})
                `;
                }
                else {
                    this._wrapJs = (name) => `Js.Option.map([@bs] (v => unwrapValue(v)), ${name})`;
                }
            }
        }

        private extractEnum() {
            const extracted = convertUnionToEnum(this._propertyType);
            if (extracted.value.length) {
                return this.resolveType(extracted);
            }

            return false;
        }

        private resolveUnionProps(): Base[] {
            const unionProps = this._propertyType.value != null ? this._propertyType.value.reduce((arr, pType) => {
                // Do not include literals as they will be extracted into an enum
                if (pType.name === 'literal') {
                    return arr;
                }
                if (pType.name === 'enum') {
                    this._hasEnum = true;
                }
                else if (pType.name === 'shape') {
                    this._hasShape = true;
                }
                const resolved = this.resolveType(pType);
                if (resolved) {
                    return [...arr, resolved];
                }
                return arr;
            }, []) : [];
            const extractedEnum = this.extractEnum();
            if (extractedEnum) {
                this._hasEnum = true;
                unionProps.push(extractedEnum);
            }

            return unionProps;
        }

        private resolveType(type: PropType) {
            const argName = `${this.property.name}_${type.name}`;
            const argumentParser = ResolveArgument(argName, true, type, this._property);
            if (argumentParser) {
                return argumentParser;
            }

            return false;
        }
    }
};

export default factory;