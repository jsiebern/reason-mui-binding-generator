import PluginBase from './base';

class PluginThemeOptional extends PluginBase {
    public modify() {
        if (this._parser.property.name === 'theme' && this._parser.property.component.name !== 'MuiThemeProvider') {
            this._parser.property.signature.required = false;
        }
    }
}

export default PluginThemeOptional;