import React from 'react';
// import log from 'electron-log';

import DB from '../../utils/DB';
import { Workspace, Folder } from '../../entities';
import { MultiplePathPicker } from '../UI/MultiplePathPicker/MultiplePathPicker';

import '../../App.global.scss';

interface WorkspaceFormProps
{
  onSubmit: (newWorkspace: Workspace) => void;
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

    this.onNameChange         = this.onNameChange.bind(this);
    this.onClickAddToDB       = this.onClickAddToDB.bind(this);

    this.onPathsChange        = this.onPathsChange.bind(this);
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

    // use a transaction in case the user violates uniqueness constraints
    const workspace = await DB.em?.transactional<Workspace>(em => {

      const newWorkspace = new Workspace(newName);

      paths.forEach((path) => {
        const folder = new Folder(path);
        newWorkspace.folders.add(folder);
      });

      em.persist(newWorkspace);

      return new Promise(resolve => {
        resolve(newWorkspace);
      });

    });

    // if we got a workspace back from the transaction then we can add it to the state
    if (workspace)
    {
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
