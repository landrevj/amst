import React, { useEffect, useState } from 'react';
import { ipcRenderer, IpcRendererEvent } from 'electron';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowMaximize, faWindowRestore } from '@fortawesome/free-regular-svg-icons';
import { faMinus, faSort, faTimes, faWindowMinimize } from '@fortawesome/free-solid-svg-icons';

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
  mode?: 'default' | 'mac';
  title?: string;
  subtitle?: string;
  className?: string;
}

export default function Titlebar({ mode = 'default', title, subtitle, className }: TitlebarProps)
{
  const [isMaximized, setIsMaximized] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const listener = (_: IpcRendererEvent, m: string) => {
      switch(m)
      {
        // window maximization
        case 'maximized':
          setIsMaximized(true);
          break;
        case 'unmaximized':
          setIsMaximized(false);
          break;

        // window focus
        case 'focus':
          setIsFocused(true);
          break;
        case 'blur':
          setIsFocused(false);
          break;

        default:
          break;
      }
    };

    // jest complains about ipcRenderer being undefined here so use ?. for accessing things
    ipcRenderer?.on('window-event', listener);

    return () => { ipcRenderer?.removeListener('window-event', listener) };
  }, []);

  return (
    <div className={`titlebar fixed w-screen h-6 flex flex-row place-items-center text-xs bg-gray-100 bg-opacity-10 text-white ${className}`}>
      <span className='px-2'>
        {title}
      </span>
      <span className='flex-1 opacity-60 overflow-hidden whitespace-nowrap overflow-ellipsis'>{subtitle}</span>
      {mode === 'default' ?
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
        :
        <div className='flex-none h-full no-drag flex flex-row gap-3 pr-3 group'>
          <button type='button' onClick={() => handleWindowAction('close')} className='h-full focus:ring-0'>
            <div
              className={`
                w-[14px] h-[14px]
                flex flex-col place-items-center justify-center
                rounded-full
                ring-2 ring-opacity-5 ring-black
                group-hover:bg-gradient-to-t
                from-red-500 to-red-400
                ${isFocused ? 'bg-gradient-to-t' : 'bg-gray-300'}
              `}
            >
              <FontAwesomeIcon className='fill-current text-black text-opacity-40 invisible group-hover:visible' icon={faTimes}/>
            </div>
          </button>
          <button type='button' onClick={() => handleWindowAction('minimize')} className='h-full focus:ring-0'>
            <div
              className={`
                w-[14px] h-[14px]
                flex flex-col place-items-center justify-center
                rounded-full
                ring-2 ring-opacity-5 ring-black
                group-hover:bg-gradient-to-t
                from-yellow-500 to-yellow-400
                ${isFocused ? 'bg-gradient-to-t' : 'bg-gray-300'}
              `}
            >
              <FontAwesomeIcon className='fill-current text-black text-opacity-40 invisible group-hover:visible' icon={faMinus}/>
            </div>
          </button>
          <button type='button' onClick={() => handleWindowAction('maximize')} className='h-full focus:ring-0'>
            <div
              className={`
                w-[14px] h-[14px]
                flex flex-col place-items-center justify-center
                rounded-full
                ring-2 ring-opacity-5 ring-black
                group-hover:bg-gradient-to-t
                from-green-500 to-green-400
                ${isFocused ? 'bg-gradient-to-t' : 'bg-gray-300'}
              `}
            >
              <FontAwesomeIcon className='fill-current text-black text-opacity-40 invisible group-hover:visible transform rotate-45' icon={faSort}/>
            </div>
          </button>
        </div>
        }
    </div>
  );
}

Titlebar.defaultProps = {
  mode: 'default',
  title: 'amst',
  subtitle: '',
  className: '',
}
