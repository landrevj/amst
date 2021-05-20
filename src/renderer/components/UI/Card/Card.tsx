import React from 'react';
import CardEmpty from './Empty';


interface CardProps
{
  layout?: 'flex' | 'grid';
  flexDirection?: 'row' | 'col';
  empty?: boolean;
  transparent?: boolean;
  translucent?: boolean | 'dashed';
  className?: string;
  children?: React.ReactNode;
}

export default function Card({ layout = 'flex', flexDirection = 'col', empty, transparent, translucent, className, children }: CardProps)
{
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
      ${layout} ${flexDirection === 'col' ? 'flex-col' : 'flex-row'}
      ${bgStyle} rounded
      ${transparent || translucent ? 'scrollbar-light' : ''} ${className}`}>

      <CardEmpty visible={empty === undefined ? false : empty} color={emptyStyle}/>
      {children}
    </div>
  );
}

Card.defaultProps = {
  layout: 'flex',
  flexDirection: 'col',
  empty: false,
  transparent: false,
  translucent: false,
  children: <></>,
  className: '',
};
