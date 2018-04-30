import * as Path from 'path';
import * as rimraf from 'rimraf';

rimraf.sync(Path.join(__dirname, '../..', 'output', 'reason', '*.bs.js'));