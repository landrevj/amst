import React from 'react';

interface InputProps
{
  type: string,
  onChange?: (...arg: any[]) => void,
}

interface InputState
{
  userInput: string,
}

export default class Input extends React.Component<InputProps, InputState> {
  constructor(props: InputProps) {
		super(props);

		this.state = { userInput: '' };

		this.handleUserInput = this.handleUserInput.bind(this);
	}

  handleUserInput({target})
  {
    this.setState({userInput: target.value});

    const { onChange } = this.props;
    if (onChange) onChange(target.value);
  }

  render() {
    const { userInput } = this.state;
    return (
      <input type="text" onChange={this.handleUserInput} value={userInput}/>
    );
  }
}
