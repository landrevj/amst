import React, { useCallback, useState } from 'react';
import { IpcService } from '../../shared/ipc';
import Titlebar, { TitlebarContext } from '../components/Titlebar/Titlebar';

interface LayoutProps
{
  children: React.ReactNode;
}

const ipc = new IpcService();

export default function Layout({ children }: LayoutProps)
{
  const [titlebarTitle, setTitlebarTitleState] = useState('amst');
  const [titlebarSubtitle, setTitlebarSubtitleState] = useState('');

  const setTitlebarTitle = useCallback(async (s: string) => {
    setTitlebarTitleState(s);
    await ipc.send<string>('window-title', { params: [s] })
  }, []);
  const setTitlebarSubtitle = useCallback(async (s: string) => {
    setTitlebarSubtitleState(s);
    await ipc.send<string>('window-title', { params: [s] })
  }, []);

  return (
    <TitlebarContext.Provider value={{
      title: titlebarTitle,
      subtitle: titlebarSubtitle,
      setTitle: setTitlebarTitle,
      setSubtitle: setTitlebarSubtitle
    }}>

      <div className='flex flex-col h-screen w-screen'>
        <Titlebar title={titlebarTitle} subtitle={titlebarSubtitle} className='fixed h-6'/>
        <div className='flex-grow overflow-hidden mt-6'>
          {children}
        </div>
      </div>

    </TitlebarContext.Provider>
  )
}
