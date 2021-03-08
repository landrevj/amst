import log from 'electron-log';
import setupIPCEmitters from './ipc';

if (process.env.NODE_ENV === 'development')
{
  log.transports.console.level = 'debug';
  log.info(`main.ts: Console logging transport set to: ${log.transports.console.level}`)
}

export default function main()
{
  setupIPCEmitters();
}
