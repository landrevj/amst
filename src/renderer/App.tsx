import React from 'react';
import { HashRouter as Router, Switch, Route } from 'react-router-dom';

import { Home } from './screens/Home/Home';
import FileSearch from './screens/File/Search';
import FileView from './screens/File/View';
import Layout from './screens/Layout';

export default function App()
{
  return (
    <Layout>
      <Router>
        <Switch>
          <Route exact path="/file" component={FileSearch}/>
          <Route path="/file/:id" component={FileView}/>
          <Route path="/" component={Home} />
        </Switch>
      </Router>
    </Layout>
  );
}
