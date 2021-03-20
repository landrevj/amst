import React from 'react';
// import log from 'electron-log';

import Client from '../../../utils/websocket/SocketClient';
import { WorkspaceStub, FolderStub } from '../../../db/entities';
import { MultiplePathPicker } from '../UI/MultiplePathPicker/MultiplePathPicker';

import '../../../App.global.scss';
import { SocketRequestStatus } from '../../../utils/websocket';
import { isNumberArray } from '../../../utils';

interface WorkspaceFormProps
{
  onSubmit: (newWorkspace: WorkspaceStub) => void;
}

interface WorkspaceFormState
{
  newName: string;
  newPaths: string[];
}

// eslint-disable-next-line import/prefer-default-export
export class WorkspaceForm extends React.Component<WorkspaceFormProps, WorkspaceFormState>
{

  constructor(props: WorkspaceFormProps)
  {
    super(props);

    this.state = {
      newName: '',
      newPaths: [''],
    };

    this.onNameChange   = this.onNameChange.bind(this);
    this.onClickAddToDB = this.onClickAddToDB.bind(this);

    this.onPathsChange  = this.onPathsChange.bind(this);
  }

  onNameChange({ target: { value } }: React.ChangeEvent<HTMLInputElement>)
  {
    this.setState({ newName: value });
  }

  async onClickAddToDB()
  {
    const { newName, newPaths } = this.state;
    const paths = newPaths.filter((path) => { return path !== '' }) // dont add empty strings

    // TODO: use validations instead
    if (newName === '') return; // workspaces must have a name
    if (paths.length < 1) return; // must have at least one path

    const response = await Client.send<WorkspaceStub>('Workspace', { action: 'createWorkspaces', params: [newName, newPaths] });
    const success = response.status === SocketRequestStatus.SUCCESS;

    // if we got a workspace back from the transaction then we can add it to the state
    if (success && response.data)
    {
      const workspace = response.data;
      // we probably didn't get the folders back on the response so just merge them in.
      // since we got a SUCCESS back above it means the entire DB transaction went through
      // so we shouldnt have to worry about things being out of sync
      if (isNumberArray(workspace.folders) && workspace.folders?.length)
      {
        workspace.folders = workspace.folders.map((id: number, index: number) => {
          const fs: FolderStub = {
            id,
            path: newPaths[index],
          };
          return fs;
        });
      }

      const { onSubmit } = this.props;
      onSubmit(workspace);

      this.setState({
        newName: '',
        newPaths: [''],
      });
    }
  }

  onPathsChange(newPaths: string[])
  {
    this.setState({
      newPaths,
    });
    // log.info(newPaths);
  }

  render()
  {
    const { newName, newPaths } = this.state;
    return (
      <>
        <h2>New workspace... {newName}</h2>
        <input type="text" value={newName} onChange={this.onNameChange}/>
        <button type="button" onClick={this.onClickAddToDB}>add</button>
        <hr/>
        <MultiplePathPicker pathArray={newPaths} onChange={this.onPathsChange}/>
      </>
    );
  }
};
