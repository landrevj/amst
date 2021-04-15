import React from 'react';
import { TagTuple } from './index';

interface TagInputProps
{
  className?: string;
  allowReservedCategoryPrefixes?: boolean; // [*,!] are reserved for marking special searches when at the beginning of a category
  onSubmit: (tag: TagTuple) => void;
}

interface TagInputState
{
  input: string;
  category: string;
  tag: string;
}

export default class TagInput extends React.Component<TagInputProps, TagInputState>
{
  constructor(props: TagInputProps)
  {
    super(props);

    this.state = {
      input: '',
      tag: '',
      category: '',
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange({ target: { value } }: React.ChangeEvent<HTMLInputElement>)
  {
    const { allowReservedCategoryPrefixes } = this.props;
    // potentially two groups separated by ':', e.g. /^category:tag$/ or /^tag:$/ or /^tag$/
    // the first is the tag if only the first group was filled in
    // if we got values in both the first is the category and the second is the tag
    const re = /^(?![*!])([^:]+):?([^:]+)?$/;
    const reWithRes = /^([^:]+):?([^:]+)?$/;
    const match = value.match(allowReservedCategoryPrefixes ? reWithRes : re); // match one can be either the tag or category, match two is always the tag if its there
    if (match?.length === 3)
    {
      // if there was something in the tag group use that, otherwise use what was in the category group instead
      const tag = match[2] || match[1];
      // if there was something in the tag group we can use the value from the category group as our category value
      // otherwise we didn't get both a category and a tag, so we just use the empty string for our category.
      const category = match[2] ? match[1] : '';

      this.setState({
        input: value,
        category,
        tag,
      });
    }
    else if (value === '')
    {
      this.setState({ input: value });
    }
  }

  async handleSubmit(event: React.FormEvent<HTMLFormElement>)
  {
    event.preventDefault();

    const { onSubmit } = this.props;
    const { category, tag } = this.state;

    if (tag === '') return;

    onSubmit([tag.trim(), category.trim()]);
    this.setState({
      input: '',
      tag: '',
      category: '',
    })
  }

  render()
  {
    const { className } = this.props;
    const { input } = this.state;
    return (
      <form className='contents' onSubmit={this.handleSubmit}>
        <input className={className} type='text' value={input} onChange={this.handleChange}/>
      </form>
    );
  }
}
