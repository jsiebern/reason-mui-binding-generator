class Base {
    isType: PropTypeList;
    protected propType: PropType;
    protected propName: string;
    protected propRequired: boolean;

    public valid: boolean;
    public parsed: {
        type: string,
        jsType: string,
        wrapJs: (name: string) => string,
        addToComponent: string[],
    };

    constructor(name: string, required: boolean, propType: any) {
        this.propName = name;
        this.propRequired = required;
        this.parsed = {
            type: '',
            jsType: '',
            addToComponent: [],
            wrapJs: (name) => name,
        };
        this.valid = true;
    }

    public getType() {
        return this.isType;
    }

    public getOriginalPropType() {
        return this.propType;
    }
}

export default Base;