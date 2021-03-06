import * as path from 'path';
import * as util from './util';
import * as vscode from 'vscode';

//
// Gem class that knows where a gem lives and its label.
//

export class Gem {
  // where is the gem?
  readonly dir: string;

  constructor(dir: string) {
    this.dir = dir;
    if (!dir.startsWith('/')) {
      throw new Error(`gem.list failed, line '${dir}'`);
    }
  }

  // What is this gem called?
  get label() {
    if (!this._label) {
      this._label = path.basename(this.dir);
    }
    return this._label;
  }
  private _label: string | undefined;

  // List gems using bundle show --paths.
  static async list(): Promise<Gem[]> {
    const rootPath = <string>vscode.workspace.rootPath;
    const cmd = <string>vscode.workspace.getConfiguration('bustagem.cmd').get('bundle');
    const options = { timeout: util.seconds(3), cwd: rootPath };
    const stdout = await util.exec(cmd, options);
    if (stdout.length === 0) {
      throw new Error(`gem.list failed, ${cmd} didn't return anything.`);
    }
    const dirs = stdout.trim().split('\n').filter((path) => { return path.startsWith('/') });
    return dirs.map(dir => new Gem(dir));
  }
}
