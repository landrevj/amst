import React from 'react';
import ClickToEditInput from '../ClickToEdit/Input';

interface PaginationPageInputProps
{
  currentPage: number;
  maxPage: number;
  goToPage: (p: number) => void;
  className?: string;
}

export default function PaginationPageInput({ currentPage, maxPage, goToPage, className }: PaginationPageInputProps)
{
  return (
    <div className={className}>
      <ClickToEditInput
        inputClassName='text-right'
        buttonClassName='text-gray-400 hover:text-blue-400'
        type='text'
        value={(currentPage + 1).toString()}
        onSave={(value: string) => goToPage(parseInt(value, 10) - 1)}
        onValidateSave={(value: string) => {
          const p = parseInt(value, 10 );
          if (value !== '' && (p > 0 && p <= maxPage + 1)) return true;
          return false;
        }}
        onValidateChange={(value: string) => {
          const p = parseInt(value, 10 );
          if (value === '' || (value.match(/^\d+$/) && p > 0 && p <= maxPage + 1)) return true;
          return false;
        }}
        useContentWidth/>

      <span>/</span>
      <span>{maxPage + 1}</span>
    </div>
  )
}

PaginationPageInput.defaultProps = {
  className: '',
}
