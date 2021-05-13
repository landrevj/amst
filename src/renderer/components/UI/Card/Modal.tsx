import React, { useEffect } from 'react';
import ReactModal from 'react-modal';

import Card from './Card';

interface CardModalProps
{
  empty?: boolean;
  transparent?: boolean;
  translucent?: boolean | 'dashed';
  className?: string;

  isOpen: boolean;
  onRequestClose?(event: React.MouseEvent | React.KeyboardEvent): void;
  children: React.ReactNode;
}

export default function CardModal({ empty, transparent, translucent, className, isOpen, onRequestClose, children }: CardModalProps)
{
  // https://github.com/reactjs/react-modal/issues/133#issuecomment-194034344
  useEffect(() => {
    ReactModal.setAppElement('body');
  }, []);

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      overlayClassName='fixed inset-0 top-6 bg-black bg-opacity-50 backdrop-filter backdrop-blur-sm'
      className='absolute inset-0 flex flex-col justify-center place-items-center h-full pointer-events-none focus:outline-none'
    >

      <Card
        empty={empty}
        transparent={transparent}
        translucent={translucent}
        className={`pointer-events-auto ${className}`}
      >
        {children}
      </Card>

    </ReactModal>
  );
}

CardModal.defaultProps = {
  empty: false,
  transparent: false,
  translucent: false,
  className: '',

  onRequestClose: undefined,
}
