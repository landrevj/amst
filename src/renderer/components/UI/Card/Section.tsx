import React from 'react';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface CardSectionProps
{
  header?: string;
  headerIcon?: IconProp;
  fullWidth?: boolean;
  className?: string;
  children: React.ReactNode;
}

export default function CardSection({ header, headerIcon, fullWidth, className, children }: CardSectionProps)
{
  const addHeader = header || headerIcon;
  const icon = headerIcon ? <FontAwesomeIcon className={header && headerIcon ? 'mr-1' : ''} icon={headerIcon}/> : <></>;
  let headerDiv = <></>;
  if (fullWidth && addHeader)
  {
    headerDiv = <p className='text-sm italic mb-4 text-gray-500 border-b-2 border-solid border-gray-300'>
      {icon}
      {header}
    </p>;
  }
  else if (!fullWidth && addHeader)
  {
    headerDiv = (
      <div className='absolute w-full top-0 px-4 left-0 flex flex-row justify-center transform -translate-y-1/2'>
        <span className='px-2 text-sm text-gray-400 bg-white rounded-full'>
          {icon}
          {header}
        </span>
      </div>
    );
  }

  return (
    <section className={`relative p-4 ${fullWidth ? '-mx-4': 'rounded'} ${className}`}>
      {headerDiv}
      {children}
    </section>
  );
}

CardSection.defaultProps = {
  header: undefined,
  headerIcon: undefined,
  fullWidth: false,
  className: '',
};
