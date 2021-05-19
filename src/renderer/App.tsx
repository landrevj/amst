import React from 'react';
import { HashRouter as Router, Switch, Route } from 'react-router-dom';

import { Home } from './screens/Home/Home';
import { FileSearch, FileView } from './screens/File';
import { GroupSearch, GroupView } from './screens/Group';
import Layout from './screens/Layout';

export default function App()
{
  return (
    <Layout>
      <Router>
        <Switch>
          <Route exact path="/group" component={GroupSearch}/>
          <Route path="/group/:id" component={GroupView}/>

          <Route exact path="/file" component={FileSearch}/>
          <Route path="/file/:id" component={FileView}/>

          <Route path="/" component={Home} />
        </Switch>
      </Router>
    </Layout>
  );
}
