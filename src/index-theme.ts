import * as Fs from 'fs';
import * as Path from 'path';
import { JSONSchema7, JSONSchema7Definition } from 'json-schema';
// import RenderTheme from './render-theme';

const outputDirectory = Path.join(__dirname, '../', 'output');

const strTheme = Fs.readFileSync(Path.join(outputDirectory, 'json', 'theme.json'), 'utf-8');
const jsonTheme: JSONSchema7 = JSON.parse(strTheme);

class SchemaParser {
    private readonly _schema: JSONSchema7;
    private readonly _definition: string;



    public constructor(schema: JSONSchema7, definition: string) {
        this._schema = schema;
        this._definition = definition;
    }

    public render() {
        return '';
    }
}

const parser = new SchemaParser(jsonTheme, 'Theme');

console.log(parser.render());



// const themePath = Path.join(outputDirectory, 'MaterialUi_Theme.re');
// const themeOptionsPath = Path.join(outputDirectory, 'MaterialUi_ThemeOptions.re');

// if (Fs.existsSync(themePath)) {
//     Fs.unlinkSync(themePath);
// }
// if (Fs.existsSync(themeOptionsPath)) {
//     Fs.unlinkSync(themeOptionsPath);
// }
// Fs.writeFileSync(themePath, RenderTheme.theme);
// Fs.writeFileSync(themeOptionsPath, RenderTheme.themeOptions);
