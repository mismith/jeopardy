import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import CssBaseline from '@material-ui/core/CssBaseline';

import Lobby from './Lobby';
import Screen from './Screen';
import Controller from './Controller';

class App extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <CssBaseline />
        <Route
          path="/"
          exact
          render={props => <Lobby {...props} />}
        />
        <Route
          path="/games/:gameID"
          exact
          render={props => <Screen {...props} {...props.match.params} playerID="screen" />}
        />
        <Route
          path="/games/:gameID/players/:playerID"
          exact
          render={props => <Controller {...props} {...props.match.params} />}
        />
      </BrowserRouter>
    );
  }
}

export default App;
