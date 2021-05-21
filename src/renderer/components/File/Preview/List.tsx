import React from 'react';
import { sample } from 'lodash';
import { Link } from 'react-router-dom';

import { FileStub } from '../../../../db/entities';
import FilePreview from './Preview';
import { SearchQuery } from '../../UI/Search/Query';

interface FilePreviewListProps<QueryTypeProps, QueryTypeResults, QueryType>
{
  loading?: boolean;
  files: FileStub[];
  query?: SearchQuery<QueryTypeProps, QueryTypeResults>;
  QueryConstructor?: new (q: QueryTypeProps | string, o?: boolean, d?: number) => QueryType;
}

const heights = ['h-24', 'h-28', 'h-32', 'h-36', 'h-40', 'h-44', 'h-48', 'h-52', 'h-56', 'h-60'];

export default function FilePreviewList<QueryTypeProps, QueryTypeResults, QueryType extends SearchQuery<QueryTypeProps, QueryTypeResults>>
({ loading, files, query, QueryConstructor }: FilePreviewListProps<QueryTypeProps, QueryTypeResults, QueryType>)
{
  const indexStart = (query?.page && query?.limit) ? query.page * query.limit : 0;

  // eslint-disable-next-line react/no-array-index-key
  const placeholders = Array(9).fill('').map((_, i) => <div className={`w-44 max-h-60 flex-auto bg-gray-200 rounded ${sample(heights)} animate-pulse`} key={i}/>);
  const filePreviews = files.map((file, i) => {
    if (query && QueryConstructor)
    {
      // console.log('h', query);
      const nq = new QueryConstructor(query.props);
      nq.limit = 1;
      nq.page = indexStart + i;
      nq.parentInstanceID = query.instanceID;
      // console.log('nq', nq);
      return <Link to={`/${query.route}/${file.id}?${nq.toString()}`} className='flex flex-auto' key={file.id}><FilePreview className='flex-auto w-48' file={file} showName/></Link>;
    }

    return <FilePreview file={file} key={file.id} className='flex-auto w-48' imgClassName='max-h-72' showName/>;
  });
  // eslint-disable-next-line react/no-array-index-key
  const hackSpacers = Array(30).fill('').map((_, i) => <div className='w-48 flex-auto invisible' key={`hack_${i}`}/>);
  // bs flexbox spacers so the last row is left aligned
  // this fails if the window can fit more than 30 per row

  return (
    <div className='flex flex-row flex-wrap gap-2'>
      {[...(loading ? placeholders : filePreviews), ...hackSpacers] }
    </div>
  );
}

FilePreviewList.defaultProps = {
  loading: false,
  query: undefined,
  QueryConstructor: undefined,
};
