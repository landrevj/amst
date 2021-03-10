import React from 'react';
import { OpenDialogReturnValue } from 'electron';
import log from 'electron-log';

import { IpcService } from '../../../utils/ipc';
import '../../../App.global.scss';

const ipc = new IpcService();

interface MultiplePathPickerProps
{
  onChange: (paths: string[]) => void;
}

interface MultiplePathPickerState
{
  newPaths: string[];
}

// eslint-disable-next-line import/prefer-default-export
export class MultiplePathPicker extends React.Component<MultiplePathPickerProps, MultiplePathPickerState>
{

  constructor(props: MultiplePathPickerProps)
  {
    super(props);

    this.state = {
      newPaths: [''],
    };

    this.onClickIncrementPath = this.onClickIncrementPath.bind(this);
    this.onPathChange         = this.onPathChange.bind(this);
    this.onClickRemovePath    = this.onClickRemovePath.bind(this);
    this.onClickBrowseForPath = this.onClickBrowseForPath.bind(this);
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

    const { onChange } = this.props;
    onChange(newPaths);
    // log.info(this.state.newPaths);
  }

  async onClickBrowseForPath({ currentTarget: { dataset: { index } } }: React.MouseEvent<HTMLButtonElement>)
  {
    if (!index)
    {
      log.error('Home.tsx: onClickBrowseForPath called but no data-index was set on the target button.');
      return;
    }

    const arg = await ipc.send<OpenDialogReturnValue>('open-dialog', { params: ['openDirectory'] });

    if (arg.canceled)
    {
      log.warn('Home.tsx: onClickBrowseForPath: file dialog was cancelled.');
      return;
    }

    const { newPaths } = this.state;
    const [ path ] = arg.filePaths; // only asking for one path so this is fine for now at least

    newPaths[parseInt(index, 10)] = path;
    this.setState({
      newPaths,
    });
  }

  render()
  {
    const { newPaths } = this.state;
    return (
      <>
        <div>
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
      </>
    );
  }
};
