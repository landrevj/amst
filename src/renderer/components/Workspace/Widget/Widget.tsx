/* eslint-disable react/no-unused-state */ // TODO: remove after state is used
import React from 'react';
import { Link } from 'react-router-dom';

import { FolderStub, WorkspaceStub } from '../../../../db/entities';
import { isNumberArray } from '../../../../utils';
import FolderList from '../../Folder/List';

interface WorkspaceWidgetProps
{
  workspace: WorkspaceStub;
}

enum SpinnerState
{
  Idle = 'IDLE',
  Working = 'WORKING',
}

interface WorkspaceWidgetState
{
  folders: FolderStub[];
  searchState: SpinnerState;
  lastFile: string;
}

export default class WorkspaceWidget extends React.Component<WorkspaceWidgetProps, WorkspaceWidgetState>
{

  constructor(props: WorkspaceWidgetProps)
  {
    super(props);

    const { workspace } = this.props;

    // if workspace.folders was initalized when passed in, set it as the initial state
    let folders: FolderStub[] = [];
    if (!isNumberArray(workspace.folders) && workspace.folders?.length)
      folders = workspace.folders;

    this.state = {
      folders,
      searchState: SpinnerState.Idle,
      lastFile: '',
    };

  }

  render()
  {
    const { workspace } = this.props;
    const { folders }   = this.state;

    return (
      <div>
        <Link to={`/workspace/${workspace.id}`}>{workspace.name}</Link>
        <FolderList folders={folders}/>
      </div>
    );
  }

}
