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
  return !loading && workspaces ? (
    <div className='flex flex-row flex-wrap place-content-start gap-2'>
      {workspaces.map((workspace) =>
      <WorkspaceWidget workspace={workspace} key={workspace.id} onDelete={onDelete}/>
      )}
    </div>
  ) : (
    <div className='flex flex-row flex-wrap place-content-start gap-2'>
      <WorkspaceWidgetSkeleton/>
      <WorkspaceWidgetSkeleton/>
    </div>
  );
}

WorkspaceList.defaultProps = {
  workspaces: [],
  onDelete: undefined,
  loading: undefined,
}
