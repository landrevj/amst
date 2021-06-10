import React, { useState } from 'react';
import { sample } from 'lodash';
import { Link } from 'react-router-dom';
import { closestCenter, DndContext, DragEndEvent, DragOverlay, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates } from '@dnd-kit/sortable';

import { FileStub } from '../../../../db/entities';
import FilePreview from './Preview';
import { SearchQuery } from '../../UI/Search/Query';
import Sortable from '../../UI/DnD/Sortable';

interface FilePreviewListProps<QueryTypeProps, QueryTypeResults, QueryType>
{
  loading?: boolean;
  sorting?: boolean;
  onSort?: (f: FileStub[]) => void;
  files: FileStub[];
  query?: SearchQuery<QueryTypeProps, QueryTypeResults>;
  QueryConstructor?: new (q: QueryTypeProps | string, o?: boolean, d?: number) => QueryType;
}

const heights = ['h-24', 'h-28', 'h-32', 'h-36', 'h-40', 'h-44', 'h-48', 'h-52', 'h-56', 'h-60'];

export default function FilePreviewList<QueryTypeProps, QueryTypeResults, QueryType extends SearchQuery<QueryTypeProps, QueryTypeResults>>
({ loading, sorting, onSort, files, query, QueryConstructor }: FilePreviewListProps<QueryTypeProps, QueryTypeResults, QueryType>)
{
  const [activeFile, setActiveFile] = useState<FileStub | undefined>();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const indexStart = (query?.page && query?.limit) ? query.page * query.limit : 0;
  // eslint-disable-next-line react/no-array-index-key
  const placeholders = Array(5).fill('').map((_, i) => <div className={`max-h-72 bg-gray-200 rounded ${sample(heights)} animate-pulse`} key={i}/>);
  const filePreviews = files.map((file, i) => {
    if (sorting)
    {
      return (
        <Sortable key={file.id} id={file.id.toString()} index={i} items={files.map(f => f.id.toString())} activeId={activeFile?.id.toString()}>
          <FilePreview file={file} className={file.id === activeFile?.id ? 'opacity-25' : undefined} showName/>
        </Sortable>
      );
    }
    if (query && QueryConstructor)
    {
      // console.log('h', query);
      const nq = new QueryConstructor(query.props);
      nq.limit = 1;
      nq.page = indexStart + i;
      nq.parentInstanceID = query.instanceID;
      // console.log('nq', nq);
      return (
        <Link to={`/${query.route}/${file.id}?${nq.toString()}`} key={file.id}>
          <FilePreview file={file} showName/>
        </Link>
      );
    }

    return <FilePreview file={file} key={file.id} showName/>;
  });

  /// ////////////////////////////////////////////////////////////////////////////////

  function handleDragEnd({ active, over }: DragEndEvent)
  {
    if ( active.id !== over?.id)
    {
      const oldIndex = files.findIndex(f => f.id.toString() === active.id);
      const newIndex = files.findIndex(f => f.id.toString() === over?.id);

      if (onSort) onSort(arrayMove(files, oldIndex, newIndex));
    }
    setActiveFile(undefined);
  }

  return (
    <div className='grid grid-flow-row grid-cols-fill-48 gap-2'>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={({ active }) => setActiveFile(files.find(f => f.id.toString() === active.id))}
        onDragCancel={() => setActiveFile(undefined)}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={files.map(f => f.id.toString())}>
          {loading ? placeholders : filePreviews}
        </SortableContext>
        <DragOverlay className='cursor-move'>
          {activeFile ? <FilePreview file={activeFile} showName/> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

FilePreviewList.defaultProps = {
  loading: false,
  sorting: false,
  onSort: undefined,
  query: undefined,
  QueryConstructor: undefined,
};
