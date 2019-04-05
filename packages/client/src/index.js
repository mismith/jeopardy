import React from 'react';
import ReactDOM from 'react-dom';

import {Router, Route, IndexRoute, browserHistory} from 'react-router';
import App from './App';
import Home from './Home';
import Game from './Game';
import Host from './Host';
import Buzzer from './Buzzer';

import './index.css';

ReactDOM.render(
  <Router history={browserHistory}>
    <Route path="/" component={App}>
      <IndexRoute component={Home} />
      <Route path="game/:gameId" component={Game}>
        <IndexRoute component={Host} />
        <Route path="buzzer/:playerId" component={Buzzer} />
      </Route>
    </Route>
  </Router>,
  document.getElementById('root')
);
