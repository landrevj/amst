import React from 'react';

import { Workspace } from '../../entities';
import WorkspaceWidget from './Widget/Widget';

interface WorkspaceListProps
{
  workspaces: Workspace[];
}

export default function WorkspaceList({ workspaces }: WorkspaceListProps)
{
  return (
    <ul>
      {workspaces.map((workspace) =>
      <li key={workspace.id}>
        <WorkspaceWidget workspace={workspace}/>
      </li>)}
    </ul>
  );
}
