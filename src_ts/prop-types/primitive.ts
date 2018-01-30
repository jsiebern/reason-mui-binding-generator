import * as Console from './../helpers/console';
import Base from './base';

class Primitive extends Base {
    isType: PropTypeList = 'Primitive'
    propType: PropType$Primitive

    constructor(name: string, required: boolean, propType: PropType$Primitive) {
        super(name, required, propType);
        this.propType = propType;
        this.parse();
    }

    parse() {
        switch (this.propType.name) {
            case 'string':
            case 'String':
                this.parsed.type = 'string';
                break;
            case 'bool':
            case 'boolean':
                this.parsed.type = 'bool';
                if (this.propRequired) {
                    this.parsed.wrapJs = (name) => `Js.Boolean.to_js_boolean(${name})`;
                }
                else {
                    this.parsed.wrapJs = (name) => `optionMap(Js.Boolean.to_js_boolean, ${name})`;
                }
                break;
            case 'number':
                this.parsed.type = '[ | `Int(int) | `Float(float) ]';

                if (this.propRequired) {
                    this.parsed.wrapJs = (name) => `unwrapValue(${name})`;
                }
                else {
                    this.parsed.wrapJs = (name) => `optionMap(unwrapValue, ${name})`;
                }
                break;
            case 'node':
            case 'func':
            case 'element':
                this.parsed.type = 'ReasonReact.reactElement';
                break;
            case 'object':
                this.parsed.type = 'Js.t({..})';
                break;
            case 'any':
                this.parsed.type = `'any_${Math.random().toString(36).substr(2, 1)}`;
                break;
            case 'array':
                this.parsed.type = `[ | \`ArrayGeneric(array('any_${Math.random().toString(36).substr(2, 1)})) ]`;
                break;
            default:
                this.valid = false;
                Console.warn(`Warning: Primitive type ${Console.colors.red}${JSON.stringify(this.propType)}${Console.colors.yellow} does not map to anything`);
        };
    }
}

export default Primitive;