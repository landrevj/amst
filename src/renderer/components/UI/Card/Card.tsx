import { IconProp } from '@fortawesome/fontawesome-svg-core';
import React from 'react';
import CardEmpty from './Empty';

import PanelHeader from './Header';

interface CardProps
{
  flexDirection?: 'row' | 'col';
  icon?: IconProp;
  text?: string;
  empty?: boolean;
  transparent?: boolean;
  translucent?: boolean | 'dashed';
  className?: string;
  children?: React.ReactNode;
}

export default function Card({ flexDirection = 'col', icon, text, empty, transparent, translucent, className, children }: CardProps)
{
  const header = icon && text ? <PanelHeader icon={icon} text={text}/> : <></>;
  let bgStyle = 'bg-white';
  let emptyStyle: 'light' | 'dark' = 'dark';
  if (transparent)
  {
    bgStyle = 'bg-transparent';
    emptyStyle = 'light';
  }
  else if (translucent)
  {
    bgStyle += ' bg-opacity-10';
    emptyStyle = 'light';

    if (translucent === 'dashed') bgStyle += ' border-2 border-dashed border-white';
  }

  return (
    <div className={`relative max-h-full overflow-auto p-4
      flex ${flexDirection === 'col' ? 'flex-col' : 'flex-row'}
      ${bgStyle} rounded
      ${transparent || translucent ? 'scrollbar-light' : ''} ${className}`}>

      <CardEmpty visible={empty === undefined ? false : empty} color={emptyStyle}/>
      {header}
      {children}
    </div>
  );
}

Card.defaultProps = {
  flexDirection: 'col',
  icon: undefined,
  text: undefined,
  empty: false,
  transparent: false,
  translucent: false,
  children: <></>,
  className: '',
};
