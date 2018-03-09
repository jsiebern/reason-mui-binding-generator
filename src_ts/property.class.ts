import GetClass from './prop-types/get-class';
import GenerateReasonName from './helpers/generate-reason-name';
import { isCallback as isCallbackProp } from './helpers/identify-prop-type';
import Callback from './prop-types/callback';

class Property {
    signature: PropSignature
    name: string
    safeName: string

    valid: boolean = true
    make: string
    wrapjs: string
    propjs: string
    makePropsJs: string
    addToComponent: string

    constructor(name: string, propSignature: PropSignature) {
        this.name = name;
        this.safeName = GenerateReasonName(name, false);
        this.signature = propSignature;
        this.parse();
    }

    parse() {
        const { name, signature } = this;
        signature.type = signature.type || signature.flowType || { name: 'any' };

        const isCallback = isCallbackProp(name, signature.type);
        // if (signature.description === '@ignore' && !isCallback) {
        //     this.valid = false;
        //     return;
        // }
        // if (name === 'theme') {
        //     this.signature.required = false;
        // }

        let PropClass = GetClass(signature.type);
        if (isCallback) {
            PropClass = Callback;
        }
        if (PropClass) {
            const prop = new PropClass(name, signature.required, signature.type);
            if (prop.valid) {
                this.makePropsJs = `~${this.safeName}:${prop.parsed.jsType ? prop.parsed.jsType : prop.parsed.type}`;
                this.wrapjs = prop.parsed.wrapJs(this.safeName);
                this.make = `~${this.safeName}: ${prop.parsed.type}`;
                if (!signature.required) {
                    this.make = `~${this.safeName}: option(${prop.parsed.type})=?`;
                    this.makePropsJs = `${this.makePropsJs}=?`;
                    this.wrapjs = `?${this.wrapjs}`;
                }

                this.addToComponent = this.renderAdded(prop.parsed.addToComponent);
            }
            else {
                this.valid = false;
            }
        }
        else {
            this.valid = false;
        }
    }

    renderAdded(toAdd: string[]) {
        if (toAdd.length) {
            let addedTypes: string[] = [];

            return toAdd.map(add => {
                const re = new RegExp(/type ([a-zA-Z]*) \=/g).exec(add);
                if (re !== null) {
                    const type = re[1];
                    if (addedTypes.includes(type)) {
                        return '';
                    }
                    addedTypes.push(type);
                }

                return add;
            }).join('\n');
        }

        return '';
    }
}

export default Property;
