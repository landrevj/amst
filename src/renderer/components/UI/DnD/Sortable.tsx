import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableProps
{
  id: string;
  index: number;
  items: string[];
  activeId?: string;
  className?: string;
  children: React.ReactNode;
}

export default function Sortable({ id, index, items, activeId, className, children }: SortableProps)
{
  const {
    over,
    isSorting,
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    // this conditional prevents the layout from shifting while dragging
    transform: isSorting ? undefined : CSS.Transform.toString(transform),
    transition: transition || undefined,
  };

  function insertPosition(overIdx: number, activeIdx: number)
  {
    return overIdx > activeIdx ? 'insert-sortable-after' : 'insert-sortable-before';
  }

  const activeIndex = activeId ? items.indexOf(activeId) : -1;
  const overIndex   = over?.id ? items.indexOf(over?.id) : -1;
  const insertClass = id !== activeId && over?.id === id ? insertPosition(overIndex, activeIndex) : '';

  return (
    <div
      className={`relative ${insertClass} ${className}`}
      key={id}
      ref={setNodeRef}
      style={style}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...attributes} {...listeners}
    >

      <div
        className={`
          cursor-move
          absolute inset-0
          flex flex-row justify-center place-items-center
          rounded overflow-hidden
          text-white bg-black bg-opacity-50
          backdrop-filter backdrop-blur-[1px]
        `}
      >
        <span className='text-2xl'>{(index + 1).toLocaleString()}</span>
      </div>

      {children}
    </div>
  );
}

Sortable.defaultProps = {
  activeId: undefined,
  className: '',
};
