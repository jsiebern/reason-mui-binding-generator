declare interface PropSignature {
    type?: PropType,
    flowType?: PropType,
    required: boolean,
    description: string | '@ignore',
    defaultValue: {
        value: string,
        computed: boolean,
    },
}

declare interface ComponentSignature {
    description: string,
    displayName: string,
    name: string,
    styles: {
        classes: string[],
        name: null | string,
    },
    filename: string,
    importPath: string,
    inheritsFrom: string,
    props: {
        [propName: string]: PropSignature
    },
}
