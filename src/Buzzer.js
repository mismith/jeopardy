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
    firebase.unsync(this, 'game', 'player', 'user');
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
      </div>
    );
  }
}

export default Buzzer;
