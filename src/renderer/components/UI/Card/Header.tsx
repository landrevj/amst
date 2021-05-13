import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

interface PanelHeaderProps
{
  icon?: IconProp;
  text?: string;
  className?: string;
}

export default function PanelHeader({ icon, text, className }: PanelHeaderProps)
{
  return (
    <header className={`text-xl text-gray-500 space-x-2 ${className}`}>
      {icon ? <FontAwesomeIcon icon={icon}/> : null}
      <span>{text?.toLowerCase()}</span>
    </header>
  );
}

PanelHeader.defaultProps = {
  icon: undefined,
  text: '',
  className: '',
};
