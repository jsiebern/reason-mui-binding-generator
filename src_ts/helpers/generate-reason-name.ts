export const capitalize = (str: string) => str.replace(/\b\w/g, l => l.toUpperCase());
export const uncapitalize = (str: string) => str.replace(/\b\w/g, l => l.toLowerCase());

export const isNumeric = (obj: any) => {
    var realStringObj = obj && obj.toString();
    return typeof obj !== 'object' && (realStringObj - parseFloat(realStringObj) + 1) >= 0;
}

const GenerateReasonName = (str: string, toUpper: boolean = true) => {
    str = toUpper ? capitalize(str) : uncapitalize(str);

    while (str.indexOf('-') > -1) {
        str = str.replace('-', '_');
    }
    if (['type', 'open', 'in'].indexOf(str) > -1) {
        str = `_${str}`;
    }

    if (isNumeric(str)) {
        str = `V${str}`;
    }

    return str;
};

export default GenerateReasonName;