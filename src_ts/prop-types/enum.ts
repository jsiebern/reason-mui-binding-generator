import GenerateReasonName, { isNumeric } from './../helpers/generate-reason-name';

import Base from './base';

class Enum extends Base {
    isType: PropTypeList = 'Enum'
    propType: PropType$Enum

    constructor(name: string, required: boolean, propType: PropType$Enum) {
        super(name, required, propType);
        this.propType = propType;
        this.parse();
    }

    parse() {
        let enumIsNumeric: null | boolean = null;
        const enumKeys = this.propType.value.filter(e => !e.computed).map(e => e.value.substr(0, 1) === '\'' ? e.value.substr(1, e.value.length - 2) : e.value);
        const enumValues = this.propType.value.filter(e => !e.computed).map(e => {
            if (e.value.substr(0, 1) === '\'') {
                enumIsNumeric = false;
                return e.value.substr(1, e.value.length - 2);
            }
            else {
                if (enumIsNumeric === null) {
                    enumIsNumeric = true;
                }
                if (isNumeric(e.value)) {
                    return parseInt(e.value);
                }
                else if (e.value === 'true') {
                    return 1;
                }
                else {
                    return 0;
                }
            }
        });
        const enumValuesReason = enumKeys.map(e => GenerateReasonName(e));
        const enumName = GenerateReasonName(this.propName, false);

        if (enumIsNumeric) {
            this.parsed.addToComponent.push(`
                [@bs.deriving jsConverter]
                type ${enumName} =
                    ${enumValuesReason.map((name, i) => `| [@bs.as ${enumValues[i]}] ${name}`).join('\n')}
                ;
            `);
        }
        else {
            this.parsed.addToComponent.push(`
                [@bs.deriving jsConverter]
                type ${enumName} = [
                    ${enumValuesReason.map((name, i) => `| [@bs.as "${enumValues[i]}"] \`${name}`).join('\n')}
                ];
            `);
        }

        this.parsed.type = enumName;
        if (this.propRequired) {
            this.parsed.wrapJs = (name) => `${enumName}ToJs(${name})`;
        }
        else {
            this.parsed.wrapJs = (name) => `Js.Option.map([@bs] (v => ${enumName}ToJs(v)), ${name})`;
        }

        this.parsed.jsType = enumIsNumeric ? 'int' : 'string';
    }
}

export default Enum;