import React from 'react';

interface CardSectionProps
{
  className?: string;
  children: React.ReactNode;
}

export default function CardSection({ className, children }: CardSectionProps)
{
  return (
    <section className={`p-4 -mx-4 ${className}`}>
      {children}
    </section>
  );
}

CardSection.defaultProps = {
  className: '',
};
