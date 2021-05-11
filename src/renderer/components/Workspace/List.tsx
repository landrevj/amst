/* eslint-disable import/prefer-default-export */
import React from 'react';

import { WorkspaceStub } from '../../../db/entities';
import WorkspaceWidget from './Widget/Widget';

interface WorkspaceListProps
{
  workspaces: WorkspaceStub[];
}

export function WorkspaceList({ workspaces }: WorkspaceListProps)
{
  return (
    <div className='flex flex-row flex-wrap place-content-start gap-2'>
      {workspaces.map((workspace) =>
      <WorkspaceWidget workspace={workspace} key={workspace.id}/>
      )}
    </div>
  );
}
