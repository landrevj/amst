import { TagStub } from "../../../db/entities";

export interface TagCategoryObject
{
  [category: string]: TagStub[];
}

export type TagTuple = [string, string]; // first one is the name, second is the category
