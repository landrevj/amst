import React from 'react';
import { RouteComponentProps } from 'react-router';
import log from 'electron-log';

import DB from '../../utils/DB';
import { Workspace, Folder } from '../../entities';
import { MultiplePathPicker } from '../../components/UI/MultiplePathPicker/MultiplePathPicker';
import WorkspaceList from '../../components/Workspace/List';

import '../../App.global.scss';

interface HomeState
{
  workspaces: Workspace[];
  newName: string;
  newPaths: string[];
}

// eslint-disable-next-line import/prefer-default-export
export class Home extends React.Component<RouteComponentProps, HomeState>
{

  constructor(props: RouteComponentProps)
  {
    super(props);

    this.state = {
      workspaces: [],
      newName: '',
      newPaths: [''],
    };

    this.onNameChange         = this.onNameChange.bind(this);
    this.onClickAddToDB       = this.onClickAddToDB.bind(this);
    this.onClickResetDB       = this.onClickResetDB.bind(this);

    this.onPathsChange        = this.onPathsChange.bind(this);
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
      this.setState(prevState => ({
        workspaces: [...prevState.workspaces, workspace],
        newName: '',
        newPaths: [''],
      }));
    }

  }

  async onClickResetDB()
  {
    const { workspaces } = this.state;
    DB.em?.removeAndFlush(workspaces).then(() => {

      return this.setState({
        workspaces: [],
        newName: '',
      });

    });
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
    const { workspaces, newName, newPaths } = this.state;
    return (
      <>
        <h2>New workspace... {newName}</h2>
        <input type="text" value={newName} onChange={this.onNameChange}/>
        <button type="button" onClick={this.onClickAddToDB}>add</button>
        <button type="button" onClick={this.onClickResetDB}>reset</button>
        <hr/>
        <MultiplePathPicker pathArray={newPaths} onChange={this.onPathsChange}/>
        <hr/>
        <WorkspaceList workspaces={workspaces}/>
      </>
    );
  }
};
