import GenerateReasonName from './../helpers/generate-reason-name';
import * as Console from './../helpers/console';
import { isPrimitive } from './../helpers/identify-prop-type';

import Base from './base';

class Shape extends Base {
    isType: PropTypeList = 'Shape'
    propType: PropType$Shape

    constructor(name: string, required: boolean, propType: PropType$Shape) {
        super(name, required, propType);
        this.propType = propType;
        this.parse();
    }

    parse() {
        const objectKeys = Object.keys(this.propType.value);
        const objectKeysReason = objectKeys.map(k => GenerateReasonName(k, false));
        const objectTypes = objectKeys.map(k => {
            const prop = this.propType.value[k];
            const type = prop.name;
            switch (type) {
                case 'number':
                    return 'int';
                case 'string':
                    return 'string';
                case 'union':
                    if (prop.value != null) {
                        let foundPrimitive = '';
                        prop.value.forEach(t => {
                            if (isPrimitive(t)) {
                                switch (t.name) {
                                    case 'number':
                                        foundPrimitive = 'int';
                                        break;
                                    case 'string':
                                        foundPrimitive = 'string';
                                        break;
                                }
                            }
                        });
                        if (foundPrimitive) {
                            return foundPrimitive;
                        }
                    }
                default:
                    Console.warn(`Warning: Unhandled complex type ${Console.colors.red}${JSON.stringify(type)}${Console.colors.yellow} in Shape ${Console.colors.red}${this.propName}`);
                    return '';
            }
        });
        const objectName = GenerateReasonName(this.propName, false) + 'Shape';

        this.parsed.addToComponent.push(`
            [@bs.deriving jsConverter]
            type ${objectName} = {
                ${objectKeysReason.map((k, i) => `${k}: ${objectTypes[i]}`).join(',\n')}
            };
        `);

        this.parsed.type = objectName;
        if (this.propRequired) {
            this.parsed.wrapJs = (name) => `${objectName}ToJs(${name})`;
        }
        else {
            this.parsed.wrapJs = (name) => `Js.Option.map([@bs] (v => ${objectName}ToJs(v)), ${name})`;
        }

        this.parsed.jsType = `'shape_${Math.random().toString(36).substr(2, 1)}`;
    }
}

export default Shape;