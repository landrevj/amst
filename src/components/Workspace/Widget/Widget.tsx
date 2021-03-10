/* eslint-disable react/no-unused-state */ // TODO: remove after state is used
import React from 'react';
import { Link } from 'react-router-dom';

import { Workspace } from '../../../entities';

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
  searchState: SpinnerState;
  lastFile: string;
}

export default class WorkspaceWidget extends React.Component<WorkspaceWidgetProps, WorkspaceWidgetState>
{

  private name: string;

  constructor(props: WorkspaceWidgetProps)
  {
    super(props);

    this.name = props.workspace.name;

    this.state = {
      searchState: SpinnerState.Idle,
      lastFile: '',
    };
  }

  render()
  {
    const { workspace } = this.props;

    return (
      <div>
        <Link to={`/workspace/${workspace.id}`}>{workspace.name}</Link>
      </div>
    );
  }

}
