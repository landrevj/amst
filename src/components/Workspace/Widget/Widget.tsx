/* eslint-disable react/no-unused-state */ // TODO: remove after state is used
import React from 'react';
import { Link } from 'react-router-dom';

import { Folder, Workspace } from '../../../entities';
import FolderList from '../../Folder/List';

interface WorkspaceWidgetProps
{
  workspace: Workspace;
}

enum SpinnerState
{
  Idle = 'IDLE',
  Working = 'WORKING',
}

interface WorkspaceWidgetState
{
  folders: Folder[];
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
    let folders: Folder[] = [];
    if (workspace.folders.isInitialized())
      folders = workspace.folders.getItems();

    this.state = {
      folders,
      searchState: SpinnerState.Idle,
      lastFile: '',
    };

  }

  async componentDidMount()
  {
    const { workspace } = this.props;
    // if workspace.folders wasnt initialized when passed in we need to do so, then update the state so the widget re-renders
    if (!workspace.folders.isInitialized())
    {
      await workspace.folders.init();
      const folders = workspace.folders.getItems();
      this.setState({ folders });
    }
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
