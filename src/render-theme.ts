import * as Path from 'path';
import { Project } from 'ts-simple-ast';

import Converter from './classes/interface-converter';

const RenderTheme = () => {
    const project = new Project();

    const stylesPath = Path.join(__dirname, '../', 'extract/core/styles');
    project.addExistingSourceFiles(Path.join(stylesPath, '**/*.d.ts'));
    project.resolveSourceFileDependencies();

    const themeConverter = new Converter(project.getSourceFileOrThrow('createMuiTheme.d.ts'), 'Theme');
    const themeOptionsConverter = new Converter(project.getSourceFileOrThrow('createMuiTheme.d.ts'), 'ThemeOptions');
    return {
        theme: themeConverter.parse(),
        themeOptions: themeOptionsConverter.parse(),
    };
}

export default RenderTheme;