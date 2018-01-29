import GenerateReasonName from './../helpers/generate-reason-name';

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
        const enumValues = this.propType.value.filter(e => !e.computed).map(e => e.value.substr(0, 1) === '\'' ? e.value.substr(1, e.value.length - 2) : e.value);
        const enumValuesReason = enumValues.map(e => GenerateReasonName(e));
        const enumName = GenerateReasonName(this.propName, false) + 'Enum';

        this.parsed.addToComponent.push(`
[@bs.deriving jsConverter]
type ${enumName} = [
    ${enumValuesReason.map((name, i) => `| [@bs.as "${enumValues[i]}"] \`${name}`).join('\n')}
];
        `);

        this.parsed.type = enumName;
        if (this.propRequired) {
            this.parsed.wrapJs = (name) => `${enumName}ToJs(${name})`;
        }
        else {
            this.parsed.wrapJs = (name) => `optionMap(${enumName}ToJs, ${name})`;
        }
    }
}

export default Enum;