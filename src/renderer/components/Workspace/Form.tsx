import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faFileArchive, faFilter, faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import { faTrashAlt } from '@fortawesome/free-regular-svg-icons';
// import log from 'electron-log';

import Client from '../../../shared/websocket/SocketClient';
import { WorkspaceStub, FolderStub } from '../../../db/entities';
import { MultiplePathPicker } from '../UI/Inputs/MultiplePathPicker/MultiplePathPicker';

import { SocketRequestStatus } from '../../../shared/websocket';
import { isNumberArray } from '../../../utils';
import { CardSection, CardFooter } from '../UI/Card';
import Switch from '../UI/Inputs/Switch';

interface WorkspaceFormProps
{
  onSubmit: (newWorkspace: WorkspaceStub) => void;
}

interface WorkspaceFormState
{
  newName: string;
  newPaths: string[];
  searchArchives: boolean;
  groupArchiveContents: boolean;
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
      searchArchives: false,
      groupArchiveContents: false,
    };

    this.handleClearForm = this.handleClearForm.bind(this);
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleAddToDB = this.handleAddToDB.bind(this);

    this.handlePathsChange  = this.handlePathsChange.bind(this);
    this.handleSearchArchivesChange = this.handleSearchArchivesChange.bind(this);
    this.handleGroupArchiveContentsChange = this.handleGroupArchiveContentsChange.bind(this);
  }

  handleClearForm()
  {
    this.setState({
      newName: '',
      newPaths: [''],
      searchArchives: false,
      groupArchiveContents: false,
    });
  }

  handleNameChange({ target: { value } }: React.ChangeEvent<HTMLInputElement>)
  {
    this.setState({ newName: value });
  }

  async handleAddToDB()
  {
    const { newName, newPaths, searchArchives, groupArchiveContents } = this.state;
    const paths = newPaths.filter((path) => { return path !== '' }) // dont add empty strings

    // TODO: use validations instead
    if (newName === '') return; // workspaces must have a name
    if (paths.length < 1) return; // must have at least one path

    const response = await Client.send<WorkspaceStub>('Workspace', { action: 'create', params: [newName, newPaths, searchArchives, groupArchiveContents] });
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

      this.handleClearForm();
    }
  }

  handlePathsChange(newPaths: string[])
  {
    this.setState({
      newPaths,
    });
    // log.info(newPaths);
  }

  handleSearchArchivesChange(switchState: boolean)
  {
    this.setState({
      searchArchives: switchState,
      groupArchiveContents: false,
    });
  }

  handleGroupArchiveContentsChange(switchState: boolean)
  {
    this.setState({
      groupArchiveContents: switchState,
    });
  }

  render()
  {
    const { newName, newPaths, searchArchives, groupArchiveContents } = this.state;
    return (
      <>
        <CardSection fullWidth>
          <input type="text" className='inline-block w-full text-sm px-2 py-1 rounded-full border-2 border-solid border-gray-300 placeholder-gray-400' value={newName} placeholder='name' onChange={this.handleNameChange}/>
        </CardSection>
        <CardSection fullWidth className='bg-gray-100'>
          <MultiplePathPicker pathArray={newPaths} onChange={this.handlePathsChange}/>
        </CardSection>
        <CardSection fullWidth header='options' headerIcon={faFilter} className='bg-gray-200 space-y-2' >
          <Switch checked={searchArchives} id='search-archives' onChange={this.handleSearchArchivesChange}>
            <span className='ml-2'>
              search within zip archives
              <FontAwesomeIcon className='fill-current text-gray-400 ml-2' icon={faFileArchive}/>
            </span>
          </Switch>
          <Switch checked={groupArchiveContents} disabled={!searchArchives} id='group-archives' onChange={this.handleGroupArchiveContentsChange}>
            <span className='ml-2'>
              group archive contents
              <FontAwesomeIcon className='fill-current text-gray-400 ml-2' icon={faLayerGroup}/>
            </span>
          </Switch>
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
