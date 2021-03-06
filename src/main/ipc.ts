import { app, ipcMain } from 'electron';
import log from 'electron-log';

export default function setupIPCEmitters()
{

  ipcMain.on('get-app-path', (event, arg) => {
    log.debug(`ipcMain:get-app-path: called with: "${arg}"`);
    event.returnValue = app.getPath(arg);
  });

}
