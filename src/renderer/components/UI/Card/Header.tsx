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
    <div className='text-xl text-gray-500 space-x-2 p-4 pb-0'>
      <FontAwesomeIcon icon={icon}/>
      <span>{text.toLowerCase()}</span>
    </div>
  );
}
