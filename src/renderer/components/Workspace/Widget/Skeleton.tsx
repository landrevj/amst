import React from 'react';
import { faCircle, faDatabase, faFolder } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import FolderList from '../../Folder/List';
import { Card, CardFooter, CardSection } from '../../UI/Card';
import ExtensionPercentagesGraph from '../../UI/Graphs/ExtensionPercentages';

export default function WorkspaceWidgetSkeleton()
{
  return (
  <Card className='relative'>

    <div className='relative flex flex-row text-xl place-items-center'>
      <div className='p-3 bg-gray-400 rounded-full w-40 animate-pulse'/>
      <div className='flex-grow'/>
      <div className='p-2 bg-gray-300 rounded-full w-20 animate-pulse'/>
    </div>

    <CardSection fullWidth className='flex flex-col gap-4 p-4 pb-0'>
      <CardSection headerIcon={faFolder} className='bg-gray-100'>
        <FolderList loading/>
      </CardSection>

      <CardSection headerIcon={faDatabase} className='bg-gray-100'>
        <div className='mt-2'>
          <ExtensionPercentagesGraph loading/>
        </div>
      </CardSection>
    </CardSection>

    <div className='flex-grow flex-1 inline'/>

    <CardFooter buttons className='text-gray-300'>
      <FontAwesomeIcon className='animate-pulse' icon={faCircle}/>
      <FontAwesomeIcon className='animate-pulse' icon={faCircle}/>
    </CardFooter>
  </Card>
  );
}
