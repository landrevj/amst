import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { Link } from 'react-router-dom';

interface PanelHeaderProps
{
  icon?: IconProp;
  text?: string;
  linkTo?: string;
  inset?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export default function PanelHeader({ inset, icon, text, linkTo, className, children }: PanelHeaderProps)
{
  return (
    <header className={`flex flex-row w-full ${inset ? '-mt-4' : ''} ${className}`}>

      {icon || linkTo || text ?
      <div className='text-xl text-gray-600 space-x-2'>
        {icon ? <FontAwesomeIcon icon={icon}/> : null}
        {linkTo ?
        <Link to={linkTo}>{text?.toLowerCase()}</Link>
        :
        <span>{text?.toLowerCase()}</span>}
      </div> : null}

      {children}
    </header>
  );
}

PanelHeader.defaultProps = {
  inset: undefined,
  icon: undefined,
  text: '',
  linkTo: undefined,
  className: '',
  children: undefined,
};
