import React, { useEffect, useState } from 'react';
import { ipcRenderer, IpcRendererEvent } from 'electron';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowMaximize, faWindowRestore } from '@fortawesome/free-regular-svg-icons';
import { faTimes, faWindowMinimize } from '@fortawesome/free-solid-svg-icons';

import { IpcService } from '../../../shared/ipc';

function handleWindowAction(action: 'minimize' | 'maximize' | 'close')
{
  const ipc = new IpcService();
  ipc.send('renderer-window', { params: [action] });
}

export interface ITitlebarContext
{
  title: string;
  subtitle: string;
  setTitle: (t: string) => Promise<void>,
  setSubtitle: (s: string) => Promise<void>,
}

export const TitlebarContext = React.createContext<ITitlebarContext>({
  title: 'amst',
  subtitle: '',
  setTitle: async (_t: string) => {},
  setSubtitle: async (_s: string) => {},
});

interface TitlebarProps
{
  title?: string;
  subtitle?: string;
  className?: string;
}

export default function Titlebar({ title, subtitle, className }: TitlebarProps)
{
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const listener = (_: IpcRendererEvent, m: string) => {
      switch(m)
      {
        case 'maximized':
          setIsMaximized(true);
          break;
        case 'unmaximized':
          setIsMaximized(false);
          break;

        default:
          break;
      }
    };

    // jest complains about ipcRenderer being undefined here so use ?. for accessing things
    ipcRenderer?.on('window-action', listener);

    return () => { ipcRenderer?.removeListener('window-action', listener) };
  }, []);

  return (
    <div className={`titlebar fixed w-screen h-6 flex flex-row place-items-center text-xs bg-gray-100 bg-opacity-10 text-white ${className}`}>
      <span className='px-2'>
        {title}
      </span>
      <span className='flex-1 opacity-60 overflow-hidden whitespace-nowrap overflow-ellipsis'>{subtitle}</span>
      <div className='flex-none h-full no-drag flex flex-row w-32'>
        <button type='button' onClick={() => handleWindowAction('minimize')} className='flex-grow h-full hover:bg-white hover:bg-opacity-20 focus:ring-0'>
          <FontAwesomeIcon icon={faWindowMinimize}/>
        </button>
        <button type='button' onClick={() => handleWindowAction('maximize')} className='flex-grow h-full hover:bg-white hover:bg-opacity-20 focus:ring-0'>
          <FontAwesomeIcon icon={isMaximized ? faWindowRestore : faWindowMaximize}/>
        </button>
        <button type='button' onClick={() => handleWindowAction('close')} className='flex-grow h-full hover:bg-red-500 hover:bg-opacity-70 focus:ring-0 text-base'>
          <div className='flex flex-row justify-center'>
            <FontAwesomeIcon icon={faTimes}/>
          </div>
        </button>
      </div>
    </div>
  );
}

Titlebar.defaultProps = {
  title: 'amst',
  subtitle: '',
  className: '',
}
