import * as rimraf from 'rimraf';

import path from 'path';
import { mkdir, readFileSync, writeFileSync } from 'fs';
import kebabCase from 'lodash/kebabCase';
import * as reactDocgen from 'react-docgen';
import getStylesCreator from './../core/styles/getStylesCreator';
import createMuiTheme from './../core/styles/createMuiTheme';
import * as colors from './../core/colors';


import findComponents from './find-components';
import ensureExists from './ensure-folder-exists';

const MuiPath = path.resolve(__dirname, '../', 'core');

const components = findComponents();
const theme = createMuiTheme();
const rootDirectory = MuiPath;
const outputDirectory = path.join(__dirname, '../../', 'output', 'json');

rimraf.sync(path.join(outputDirectory, '*.json'));

components.forEach(componentPath => {
    const src = readFileSync(componentPath, 'utf8');

    if (src.match(/@ignore - internal component\./) || src.match(/@ignore - do not document\./)) {
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
    reactAPI.importPath = `@material-ui/core/${componentPath.replace(`${rootDirectory}/`, '').replace('.js', '')}`;

    // Inheritance
    const inheritedComponentRegexp = /\/\/ @inheritedComponent (.*)/;
    const inheritedComponent = src.match(inheritedComponentRegexp);
    const inheritsFrom = !inheritedComponent ? '' : inheritedComponent[1];
    reactAPI.inheritsFrom = inheritsFrom;

    if (typeof reactAPI.props.classes !== 'undefined') {
        reactAPI.props.classes.flowType = {
            "name": "classes",
            "elements": reactAPI.styles.classes
        };
    }

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

ensureExists(outputDirectory, 0o744, err => {
    if (err) {
        console.log('Error creating directory', outputDirectory);
        console.log(err);
        return;
    }

    writeFileSync(path.resolve(outputDirectory, `colors.json`), JSON.stringify(colors));

    console.log('Extracted JSON for Colors');
});