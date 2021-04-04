import { TagTuple } from '../Tag';

export interface FileSearchQuery
{
  name?: string;
  extension?: string;
  fullPath?: string;
  mimeType?: string;
  md5?: string;

  workspaceID?: number;
  tags?: TagTuple[];

  page?: number;
}
