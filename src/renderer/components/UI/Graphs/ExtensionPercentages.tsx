import React, { useState } from 'react';
import hash from 'hash-it';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBan, faEllipsisH } from '@fortawesome/free-solid-svg-icons';

export type ExtensionPercentagesGraphData = { extension: string, extension_count: number, extension_percent: number }[];

interface ExtensionPercentagesGraphProps
{
  data?: ExtensionPercentagesGraphData;
  loading?: boolean;
}

const colors = ['bg-red-400', 'bg-yellow-400', 'bg-green-400', 'bg-blue-400', 'bg-indigo-400', 'bg-purple-400', 'bg-pink-400', 'bg-rose-400', 'bg-cyan-400', 'bg-teal-400'];

export default function ExtensionPercentagesGraph({ data, loading }: ExtensionPercentagesGraphProps)
{
  const [hoveredExtension, setHoveredExtension] = useState<string | undefined>(undefined);

  return !loading && data?.length ? (
    <div>
      <span className='flex gap-x-0.5 rounded-full w-full overflow-hidden'>
        {data?.map((d, i) =>
          // eslint-disable-next-line react/no-array-index-key
          <span key={i}
            className={`p-2
              ${d.extension === hoveredExtension ? 'bg-opacity-30' : ''} hover:bg-opacity-30
              ${d.extension !== 'other' ? colors[hash(d.extension) % colors.length] : 'bg-gray-400'}`}
            style={{ width: `${d.extension_percent}%` }}
            onMouseEnter={() => setHoveredExtension(d.extension)}
            onMouseLeave={() => setHoveredExtension(undefined)}/>
        )}
      </span>
      <div className='flex flex-row flex-wrap pt-4 justify-center'>
        {data?.map((d, i) =>
          // eslint-disable-next-line react/no-array-index-key
          <div className={`${d.extension === hoveredExtension ? 'bg-gray-200' : ''} hover:bg-gray-200 rounded-full px-1.5`} key={i}
            onMouseEnter={() => setHoveredExtension(d.extension)}
            onMouseLeave={() => setHoveredExtension(undefined)}
          >
            <div className={`inline-block p-2 rounded-full relative top-0.5 mr-1 ${d.extension !== 'other' ? colors[hash(d.extension) % colors.length] : 'bg-gray-400'}`}/>
            <span>{d.extension}</span><span className='text-gray-400 ml-1'>{d.extension_percent.toFixed(1).toLocaleString()}%</span>
          </div>
        )}
      </div>
    </div>
  ) : (
    <div className='flex flex-row justify-center text-gray-300'>
      <FontAwesomeIcon className={loading ? 'animate-pulse' : ''} icon={loading ? faEllipsisH : faBan}/>
    </div>
  );
}

ExtensionPercentagesGraph.defaultProps = {
  data: undefined,
  loading: undefined,
};
