import React, { Component } from 'react';

import {browserHistory} from 'react-router';
import firebase from './utils/firebase';

//import './Buzzer.css';

class Buzzer extends Component {
  state = {
    buzzer: undefined,
  }

  componentWillMount() {
    firebase.sync(this, 'buzzer', `games/${this.props.params.gameId}/buzzers/${this.props.params.buzzerId}`);
  }
  componentWillUnmount() {
    firebase.unsync(this, 'buzzer');
  }

  buzzIn() {
    this.firebaseRefs.buzzer.child('buzzes').push(firebase.database.ServerValue.TIMESTAMP);
  }
  leaveGame() {
    this.firebaseRefs.buzzer.remove().then(() => {
      browserHistory.push(`/`);
    });
  }

  render() {
    return (
      <div className="Buzzer">
        {this.state.buzzer && this.state.buzzer.name}
        <button onClick={this.buzzIn.bind(this)}>Buzz In</button>
        <button onClick={this.leaveGame.bind(this)}>Leave Game</button>
      </div>
    );
  }
}

export default Buzzer;
