import React from 'react';
import { OpenDialogReturnValue } from 'electron';
import log from 'electron-log';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';

import { IpcService } from '../../../../../shared/ipc';

const ipc = new IpcService();

interface MultiplePathPickerProps
{
  pathArray: string[];
  onChange: (paths: string[]) => void;
}

// eslint-disable-next-line import/prefer-default-export
export class MultiplePathPicker extends React.Component<MultiplePathPickerProps>
{

  constructor(props: MultiplePathPickerProps)
  {
    super(props);

    this.onClickIncrementPath = this.onClickIncrementPath.bind(this);
    this.onPathChange         = this.onPathChange.bind(this);
    this.onClickRemovePath    = this.onClickRemovePath.bind(this);
    this.onClickBrowseForPath = this.onClickBrowseForPath.bind(this);
  }

  onClickIncrementPath()
  {
    const { pathArray, onChange } = this.props;
    onChange([...pathArray, '']);
  }

  onClickRemovePath({ currentTarget: { dataset: { index } } }: React.MouseEvent<HTMLButtonElement>)
  {
    if (!index)
    {
      log.error('Home.tsx: onClickRemovePath called but no data-index was set on the target button.');
      return;
    }

    const { pathArray, onChange } = this.props;
    if (pathArray.length <= 1) return;

    pathArray.splice(parseInt(index, 10), 1);
    onChange(pathArray);
  }

  onPathChange({ target: { value, dataset: { index } } }: React.ChangeEvent<HTMLInputElement>)
  {
    if (!index)
    {
      log.error('Home.tsx: onPathChange called but no data-index was set on the target input.');
      return;
    }
    const { pathArray, onChange } = this.props;

    pathArray[parseInt(index, 10)] = value;
    onChange(pathArray);
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

    const { pathArray, onChange } = this.props;
    const [ path ] = arg.filePaths; // only asking for one path so this is fine for now at least

    pathArray[parseInt(index, 10)] = path;
    onChange(pathArray);
  }

  render()
  {
    const { pathArray } = this.props;
    return (
      <div>
        <div className='space-y-2'>
          {pathArray.map((path, i) =>
          // eslint-disable-next-line react/no-array-index-key
          <div className='flex flex-row space-x-2' key={`path-${i}`}>
            <input type='text' className='inline-block w-full px-2 py-1 text-sm rounded-full border-2 border-solid border-gray-300 placeholder-gray-400' value={path} placeholder='path' onChange={this.onPathChange} data-index={i}/>
            <button type='button' className='text-gray-400 hover:text-blue-400' onClick={this.onClickBrowseForPath} data-index={i}>
              <FontAwesomeIcon icon={faSearch}/>
            </button>
            <button type='button' className='text-gray-400 hover:text-red-400' onClick={this.onClickRemovePath} data-index={i}>
              <FontAwesomeIcon icon={faTimes}/>
            </button>
          </div>
          )}
        </div>

        <button type="button" className='mt-4 flex flex-row justify-center w-full bg-transparent group border-dashed border-2 border-gray-300 hover:border-blue-400 rounded-full' onClick={this.onClickIncrementPath}>
          <FontAwesomeIcon className='m-1.5 inline-block fill-current text-gray-300 group-hover:text-blue-400' icon={faPlus}/>
        </button>
      </div>
    );
  }
};
