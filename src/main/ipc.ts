import { app, ipcMain, dialog } from 'electron';
import log from 'electron-log';

export default function setupIPCEmitters()
{

  ipcMain.on('get-app-path', (event, arg) => {
    log.debug(`ipcMain:get-app-path: called with: "${arg}"`);
    event.returnValue = app.getPath(arg);
  });


  ipcMain.on('open-dialog', async (event, arg) => {
    log.debug(`ipcMain:open-dialog: called with: "${arg}"`);
    const val = await dialog.showOpenDialog({
      properties: [arg],
    });

    event.reply('open-dialog-return', val);
  });
}
