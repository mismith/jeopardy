import React, { Component } from 'react';

import {browserHistory} from 'react-router';
import firebase from './utils/firebase';

import UserInfo from './UserInfo';

//import './Buzzer.css';

class Buzzer extends Component {
  state = {
    game:   undefined,
    player: undefined,
    user:   undefined,
  }

  componentWillMount() {
    firebase.sync(this, 'game', `games/${this.props.params.gameId}`);
    firebase.sync(this, 'player', `games:players/${this.props.params.gameId}/${this.props.params.playerId}`)
      .once('value', snap => {
        const userId = snap.child('userId').val();
        if (userId) {
          firebase.sync(this, 'user', `users/${userId}`);
        }
      });
    firebase.sync(this, 'connected', `.info/connected`)
      .on('value', snap => {
        if (snap.val() === true) {
          this.firebaseRefs.connection = this.firebaseRefs.player.child('connections').push(true);
          this.firebaseRefs.connection.onDisconnect().remove();
        }
      });
  }
  componentWillUnmount() {
    if (this.firebaseRefs.connection) this.firebaseRefs.connection.remove();
    firebase.unsync(this, 'game', 'player', 'user', 'connected');
  }

  buzzIn() {
    this.firebaseRefs.game.child('buzzes').push({
      playerId: this.props.params.playerId,
      timestamp: firebase.database.ServerValue.TIMESTAMP,
    });
  }
  leaveGame(e) {
    if (e.shiftKey || confirm(`Are you sure?`)) {
      this.firebaseRefs.player.remove()
        .then(() => {
          browserHistory.push(`/`);
        });
    }
  }

  render() {
    return (
      <div className="Buzzer">
      {this.state.user &&
        <UserInfo user={this.state.user} />
      }
      {this.state.game &&
        <button onClick={this.buzzIn.bind(this)}>Buzz In</button>
      }
      {this.state.player &&
        <button onClick={this.leaveGame.bind(this)}>Leave Game</button>
      }
      {this.props.children}
      </div>
    );
  }
}

export default Buzzer;
