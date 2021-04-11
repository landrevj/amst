import { TagTuple } from '../Tag';

export interface FileSearchQuery
{
  // property queries
  name?: string;
  extension?: string;
  fullPath?: string;
  mimeType?: string;
  md5?: string;

  // join queries
  workspaceID?: number;
  tags?: TagTuple[];

  // pagination
  limit?: number;
  page?: number;
}
