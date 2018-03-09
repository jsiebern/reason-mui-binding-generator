import * as Fs from 'fs';
import * as Path from 'path';

import * as Console from './helpers/console';
import GetComponents from './helpers/get-components';
import Component from './component.class';
import ConstantStrings from './constant-strings';
import RenderColors from './render-colors';

const parseInit = () => {
    const rawComponents = GetComponents();

    const components = rawComponents.map(jsonString => {
        Console.info(`Parsing ${JSON.parse(jsonString).name}`);
        try {
            return new Component(jsonString);
        }
        catch (e) {
            console.log(e);
            Console.error(e);
            Console.error(jsonString);
            process.exit();
            return new Component('');
        }
    });

    // Inheritance
    components.forEach(c => {
        if (c.inheritsFrom) {
            const cInherit = components.find(ci => ci.name === c.inheritsFrom);
            if (cInherit != null) {
                c.properties = [...c.properties, ...cInherit.properties.filter(pi => c.properties.find(p => p.name === pi.name) == null)];
            }
        }
    });

    const render = components.map(c => {
        Console.info(`Rendering ${c.name}`);
        return c.render();
    }).join('\n');

    Fs.writeFileSync(Path.join(__dirname, '../', 'output', 'MaterialUi.re'), ConstantStrings + RenderColors + render);
};

parseInit();
