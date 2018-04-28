import Base from './base';

const factory = (propertyType: PropType$Custom) => {
    return class PrimitiveParser extends Base {
        private _propertyType: PropType$Custom = propertyType;

        public executeParse() {
            this._reasonType = this._propertyType.reasonType;
            if (typeof this._propertyType.jsType !== 'undefined') {
                this._jsType = this._propertyType.jsType;
            }
            if (typeof this._propertyType.wrapJs !== 'undefined') {
                this._wrapJs = this._propertyType.wrapJs;
            }
        }
    }
};

export default factory;