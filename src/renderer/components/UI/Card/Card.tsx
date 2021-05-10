import { IconProp } from '@fortawesome/fontawesome-svg-core';
import React from 'react';
import CardEmpty from './CardEmpty';

import PanelHeader from './Header';

interface CardProps
{
  flexDirection?: 'row' | 'col';
  icon?: IconProp;
  text?: string;
  empty?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export default function Card({ flexDirection = 'col', icon, text, empty, className, children }: CardProps)
{
  const header = icon && text ? <PanelHeader icon={icon} text={text}/> : <></>

  return (
    <div className={`relative max-h-full overflow-auto flex ${flexDirection === 'col' ? 'flex-col' : 'flex-row'} bg-white rounded ${className}`}>
      <CardEmpty display={empty === undefined ? false : empty}/>
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
  children: <></>,
  className: '',
};
