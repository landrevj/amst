import React from 'react';
import { RouteComponentProps } from 'react-router';
import log from 'electron-log';

import DB from '../../utils/DB';
import { Workspace } from '../../entities';
import { WorkspaceForm, WorkspaceList } from '../../components/Workspace';

import '../../App.global.scss';

interface HomeState
{
  workspaces: Workspace[];
}

// eslint-disable-next-line import/prefer-default-export
export class Home extends React.Component<RouteComponentProps, HomeState>
{

  constructor(props: RouteComponentProps)
  {
    super(props);

    this.state = {
      workspaces: [],
    };

    this.onClickResetDB        = this.onClickResetDB.bind(this);
    this.onSubmitWorkspaceForm = this.onSubmitWorkspaceForm.bind(this);
  }

  async componentDidMount()
  {
    const workspaces = await DB.em?.find(Workspace, {});
    if (workspaces)
    {
      this.setState({
        workspaces,
      });
    }
    else log.error(`Home.tsx: Failed to load Workspaces.`);
  }

  async onClickResetDB()
  {
    const { workspaces } = this.state;
    DB.em?.removeAndFlush(workspaces).then(() => {

      return this.setState({
        workspaces: [],
      });

    });
  }

  onSubmitWorkspaceForm(newWorkspace: Workspace)
  {
    const { workspaces } = this.state;
    this.setState({
      workspaces: [...workspaces, newWorkspace],
    });
  }

  render()
  {
    const { workspaces } = this.state;
    return (
      <>
        <button type="button" onClick={this.onClickResetDB}>reset</button>
        <WorkspaceForm onSubmit={this.onSubmitWorkspaceForm}/>
        <hr/>
        <WorkspaceList workspaces={workspaces}/>
      </>
    );
  }
};
