import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import { Home } from './screens/Home/Home';
import { WorkspaceView } from './screens/Workspace/View';

export default function App()
{
  return (
    <Router>
      <Switch>
        <Route path="/workspace/:id" component={WorkspaceView}/>
        <Route path="/" component={Home} />
      </Switch>
    </Router>
  );
}
