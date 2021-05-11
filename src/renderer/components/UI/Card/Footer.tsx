import React from 'react';

interface CardFooterProps
{
  className?: string;
  children: React.ReactNode;
}

export default function CardFooter({ className, children }: CardFooterProps)
{
  return (
    <footer className={`pt-2 -mb-2 ${className}`}>
      {children}
    </footer>
  );
}

CardFooter.defaultProps = {
  className: '',
}
