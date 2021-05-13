// Check if the renderer and main bundles are built
import path from 'path';
import chalk from 'chalk';
import fs from 'fs';

const mainPath = path.join(__dirname, '../../src/main.prod.js');
const rendererRendererPath = getRendererPath('renderer');
const workerRendererPath = getRendererPath('worker');

if (!fs.existsSync(mainPath)) {
  throw new Error(
    chalk.whiteBright.bgRed.bold(
      'The main process is not built yet. Build it by running "yarn build:main"'
    )
  );
}

if (!fs.existsSync(rendererRendererPath)) {
  throw new Error(
    chalk.whiteBright.bgRed.bold(
      'The renderer process is not built yet. Build it by running "yarn build:renderer"'
    )
  );
}
if (!fs.existsSync(workerRendererPath)) {
  throw new Error(
    chalk.whiteBright.bgRed.bold(
      'The worker process is not built yet. Build it by running "yarn build:renderer"'
    )
  );
}

function getRendererPath(name)
{
  return path.join( __dirname, '..', '..', 'src', 'dist', `${name}.renderer.prod.js` );
}
