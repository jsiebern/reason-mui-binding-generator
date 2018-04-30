import * as Fs from 'fs';
import * as Path from 'path';
import * as rimraf from 'rimraf';

import * as Console from './helpers/console';
import GetComponents from './helpers/get-components';
import Component from './classes/component';
import RenderColors from './render-colors';

const outputDirectory = Path.join(__dirname, '../', 'output');
const parseInit = () => {
    const rawComponents = GetComponents();
    const components = rawComponents.map((jsonString: string) => {
        try {
            const json = JSON.parse(jsonString);
            Console.info(`Parsing ${Console.colors.yellow}${json.name || json.displayName}${Console.colors.reset}`);
            return new Component(jsonString);
        }
        catch (e) {
            console.log(e);
            Console.error(e);
            Console.error(jsonString);
            process.exit();
            return null;
        }
    });

    // Inheritance
    components.forEach(c => {
        if (c != null && c.inheritsFrom) {
            const cInherit = components.find(ci => ci != null && ci.name === c.inheritsFrom);
            if (cInherit != null) {
                c.mergeProperties(cInherit.properties);
            }
        }
    });

    // Write color files
    Object.keys(RenderColors.colorFiles).forEach(key => {
        Fs.writeFileSync(Path.join(__dirname, '../', 'output', 'reason', `${key}.re`), RenderColors.colorFiles[key]);
    });

    // Write component files
    components.forEach(component => {
        if (component == null) {
            return;
        }
        Console.info(`Rendering ${Console.colors.yellow}${component.name}${Console.colors.reset}`);
        const rendered = component.render();
        Fs.writeFileSync(Path.join(__dirname, '../', 'output', 'reason', `MaterialUi_${component.name}.re`), rendered);
    });

    // Copy fixed modules
    const items = Fs.readdirSync(Path.join(__dirname, 'fixed-modules'));
    const itemsFiltered = items.filter(item => item.lastIndexOf('.re') === item.length - 3);
    itemsFiltered.forEach(item => {
        Fs.copyFileSync(Path.join(__dirname, 'fixed-modules', item), Path.join(__dirname, '../', 'output', 'reason', item));
    });

    // Write global file
    // ${itemsFiltered.map(item => `module ${item.replace('MaterialUi_', '').replace('.re', '')} = ${item.replace('.re', '')};`).join('\n')}
    Fs.writeFileSync(Path.join(__dirname, '../', 'output', 'reason', 'MaterialUi.re'), `
        ${components.map(component => component != null ? `module ${component.name} = MaterialUi_${component.name};` : '').join('\n')}
        ${RenderColors.colorModule}
        
        module type WithStylesSafeTemplate = MaterialUi_WithStyles.WithStylesSafeTemplate;
        module WithStylesSafe = MaterialUi_WithStyles.WithStylesSafe;
        module Theme = MaterialUi_Theme;
        module WithStyles = MaterialUi_WithStyles;
    `);

    // Todo: Generate .rei files
};


if (Fs.existsSync(Path.join(outputDirectory, 'reason'))) {
    rimraf.sync(Path.join(outputDirectory, 'reason', '*'));
    Fs.rmdirSync(Path.join(outputDirectory, 'reason'));
}
Fs.mkdirSync(Path.join(outputDirectory, 'reason'));

parseInit();
