export const isPrimitive = (prop: PropType): prop is PropType$Primitive => (Object.keys(prop).length === 1 && prop.name != null) || (prop.name != null && prop.name === 'Element');

export const isLiteral = (prop: PropType): prop is PropType$Literal => (prop.name === 'literal');

export const isObjectSignature = (prop: PropType): prop is PropType$ObjectSignature => (prop.name === 'signature' && prop.type === 'object');

export const isFunctionSignature = (prop: PropType): prop is PropType$FunctionSignature => (prop.name === 'signature' && prop.type === 'function');

export const isIntersect = (prop: PropType): prop is PropType$Intersect => (prop.name === 'intersect');

export const isUnion = (prop: PropType): prop is PropType$Union => (prop.name === 'union');

export const isEnum = (prop: PropType): prop is PropType$Enum => (prop.name === 'enum');

export const isShape = (prop: PropType): prop is PropType$Shape => (prop.name === 'shape');

export const isArrayOf = (prop: PropType): prop is PropType$ArrayOf => (prop.name === 'arrayOf');

export const isCallBackName = (name: string) => new RegExp(/^on[A-Z]/g).test(name);
export const isCallback = (propName: string, prop: PropType): prop is PropType$Callback => (prop.name === 'func' && isCallBackName(propName));
