import * as Fs from 'fs';
import * as Path from 'path';
import { capitalize, isNumeric, uncapitalize } from './helpers/generate-reason-name';

interface ColorFile {
    [colorName: string]: {
        [colorCode: string]: string,
    },
}

const GetColors = (): ColorFile => JSON.parse(Fs.readFileSync(Path.join(__dirname, '../', 'output', 'json', 'colors.json'), 'utf8'));

const RenderColors = () => {
    const colors = GetColors();
    const colorFiles = Object.keys(colors).reduce((obj, colorName) => {
        return {...obj, [`MaterialUi_Color_${capitalize(colorName)}`]:
                `[@bs.module "@material-ui/core/colors/${colorName}"] external ${colorName}Ext: Js.Dict.t(string) = "default";
                ${Object.keys(colors[colorName]).map(key => `
                    let ${isNumeric(key) ? 'c' : ''}${uncapitalize(key)}: string = Js.Dict.unsafeGet(${colorName}Ext, "${key}");
                `).join('\n')}`
        };
    }, {});
    const colorModule = `
        module Colors = {
            ${Object.keys(colors).map(colorName => `
                module ${capitalize(colorName)} = MaterialUi_Color_${capitalize(colorName)};
            `).join('\n')}
        };
    `;

    return {
        colorFiles,
        colorModule,
    };
};

export default RenderColors();