import * as Fs from 'fs';
import * as Path from 'path';
import { capitalize, isNumeric, uncapitalize } from './helpers/generate-reason-name';

interface ColorFile {
    [colorName: string]: {
        [colorCode: string]: string,
    },
};

const GetColors = (): ColorFile => JSON.parse(Fs.readFileSync(Path.join(__dirname, '../', 'output', 'json', 'colors.json'), 'utf8'));

const RenderColors = () => {
    const colors = GetColors();

    return `
        module Colors = {
            ${Object.keys(colors).map(name => `
                module ${capitalize(name)} = {
                    [@bs.module "material-ui/colors/${name}"] external ${name}Ext: Js.Dict.t(string) = "default";
                    ${Object.keys(colors[name]).map(key => `
                        let ${isNumeric(key) ? 'c' : ''}${uncapitalize(key)}: string = Js.Dict.unsafeGet(${name}Ext, "${key}");
                    `).join('\n')}
                };
            `).join('\n')}
        };
    `;
};

export default RenderColors();