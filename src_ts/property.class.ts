import GetClass from './prop-types/get-class';
import GenerateReasonName from './helpers/generate-reason-name';

class Property {
    signature: PropSignature
    name: string

    valid: boolean = true
    make: string
    wrapjs: string
    addToComponent: string

    constructor(name: string, propSignature: PropSignature) {
        this.name = name;
        this.signature = propSignature;
        this.parse();
    }

    parse() {
        const { name, signature } = this;

        if (signature.description === '@ignore') {
            this.valid = false;
            return;
        }

        const PropClass = GetClass(signature.type);
        if (PropClass) {
            const prop = new PropClass(name, signature.required, signature.type);
            const safeName = GenerateReasonName(name, false);
            if (prop.valid) {
                if (signature.required) {
                    this.make = `~${safeName}: ${prop.parsed.type}`;
                    this.wrapjs = `"${safeName}": ${prop.parsed.wrapJs(safeName)}`;
                }
                else {
                    this.make = `~${safeName}: option(${prop.parsed.type})=?`;
                    this.wrapjs = `"${safeName}":  Js.Nullable.from_opt(${prop.parsed.wrapJs(safeName)})`;
                }
                this.addToComponent = (prop.parsed.addToComponent.length) ? prop.parsed.addToComponent.join('\n') : '';
            }
            else {
                this.valid = false;
            }
        }
        else {
            this.valid = false;
        }
    }
}

export default Property;