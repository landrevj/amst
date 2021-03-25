import React from 'react';
import { render } from 'react-dom';

import Client from '../utils/websocket/SocketClient';
import App from './App';

// eslint-disable-next-line import/prefer-default-export
export function main()
{
  Client.init();
  render(<App />, document.getElementById('root'));
}
