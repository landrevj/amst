import React from 'react';
import { faFileArchive, faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { WorkspaceStub } from '../../../db/entities';

interface WorkspaceFlagButtonsProps
{
  workspace: WorkspaceStub;
  className?: string;
}

export default function WorkspaceFlagButtons({ workspace: { searchArchives, groupArchiveContents }, className }: WorkspaceFlagButtonsProps)
{
  return (
    <div className={`rounded bg-gray-100 px-2 flex flex-row place-items-center gap-2 text-gray-500 ${className}`}>
      <button type='button' className={searchArchives ? 'text-blue-400' : 'text-gray-300'}>
        <FontAwesomeIcon icon={faFileArchive}/>
      </button>
      <button type='button' className={groupArchiveContents ? 'text-blue-400' : 'text-gray-300'}>
        <FontAwesomeIcon icon={faLayerGroup}/>
      </button>
    </div>
  );
}

WorkspaceFlagButtons.defaultProps = {
  className: '',
};
