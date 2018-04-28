import Base from './base';
import ResolveArgument from './resolve-argument';
import GenerateReasonName from '../../helpers/generate-reason-name';
import { upperFirst } from 'lodash';
import { generateAny } from './helpers';

const factory = (propertyType: PropType$Shape) => {
    return class ShapeParser extends Base {
        private _propertyType: PropType$Shape = propertyType;
        private _funcMake = `make${upperFirst(this.property.safeName)}`;
        private _funcConvert = `convert${upperFirst(this.property.safeName)}`;
        private _funcGet = `getFrom${upperFirst(this.property.safeName)}`;
        private _typeName = `type${upperFirst(this.property.safeName)}`;

        public executeParse() {
            const shapeArgs = this.resolveShape();
            if (shapeArgs.length) {
                const dictSet = shapeArgs.map(arg => `Js.Dict.set(returnObj, "${arg.key}", toJsUnsafe(${arg.wrapJs(`${this._funcGet}(madeObj, "${arg.keySafe}")`)}));`).join('\n');
                this._module = `
                    type ${this._typeName};
                    [@bs.obj] external ${this._funcMake} : (${shapeArgs.map(arg => {
                        let makeProps = `~${arg.keySafe}: ${arg.jsType ? arg.jsType : arg.type.indexOf('=>') > -1 ? `([@bs] ${arg.type})` : arg.type}`;
                        if (!arg.required) {
                            makeProps +='=?';
                        }
                        return makeProps;
                    }).join(',')}, unit) => ${this._typeName} = "";
                    
                    [@bs.get_index] external ${this._funcGet} : (${this._typeName}, string) => 'a = "";
                    let ${this._funcConvert} = (madeObj: ${this.property.signature.required ? this._typeName : `option(${this._typeName})`}) => {
                        let returnObj: Js.Dict.t(string) = Js.Dict.empty();
                        ${this.property.signature.required ? dictSet : `
                            switch (madeObj) {
                                | Some(madeObj) => { ${dictSet} (); }
                                | None => ()
                            };
                        `}
                        ${this.property.signature.required ? 'returnObj;' : 'Some(returnObj);'}
                    };
                `;

                this._wrapJs = (name) => `${this._funcConvert}(${name})`;
                this._reasonType = this._typeName;
                this._jsType = generateAny();
            }
            else {
                this._valid = false;
            }
        }

        private resolveShape() {
            const shapes: { key: string, keySafe: string, type: string, wrapJs: (k: string) => string, jsType: string, required: boolean }[] = [];

            Object.keys(this._propertyType.value).forEach(key => {
                const type = this._propertyType.value[key];
                const argumentParser = ResolveArgument(key, type.required, type, this._property);
                if (argumentParser && argumentParser.valid) {
                    shapes.push({
                        key,
                        keySafe: GenerateReasonName(key, false),
                        type: argumentParser.reasonType,
                        wrapJs: argumentParser.wrapJs,
                        jsType: argumentParser.jsType,
                        required: type.required,
                    });
                }
            });

            return shapes;
        }
    };
};

export default factory;