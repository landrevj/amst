import '@fontsource/roboto';

import React from 'react';
import { render } from 'react-dom';

import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';

import Client from '../utils/websocket/SocketClient';
import App from './App';

TimeAgo.addDefaultLocale(en);

// eslint-disable-next-line import/prefer-default-export
export function main()
{
  Client.init();
  render(<App />, document.getElementById('root'));
}
