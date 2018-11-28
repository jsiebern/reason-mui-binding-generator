import * as Fs from 'fs';
import * as Path from 'path';

const GetIcons = (): string[] => JSON.parse(Fs.readFileSync(Path.join(__dirname, '../', 'output', 'json', 'icons.json'), 'utf8'));

const RenderIcons = () => {
    const icons = GetIcons();

    return `
        [@bs.deriving jsConverter]
        type t = [
            ${icons.map(iconName => `|  \`${iconName} `).join('\n')}
        ];
    `;
};

export default RenderIcons();