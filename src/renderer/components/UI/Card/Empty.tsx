import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBan } from '@fortawesome/free-solid-svg-icons';

interface CardEmptyProps
{
  visible?: boolean;
  color?: 'light' | 'dark';
}

export default function CardEmpty({ visible, color }: CardEmptyProps)
{
  const iconColorClass = color === 'light' ? 'text-white' : '';

  const e = visible ? (
    <div className='absolute inset-0 pointer-events-none'>
      <div className='w-full h-full overflow-hidden flex flex-col justify-end'>
        <div className='relative pb-[50%] w-1/2 transform translate-x-[-5%] translate-y-[5%] scale-125'>
          <FontAwesomeIcon className={`absolute bottom-0 left-0 !w-full !h-full opacity-5 ${iconColorClass}`} icon={faBan}/>
        </div>
      </div>
    </div>
  ) : <></>;

  return e;
}
