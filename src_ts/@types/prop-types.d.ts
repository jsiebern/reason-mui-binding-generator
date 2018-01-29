declare interface PropType$Primitive {
    name: 'string' | 'number' | 'boolean' | 'bool' | 'any' | 'void' | 'Object' | 'String' | 'func' | 'node' | 'object'
}

declare interface PropType$Literal {
    name: 'literal',
    value: string,
}

declare interface PropType$ObjectSignature {
    name: 'signature',
    type: 'object',
    raw: string,
    signature: {
        properties: {
            [key: string]: string,
        },
    },
}

declare interface PropType$FunctionSignature {
    name: 'signature',
    type: 'function',
    raw: string,
    signature: {
        arguments: {
            name: string,
            type: PropType,
        }[],
        return: PropType
    },
}

declare interface PropType$Intersect {
    name: 'intersect',
    raw: string,
    elements: PropType[],
}

declare interface PropType$Union {
    name: 'union',
    value: PropType[],
}

declare interface PropType$Enum {
    name: 'enum',
    value: {
        value: string,
        computed: boolean,
    }[]
}

declare type PropTypeList = 'Primitive' | 'Literal' | 'ObjectSignature' | 'FunctionSignature' | 'Intersect' | 'Union' | 'Enum';

declare type PropType =
    | PropType$Primitive
    | PropType$Literal
    | PropType$ObjectSignature
    | PropType$Intersect
    | PropType$Union
    | PropType$FunctionSignature
    | PropType$Enum;