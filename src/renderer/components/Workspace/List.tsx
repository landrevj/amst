/* eslint-disable import/prefer-default-export */
import React from 'react';

import { WorkspaceStub } from '../../../db/entities';
import { WorkspaceWidget, WorkspaceWidgetSkeleton } from './Widget';

interface WorkspaceListProps
{
  workspaces?: WorkspaceStub[];
  loading?: boolean;
  onDelete?: (id: number) => void;
}

export function WorkspaceList({ workspaces, loading, onDelete }: WorkspaceListProps)
{
  return (
    <div className='grid grid-cols-1 xl:grid-cols-2 3xl:grid-cols-3 gap-2'>
      { !loading && workspaces ?
      workspaces.map((workspace) =>
        <WorkspaceWidget workspace={workspace} key={workspace.id} onDelete={onDelete}/>
      ) : (<>
        <WorkspaceWidgetSkeleton/>
        <WorkspaceWidgetSkeleton/>
      </>)}
    </div>
  );
}

WorkspaceList.defaultProps = {
  workspaces: [],
  onDelete: undefined,
  loading: undefined,
}
