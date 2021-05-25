import React from 'react';

interface ClickToEditInputProps
{
  inputClassName?: string;
  buttonClassName?: string;
  type: string;
  value: string;
  onSave: (val: string) => void;
  onValidateSave?: (val: string) => boolean;
  onValidateChange?: (val: string) => boolean;
  useContentWidth?: boolean;
}

interface ClickToEditInputState
{
  value: string;
  editing: boolean;
}

export default class ClickToEditInput extends React.Component<ClickToEditInputProps, ClickToEditInputState>
{
  constructor(props: ClickToEditInputProps)
  {
    super(props);

    const { value } = this.props;
    this.state = {
      value,
      editing: false,
    };

    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.onUpdate = this.onUpdate.bind(this);
  }

  componentDidUpdate(prevProps: ClickToEditInputProps)
  {
    const { value } = this.props;
    if (prevProps.value !== value) this.onUpdate(value);
  }

  handleFormSubmit(e: React.FormEvent<HTMLFormElement>)
  {
    e.preventDefault();
    const { onSave, onValidateSave } = this.props;
    const { value } = this.state;

    if (!onValidateSave || onValidateSave(value))
    {
      onSave(value);
      this.setState({
        value,
        editing: false,
      });
    }
  }

  handleInputChange({ target: { value } }: React.ChangeEvent<HTMLInputElement>)
  {
    const { onValidateChange } = this.props;
    if (!onValidateChange || onValidateChange(value))
    {
      this.setState({
        value,
      });
    }
  }

  onUpdate(value: string)
  {
    this.setState({
      value,
    });
  }

  render()
  {
    const { inputClassName, buttonClassName, type, useContentWidth, value: propsValue } = this.props;
    const { value, editing } = this.state;
    if (!editing) return <button type='button' className={`bg-transparent focus:ring-0 ${buttonClassName}`} onClick={() => this.setState({ editing: true })}>{value}</button>;

    return (
      <form className='contents' onSubmit={this.handleFormSubmit}>
        {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
        <input autoFocus className={`inline-block p-0 border-0 focus:ring-0 bg-transparent ${inputClassName}`}
          style={useContentWidth ? { width: `${value.length}ch` } : {}}
          value={value} type={type}
          onChange={this.handleInputChange}
          onBlur={() => this.setState({ value: propsValue, editing: false })}
          onFocus={e => e.target.select()}/>
      </form>
    );
  }
}
