import * as Fs from 'fs';
import * as Path from 'path';
import Component from './classes/component';
import * as rimraf from "rimraf";

const GetIcons = (): string[] => JSON.parse(Fs.readFileSync(Path.join(__dirname, '../', 'output', 'json', 'icons.json'), 'utf8'));

const RenderIcons = () => {
    const icons = GetIcons();

    const baseComponent: ComponentSignature = JSON.parse(Fs.readFileSync(Path.join(__dirname, '../', 'output', 'json', 'svg-icon.json'), 'utf8'));
    const iconFiles = icons.reduce((prev, iconName) => {
        const icon = {
            ...baseComponent,
            displayName: iconName,
            name: iconName,
            importName: iconName,
            importPath: '@material-ui/icons',
            inheritsFrom: '',
        };
        return {
            ...prev,
            [ `MaterialUi_Icon_${iconName}` ]: new Component(JSON.stringify(icon)).render(),
        };
    }, {});

    const iconModule = icons.map(iconName => `
        module ${iconName} = MaterialUi_Icon_${iconName};
    `).join('\n');

    return {
        iconFiles,
        iconModule,
    };
};

const outputDirectory = Path.join(__dirname, '../', 'output');
if (Fs.existsSync(Path.join(outputDirectory, 'reason-icons'))) {
    rimraf.sync(Path.join(outputDirectory, 'reason-icons'));
}
Fs.mkdirSync(Path.join(outputDirectory, 'reason-icons'));

const icons = RenderIcons();

// Write icon files
Object.keys(icons.iconFiles).forEach(key => {
    Fs.writeFileSync(Path.join(__dirname, '../', 'output', 'reason-icons', `${key}.re`), icons.iconFiles[ key ]);
});

Fs.writeFileSync(Path.join(__dirname, '../', 'output', 'reason-icons', `MaterialUi_Icons.re`), icons.iconModule);