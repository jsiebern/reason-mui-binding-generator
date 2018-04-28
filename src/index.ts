import * as Fs from 'fs';
import * as Path from 'path';
import * as rimraf from 'rimraf';

import * as Console from './helpers/console';
import GetComponents from './helpers/get-components';
import Component from './classes/component';
import ConstantStrings from './constant-strings';
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

    const rendered = components.map(c => {
        if (c == null) {
            return '';
        }
        Console.info(`Rendering ${Console.colors.yellow}${c.name}${Console.colors.reset}`);
        return c.render();
    }).join('\n');

    Fs.writeFileSync(Path.join(__dirname, '../', 'output', 'MaterialUi.re'), ConstantStrings + RenderColors + rendered);

    // Todo: Generate .rei files

};

rimraf.sync(Path.join(outputDirectory, '*.re'));
parseInit();
