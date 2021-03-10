import React from 'react';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import log from 'electron-log';

import DB from '../../utils/DB';
import { Workspace, File } from '../../entities';
import FileList from '../../components/File/List';

import '../../App.global.scss';

interface WorkspaceViewRouteParams
{
  id: string;
}
type WorkspaceViewProps = RouteComponentProps<WorkspaceViewRouteParams>;

interface WorkspaceViewState
{
  id: number;
  files: File[];
}


// eslint-disable-next-line import/prefer-default-export
export class WorkspaceView extends React.Component<WorkspaceViewProps, WorkspaceViewState>
{
  private workspace!: Workspace; // can use definite assignment since we load the workspace in the constructor?

  constructor(props: WorkspaceViewProps)
  {
    super(props);

    const { match: { params: { id } } } = this.props;
    this.state = {
      id: parseInt(id, 10),
      files: [],
    }

    this.loadWorkspace(parseInt(id, 10));
  }

  async componentDidUpdate(prevProps: WorkspaceViewProps, prevState: WorkspaceViewState)
  {
    const { id } = this.state;
    if (prevState.id !== id)
      this.loadWorkspace(id);
  }

  async loadWorkspace(id: number)
  {
    const workspace = await DB.em?.findOne(Workspace, { id }, ['files']);

    if (workspace)
    {
      this.workspace = workspace;
      // const d: string = Date.now().toString();
      // workspace?.files.add(new File(d, 'fake', `C:/${d}.fake`));
      // await DB.em?.flush();

      const files = workspace?.files.getItems();

      if (files)
      {
        this.setState({
          files,
        });
      }
      else log.error(`Failed to get files from workspace with given id: ${id}`);
    }
  }

  render()
  {
    const { name }  = this.workspace || "Loading...";
    const { files } = this.state;
    return (
      <>
        <h3>{name}&apos;s files...</h3>
        <FileList files={files}/>
        <Link to='/'>Back</Link>
      </>
    );
  }

};
