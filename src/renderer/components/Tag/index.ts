import { TagStub } from "../../../db/entities";

export interface TagCategoryObject
{
  [category: string]: TagStub[];
}
