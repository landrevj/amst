import log from 'electron-log';
import QueryString from 'query-string';

// TODO: these conditional imports are probably what is causing the few couple errors on the renderer window
//       with WDS and socket.io not connecting initially.
async function initRenderer()
{
  const Renderer = await import('./renderer');
  Renderer.main();
}

async function initWorker()
{
  const Worker = await import('./worker');
  Worker.main();
}

const queryData  = QueryString.parse(global.location.search);
const windowType = queryData.type;

switch (windowType)
{
  case "renderer":
    log.info('index.tsx: Renderer window.');
    initRenderer();
    break;
  case "worker":
    log.info('index.tsx: Worker window.');
    initWorker();
    break;
  default:
    log.error(`index.tsx: Passed windowType "${windowType}" was not valid.`);
    break;
}
