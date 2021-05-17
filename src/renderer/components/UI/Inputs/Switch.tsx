import React from 'react';

interface SwitchProps
{
  checked: boolean;
  disabled?: boolean;
  id: string;
  onChange?: (state: boolean) => void;
  className?: string;
  children?: React.ReactNode;
}

// https://codepen.io/lhermann/pen/EBGZRZ
export default function Switch({ checked, disabled, id, onChange, className, children }: SwitchProps)
{
  return (
    <label htmlFor={`toggle-${id}`} className={`flex items-center cursor-pointer ${disabled ? 'opacity-50' : ''} ${className}`}>

      <div className='relative'>
        <input checked={checked} disabled={disabled} type='checkbox' id={`toggle-${id}`} className='sr-only' onChange={() => onChange && onChange(!checked)}/>
        <div className='toggle-bg block bg-gray-400 w-10 h-6 rounded-full'/>
        <div className='toggle-dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition'/>
      </div>

      {children}
    </label>
  );
}

Switch.defaultProps = {
  className: '',
  disabled: undefined,
  children: undefined,
  onChange: undefined,
}
