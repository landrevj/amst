import React from 'react';
import Titlebar from '../components/Titlebar/Titlebar';

interface LayoutProps
{
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps)
{
  return (
    <div className='flex flex-col h-screen w-screen'>
      <Titlebar title='amst' className='fixed h-6'/>
      <div className='flex-grow overflow-hidden mt-6'>
        {children}
      </div>
    </div>
  )
}
