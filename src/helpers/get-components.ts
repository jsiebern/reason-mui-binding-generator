import * as Path from 'path';
import * as Fs from 'fs';

const GetComponents = (): string[] => {
    const dir = Path.join(__dirname, '../', '../', 'output', 'json');
    const items = Fs.readdirSync(dir);

    return items.filter(item => item.lastIndexOf('.json') === item.length - 5 && item !== 'colors.json' && item !== 'icons.json' && item !== 'theme.json' && item !== 'theme-options.json').map(item => Fs.readFileSync(Path.join(dir, item), 'utf8'));
};

export default GetComponents;