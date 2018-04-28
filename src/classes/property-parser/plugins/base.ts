import PropertyParserBase from './../base';

abstract class PluginBase {
    protected _parser: PropertyParserBase;

    protected constructor(parser: PropertyParserBase) {
        this._parser = parser;
    }

    public abstract modify(): void;
}

export default PluginBase;