import { TagStub } from "../../../db/entities";

export interface TagCategoryObject
{
  [category: string]: TagStub[];
}

export type TagTuple = [string, string | undefined]; // first one is the tag, second is the category // feel like this is a bad way of doing this
