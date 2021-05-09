import React from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowMaximize } from '@fortawesome/free-regular-svg-icons';
import { faTimes, faWindowMinimize } from '@fortawesome/free-solid-svg-icons';

import { IpcService } from '../../../utils/ipc';

function handleWindowAction(action: 'minimize' | 'maximize' | 'close')
{
  const ipc = new IpcService();
  ipc.send('renderer-window', { params: [action] });
}

interface TitlebarProps
{
  title?: string;
  className?: string;
}

export default function Titlebar({ title, className }: TitlebarProps)
{
  return (
    <div className={`titlebar w-screen flex flex-row place-items-center text-xs bg-gray-100 bg-opacity-10 text-white ${className}`}>
      <div className='px-2'>
        {title}
      </div>
      <div className='flex-grow'/>
      <div className='flex-none h-full no-drag flex flex-row w-32'>
        <button type='button' onClick={() => handleWindowAction('minimize')} className='flex-grow h-full hover:bg-white hover:bg-opacity-20 focus:ring-0'>
          <FontAwesomeIcon icon={faWindowMinimize}/>
        </button>
        <button type='button' onClick={() => handleWindowAction('maximize')} className='flex-grow h-full hover:bg-white hover:bg-opacity-20 focus:ring-0'>
          <FontAwesomeIcon icon={faWindowMaximize}/>
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
  className: '',
}
