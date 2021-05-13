import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { faTrashAlt } from '@fortawesome/free-regular-svg-icons';
// import log from 'electron-log';

import Client from '../../../utils/websocket/SocketClient';
import { WorkspaceStub, FolderStub } from '../../../db/entities';
import { MultiplePathPicker } from '../UI/MultiplePathPicker/MultiplePathPicker';

import { SocketRequestStatus } from '../../../utils/websocket';
import { isNumberArray } from '../../../utils';
import { CardSection, CardFooter } from '../UI/Card';

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

    this.handleClearForm = this.handleClearForm.bind(this);
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleAddToDB = this.handleAddToDB.bind(this);

    this.handlePathsChange  = this.handlePathsChange.bind(this);
  }

  handleClearForm()
  {
    this.setState({
      newName: '',
      newPaths: [''],
    })
  }

  handleNameChange({ target: { value } }: React.ChangeEvent<HTMLInputElement>)
  {
    this.setState({ newName: value });
  }

  async handleAddToDB()
  {
    const { newName, newPaths } = this.state;
    const paths = newPaths.filter((path) => { return path !== '' }) // dont add empty strings

    // TODO: use validations instead
    if (newName === '') return; // workspaces must have a name
    if (paths.length < 1) return; // must have at least one path

    const response = await Client.send<WorkspaceStub>('Workspace', { action: 'create', params: [newName, newPaths] });
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
            createdAt: '',
            updatedAt: '', // TODO: this is bad, just requery for the folders once that is set up
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

  handlePathsChange(newPaths: string[])
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
        <CardSection fullWidth>
          <input type="text" className='inline-block w-full text-sm px-2 py-1 rounded-full border-2 border-solid border-gray-300 placeholder-gray-400' value={newName} placeholder='name' onChange={this.handleNameChange}/>
        </CardSection>
        <CardSection fullWidth className='bg-gray-100'>
          <MultiplePathPicker pathArray={newPaths} onChange={this.handlePathsChange}/>
        </CardSection>
        <CardFooter buttons>
          <button type="button" className='hover:text-red-400' onClick={this.handleClearForm}>
            <FontAwesomeIcon icon={faTrashAlt}/>
          </button>
          <button type="button" className='hover:text-green-400' onClick={this.handleAddToDB}>
            <FontAwesomeIcon icon={faCheck}/>
          </button>
        </CardFooter>
      </>
    );
  }
};
