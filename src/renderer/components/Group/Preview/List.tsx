import React, { useEffect, useState } from 'react';

import { FileStub, GroupStub } from '../../../../db/entities';
import { SocketRequestStatus } from '../../../../shared/websocket';
import Client from '../../../../shared/websocket/SocketClient';
import FilePreviewList from '../../File/Preview/List';
import GroupSearchQuery from '../Search/Query';

interface GroupPreviewListProps
{
  loading?: boolean;
  groups: GroupStub[];
  query?: GroupSearchQuery;
}

export default function GroupPreviewList({ loading, groups, query }: GroupPreviewListProps)
{
  const [things, setThings] = useState([] as [GroupStub, FileStub][]);
  const [thisLoading, setThisLoading] = useState(true);

  useEffect(() => {
    const fn = async () => {
      const response = await Client.send<(FileStub & { group_id: number })[]>('Group', { action: 'getPreviewFiles', params: groups.map(g => g.id) });
      const success = response.status === SocketRequestStatus.SUCCESS;
      if (!success || !response.data)
      {
        setThings([]);
        setThisLoading(false);
        return;
      }
      const fileDict: { [id: number]: FileStub } = {};
      response.data.forEach(f => { fileDict[f.group_id] = f });

      setThings(groups.map(g => [g, fileDict[g.id]]));
      setThisLoading(false);
    };
    fn();
  }, [groups]);

  return (
    <FilePreviewList loading={loading || thisLoading} files={things.map(t => ({ ...t[1], name: t[0].name }))} query={query} QueryConstructor={GroupSearchQuery}/>
  );
}

GroupPreviewList.defaultProps = {
  loading: false,
  query: undefined,
};
