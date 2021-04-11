import React from 'react';
import { TagTuple } from './index';

interface TagInputProps
{
  className?: string;
  onSubmit: (tag: TagTuple) => void;
}

interface TagInputState
{
  input: string;
  category?: string;
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
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange({ target: { value } }: React.ChangeEvent<HTMLInputElement>)
  {
    const re = /^([^:]+):?([^:]+)*$/;
    const match = value.match(re);
    if (match?.length === 3)
    {
      const tag = match[2] || match[1];
      const category = match[2] ? match[1] : match[2];

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

    onSubmit([tag.trim(), category?.trim()]);
    this.setState({
      input: '',
      tag: '',
      category: undefined,
    })
  }

  render()
  {
    const { className } = this.props;
    const { input } = this.state;
    return (
      <form onSubmit={this.handleSubmit}>
        <input className={className} type='text' value={input} onChange={this.handleChange}/>
      </form>
    );
  }
}
