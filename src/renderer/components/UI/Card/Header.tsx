import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

interface PanelHeaderProps
{
  icon: IconProp;
  text: string;
}

export default function PanelHeader({ icon, text }: PanelHeaderProps)
{
  return (
    <header className='text-xl text-gray-500 space-x-2'>
      <FontAwesomeIcon icon={icon}/>
      <span>{text.toLowerCase()}</span>
    </header>
  );
}
