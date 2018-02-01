import * as Console from './../helpers/console';
import Base from './base';
import * as Identify from './../helpers/identify-prop-type';

import Enum from './enum';

class ArrayOf extends Base {
    isType: PropTypeList = 'ArrayOf'
    propType: PropType$ArrayOf

    constructor(name: string, required: boolean, propType: PropType$ArrayOf) {
        super(name, required, propType);
        this.propType = propType;
        this.parse();
    }

    parse() {
        // Don't make this generic as we probably only have 3 possible cases in MUI: string, number, Literal Enum (or a union of those)

        if (Identify.isUnion(this.propType.value)) {
            let t: string[] = [];

            const union = this.propType.value;
            union.value.forEach(prop => {
                if (Identify.isPrimitive(prop)) {
                    t = [...t, ...this.getPrimitive(prop.name)];
                }
                else if (Identify.isEnum(prop)) {

                }
                else {
                    Console.warn(`Warning: Unhandled complex type ${Console.colors.red}${JSON.stringify(prop)}${Console.colors.yellow} in ArrayOf.union.parse ${Console.colors.red}${this.propName}`);
                }
            });

            this.parsed.type = `[ ${t.map(s => `| \`${s}`).join('')} ]`;
        }
        else if (Identify.isEnum(this.propType.value)) {
            const e = new Enum(this.propName, true, this.propType.value);

            this.parsed.addToComponent = [...this.parsed.addToComponent, ...e.parsed.addToComponent];
            this.parsed.type = `\`EnumArray(array(${e.parsed.type}))`;
        }
        else {
            Console.warn(`Warning: Unhandled complex type ${Console.colors.red}${JSON.stringify(this.propType.value)}${Console.colors.yellow} in ArrayOf.parse ${Console.colors.red}${this.propName}`);
        }

        this.parsed.jsType = `'arrayOf_${Math.random().toString(36).substr(2, 1)}`;
    }

    getPrimitive(type: PropType$Primitive['name']) {
        if (type === 'number') {
            return ['IntArray(array(int))', 'FloatArray(array(float))'];
        }
        else if (type === 'string') {
            return ['StringArray(array(string))'];
        }
        else {
            Console.warn(`Warning: Unhandled primitive type ${Console.colors.red}${type}${Console.colors.yellow} in ArrayOf.getPrimitive ${Console.colors.red}${this.propName}`);
            return [''];
        }
    }
}

export default ArrayOf;