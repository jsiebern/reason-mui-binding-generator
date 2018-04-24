import Base from './base';

class Primitive extends Base {
    isType: PropTypeList = 'Primitive'
    propType: PropType$Custom

    constructor(name: string, required: boolean, propType: PropType$Custom) {
        super(name, required, propType);
        this.propType = propType;
        this.parse();
    }

    parse() {
        this.parsed.type = this.propType.type;
        if (typeof this.propType.jsType !== 'undefined') {
            this.parsed.jsType = this.propType.jsType;
        }
        if (typeof this.propType.wrapJs !== 'undefined') {
            this.parsed.wrapJs = this.propType.wrapJs;
        }
    }
}

export default Primitive;
