import { IconProp } from '@fortawesome/fontawesome-svg-core';
import React from 'react';

import PanelHeader from './Header';

interface PanelCardProps
{
  icon: IconProp;
  text: string;
  className?: string;
  children?: React.ReactNode;
}

export default function PanelCard({ icon, text, className, children }: PanelCardProps)
{
  return (
    <div className={`max-h-full overflow-auto flex flex-col bg-white rounded ${className}`}>
      <PanelHeader icon={icon} text={text}/>
      {children}
    </div>
  );
}

PanelCard.defaultProps = {
  children: <></>,
  className: '',
};
