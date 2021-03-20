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
    <ul>
      {workspaces.map((workspace) =>
      <li key={workspace.id}>
        <WorkspaceWidget workspace={workspace}/>
      </li>
      )}
    </ul>
  );
}
