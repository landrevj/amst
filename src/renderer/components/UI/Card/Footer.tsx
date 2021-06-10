import React from 'react';

interface CardFooterProps
{
  buttons?: boolean;
  className?: string;
  children: React.ReactNode;
}

export default function CardFooter({ buttons, className, children }: CardFooterProps)
{
  return (
    <footer className={`${buttons ? 'pt-2 -mb-2 flex flex-row justify-center text-lg text-gray-400 space-x-4' : '' } ${className}`}>
      {children}
    </footer>
  );
}

CardFooter.defaultProps = {
  buttons: false,
  className: '',
}
