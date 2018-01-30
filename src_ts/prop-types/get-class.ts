import * as Identify from './../helpers/identify-prop-type';
import * as Console from './../helpers/console';

import Base from './base';
import Primitive from './primitive';
import Union from './union';
import Enum from './enum';
import Shape from './shape';
import ArrayOf from './array-of';

const GetClass = (propType: PropType): false | typeof Base => {
    if (Identify.isPrimitive(propType)) {
        return Primitive;
    }
    else if (Identify.isUnion(propType)) {
        return Union;
    }
    else if (Identify.isEnum(propType)) {
        return Enum;
    }
    else if (Identify.isShape(propType)) {
        return Shape;
    }
    else if (Identify.isArrayOf(propType)) {
        return ArrayOf;
    }
    else {
        Console.warn(`Warning: Complex type ${Console.colors.red}${JSON.stringify(propType)}${Console.colors.yellow} does not map to anything`);
        return false;
    }
};

export default GetClass;