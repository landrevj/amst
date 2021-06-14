import React from 'react';
import AsyncCreatableSelect from 'react-select/async-creatable';
import { FilterQuery, FindOptions } from '@mikro-orm/core';

import Client from '../../../shared/websocket/SocketClient';
import { SocketRequestStatus } from '../../../shared/websocket';
import { Tag, TagStub } from '../../../db/entities';
import { TagTuple, tagRegex } from './index';


type OptionType = { category: string, tag: string, value: string, label: string };

interface TagInputProps
{
  className?: string;
  allowReservedCategoryPrefixes?: boolean; // [*,!] are reserved for marking special searches when at the beginning of a category
  onSubmit: (tag: TagTuple) => void;
}

export default class TagInput extends React.Component<TagInputProps>
{
  constructor(props: TagInputProps)
  {
    super(props);

    this.handleCreateTag = this.handleCreateTag.bind(this);
    this.handleLoadTagSelect = this.handleLoadTagSelect.bind(this);
    this.handleTagSelectChange = this.handleTagSelectChange.bind(this);
  }

  async handleLoadTagSelect(input: string)
  {
    const { allowReservedCategoryPrefixes } = this.props;
    const [tag, category] = tagRegex(input, allowReservedCategoryPrefixes);

    const query: FilterQuery<Tag> = { name: { $like: `%%${tag}%%` }, category: { $like: `%%${category}%%` } };
    const options: FindOptions<Tag> = { limit: 5 };
    const response = await Client.send<TagStub[]>('Tag', { action: 'read', params: [input.length ? query : {}, options] });
    const success = response.status === SocketRequestStatus.SUCCESS;

    if (!success || !response.data) return [{ category: '', tag:'', label: 'DB query failed!', value: '' }] as OptionType[];

    const uniqueResults = new Set<string>();
    const results: OptionType[] = [];
    for (let i = 0; i < response.data.length; i += 1)
    {
      const t = response.data[i];
      const catTagString = `${t.category !== '' ? `${t.category}:` : ''}${t.name}`;

      if (!uniqueResults.has(catTagString))
      {
        uniqueResults.add(catTagString);

        results.push({
          category: t.category,
          tag: t.name,
          label: catTagString,
          value: t.id.toString()
        });
      }
    }

    return results;
  }

  handleCreateTag(input: string)
  {
    const { allowReservedCategoryPrefixes, onSubmit } = this.props;

    onSubmit(tagRegex(input, allowReservedCategoryPrefixes));
  }

  handleTagSelectChange(option: OptionType | null)
  {
    if (!option) return;

    const { category, tag } = option;

    const { onSubmit } = this.props;
    onSubmit([tag.trim(), category.trim()]);
  }

  render()
  {
    const { className } = this.props;
    return (
      <AsyncCreatableSelect<OptionType, false>
        cacheOptions
        defaultOptions

        // this forces it to be managed which we want since we never want the
        // select to actually hold a value, just help the user to pick one
        value={null}
        // onInputChange
        loadOptions={this.handleLoadTagSelect}
        onChange={this.handleTagSelectChange}
        placeholder='category:tag'
        className={`react-select_container ${className}`}
        classNamePrefix='react-select'

        onCreateOption={this.handleCreateTag}
        formatCreateLabel={(str: string) => str} // remove the formatting
      />
    );
  }
}
