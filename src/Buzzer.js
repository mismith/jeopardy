import React, { Component } from 'react';

import {browserHistory} from 'react-router';
import firebase from './utils/firebase';

import UserInfo from './UserInfo';

//import './Buzzer.css';

class Buzzer extends Component {
  state = {
    player: undefined,
    user:   undefined,
  }

  componentWillMount() {
    firebase.sync(this, 'player', `games:players/${this.props.params.gameId}/${this.props.params.playerId}`);
    this.firebaseRefs.player.once('value')
      .then(snapshot => {
        const userId = snapshot.child('userId').val();
        if (userId) {
          firebase.sync(this, 'user', `users/${userId}`);
        }
      });
  }
  componentWillUnmount() {
    firebase.unsync(this, 'player');
    firebase.unsync(this, 'user');
  }

  buzzIn() {
    this.firebaseRefs.player.child('buzzes').push(firebase.database.ServerValue.TIMESTAMP);
  }
  leaveGame() {
    this.firebaseRefs.player.remove()
      .then(() => {
        browserHistory.push(`/`);
      });
  }

  render() {
    return (
      <div className="Buzzer">
      {this.state.user &&
        <UserInfo user={this.state.user} />
      }
        <button onClick={this.buzzIn.bind(this)}>Buzz In</button>
        <button onClick={this.leaveGame.bind(this)}>Leave Game</button>
      </div>
    );
  }
}

export default Buzzer;
