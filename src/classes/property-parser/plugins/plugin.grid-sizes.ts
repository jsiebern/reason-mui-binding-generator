import PluginBase from './base';
import { isEnum } from '../../../helpers/identify-prop-type';

class PluginGridSizes extends PluginBase {
    public beforeParse() {
        if (this._parser.property.component.name !== 'Grid') {
            return;
        }
        if (['lg', 'md', 'sm', 'xl', 'xs'].indexOf(this._parser.property.name) == -1) {
            return;
        }

        if (this._parser.property.signature.type != null && isEnum(this._parser.property.signature.type)) {
            this._parser.property.signature.type.value = this._parser.property.signature.type.value.filter(item => item.value !== 'false' && item.value !== 'true' && item.value !== '\'auto\'');
        }
    }

    public beforeWrite() { }
}

export default PluginGridSizes;