import React from 'react';
import { RouteComponentProps } from 'react-router';
import { ipcRenderer, OpenDialogReturnValue } from 'electron';
import log from 'electron-log';

import DB from '../../utils/DB';
import { Workspace } from '../../entities';
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

    this.onClickIncrementPath = this.onClickIncrementPath.bind(this);
    this.onPathChange         = this.onPathChange.bind(this);
    this.onClickRemovePath    = this.onClickRemovePath.bind(this);
    this.onClickBrowseForPath = this.onClickBrowseForPath.bind(this);
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
    const { newName } = this.state;
    const workspace = new Workspace(newName);

    DB.em?.persistAndFlush([workspace]).then(() => {

      return this.setState(prevState => ({
        workspaces: [...prevState.workspaces, workspace],
        newName: '',
        newPaths: [''],
      }));

    });
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

  onClickIncrementPath()
  {
    const { newPaths } = this.state;
    this.setState({
      newPaths: [...newPaths, ''],
    })
  }

  onClickRemovePath({ currentTarget: { dataset: { index } } }: React.MouseEvent<HTMLButtonElement>)
  {
    if (!index)
    {
      log.error('Home.tsx: onClickRemovePath called but no data-index was set on the target button.');
      return;
    }

    const { newPaths } = this.state;
    if (newPaths.length > 1)
    {
      newPaths.splice(parseInt(index, 10), 1)
      this.setState({
        newPaths,
      });
    }
    // log.info(this.state.newPaths);
  }

  onPathChange({ target: { value, dataset: { index } } }: React.ChangeEvent<HTMLInputElement>)
  {
    if (!index)
    {
      log.error('Home.tsx: onPathChange called but no data-index was set on the target input.');
      return;
    }

    const { newPaths } = this.state;
    newPaths[parseInt(index, 10)] = value;
    this.setState({
      newPaths,
    })
    // log.info(this.state.newPaths);
  }

  async onClickBrowseForPath({ currentTarget: { dataset: { index } } }: React.MouseEvent<HTMLButtonElement>)
  {
    if (!index)
    {
      log.error('Home.tsx: onClickBrowseForPath called but no data-index was set on the target button.');
      return;
    }
    ipcRenderer.send('open-dialog', 'openDirectory');
    ipcRenderer.once('open-dialog-return', (event, arg: OpenDialogReturnValue) => {

      if (arg.canceled)
      {
        log.warn('Home.tsx: onClickBrowseForPath: file dialog was cancelled.');
        return;
      }

      const { newPaths } = this.state;
      const [ path ] = arg.filePaths; // only using the first path provided (doesn't seem like the openDir dialog supports selecting multiple folders which is nice)

      newPaths[parseInt(index, 10)] = path;
      this.setState({
        newPaths,
      });

      // log.info(this.state.newPaths);
    });
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
        <div className="path-inputs">
          <button type="button" onClick={this.onClickIncrementPath}>add path</button>
          {newPaths.map((path, i) =>
          // eslint-disable-next-line react/no-array-index-key
          <div className="path-list-item" key={`path-${i}`}>
            <input type="text" value={path} onChange={this.onPathChange} data-index={i}/>
            <button type="button" onClick={this.onClickBrowseForPath} data-index={i}>browse</button>
            <button type="button" onClick={this.onClickRemovePath} data-index={i}>X</button>
          </div>
          )}
        </div>
        <WorkspaceList workspaces={workspaces}/>
      </>
    );
  }
};
