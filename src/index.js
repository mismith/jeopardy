import React from 'react';
import ReactDOM from 'react-dom';

import {Router, Route, IndexRoute, browserHistory} from 'react-router';
import App from './App';
import Home from './Home';
import Game from './Game';
import Display from './Display';
import Buzzer from './Buzzer';

import './index.css';

ReactDOM.render(
  <Router history={browserHistory}>
    <Route path="/" component={App}>
      <IndexRoute component={Home} />
      <Route path="game/:gameId" component={Game}>
        <IndexRoute component={Display} />
        <Route path="buzzer/:buzzerId" component={Buzzer} />
      </Route>
    </Route>
  </Router>,
  document.getElementById('root')
);
