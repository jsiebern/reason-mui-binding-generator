import path from 'path';
import { mkdir, readFileSync, writeFileSync } from 'fs';
import kebabCase from 'lodash/kebabCase';
import * as reactDocgen from 'react-docgen';
import getStylesCreator from '/Users/jonathansiebern/git/_fork/material-ui/src/styles/getStylesCreator';
import createMuiTheme from '/Users/jonathansiebern/git/_fork/material-ui/src/styles/createMuiTheme';

import findComponents from './find-components';
import ensureExists from './ensure-folder-exists';

const components = findComponents();
const theme = createMuiTheme();
const rootDirectory = path.resolve('/Users/jonathansiebern/git/_fork/material-ui');
const outputDirectory = path.join(__dirname, '../', 'output', 'json');

components.forEach(componentPath => {
    const src = readFileSync(componentPath, 'utf8');

    if (src.match(/@ignore - internal component\./)) {
        return;
    }

    const component = require(componentPath);
    const styles = {
        classes: [],
        name: null,
    };

    if (component.styles && component.default.options) {
        // Collect the customization points of the `classes` property.
        styles.classes = Object.keys(getStylesCreator(component.styles).create(theme)).filter(
            className => !className.match(/^(@media|@keyframes)/),
        );
        styles.name = component.default.options.name;
    }

    let reactAPI;
    try {
        reactAPI = reactDocgen.parse(src);
    } catch (err) {
        console.log('Error parsing src for', componentPath);
        throw err;
    }

    reactAPI.name = path.parse(componentPath).name;
    reactAPI.styles = styles;
    reactAPI.filename = componentPath.replace(rootDirectory, '');
    reactAPI.importPath = `material-ui/${componentPath.replace(`${rootDirectory}/src/`, '').replace('.js', '')}`;

    // Inheritance
    const inheritedComponentRegexp = /\/\/ @inheritedComponent (.*)/;
    const inheritedComponent = src.match(inheritedComponentRegexp);
    const inheritsFrom = !inheritedComponent ? '' : inheritedComponent[1];
    reactAPI.inheritsFrom = inheritsFrom;

    ensureExists(outputDirectory, 0o744, err => {
        if (err) {
            console.log('Error creating directory', outputDirectory);
            console.log(err);
            return;
        }

        writeFileSync(path.resolve(outputDirectory, `${kebabCase(reactAPI.name)}.json`), JSON.stringify(reactAPI));

        console.log('Extracted JSON for', componentPath);
    });
});
