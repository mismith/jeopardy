import React, { Component } from 'react';

import {browserHistory} from 'react-router';
import firebase from './utils/firebase';

import UserInfo from './UserInfo';

import './Buzzer.css';

class Buzzer extends Component {
  state = {
    game:       undefined,
    clue:       undefined,
    buzz:       undefined,

    player:     undefined,
    user:       undefined,
  }

  componentWillMount() {
    // game data + sync
    firebase.sync(this, 'game', `games/${this.props.params.gameId}`)
      .child('round').on('value', snap => {
        const round = snap.val() - 1;

        this.firebaseRefs.game.child('pickedClueId').on('value', snap2 => {
          const clueId = snap2.val();
          if (clueId) {
            firebase.sync(this, 'clue',  `games/${this.props.params.gameId}/rounds/${round}/clues/${clueId}`);

            this.firebaseRefs.clue.child('pickedBuzzId').on('value', snap3 => {
              const buzzId = snap3.val();
              if (buzzId) {
                firebase.sync(this, 'buzz',  `games/${this.props.params.gameId}/rounds/${round}/clues/${clueId}/buzzes/${buzzId}`);
              } else {
                firebase.unsync(this, 'buzz');
                this.setState({
                  buzz: null,
                });
              }
            });
          } else {
            firebase.unsync(this, 'clue');
            this.setState({
              clue: null,
            });
          }
        });
      });

    // player info + connection state
    firebase.sync(this, 'player', `games:players/${this.props.params.gameId}/${this.props.params.playerId}`)
      .child('userId').once('value', snap => {
        const userId = snap.val();
        if (userId) {
          firebase.sync(this, 'user', `users/${userId}`);
        }
      });
    firebase.database().ref(`.info/connected`)
      .on('value', snap => {
        if (snap.val() === true) {
          this.firebaseRefs.connection = this.firebaseRefs.player.child('connections').push(true);
          this.firebaseRefs.connection.onDisconnect().remove();
        }
      });
  }
  componentWillUnmount() {
    firebase.unsync(this, 'game', 'clue', 'player', 'user');

    if (this.firebaseRefs.connection) this.firebaseRefs.connection.remove();
  }

  leaveGame(e) {
    if (e.shiftKey || confirm(`Are you sure?`)) {
      this.firebaseRefs.player.remove()
        .then(() => {
          browserHistory.push(`/`);
        });
    }
  }

  buzzIn() {
    this.firebaseRefs.clue.child('buzzes').push({
      playerId: this.props.params.playerId,
      buzzedAt: firebase.database.ServerValue.TIMESTAMP,
    });
  }

  render() {
    return (
      <div className="Buzzer">
      {this.state.user &&
        <UserInfo user={this.state.user} />
      }
      {this.state.player &&
        <button onClick={this.leaveGame.bind(this)}>Leave Game</button>
      }
      {this.state.game &&
        <div>
          <button className="button" onClick={this.buzzIn.bind(this)} disabled={!this.state.clue || this.state.clue.pickedBuzzId || this.state.clue.completedAt}>Buzz In</button>
        {this.state.buzz &&
          <form onSubmit={e=>e.preventDefault()}>
            What is&hellip;&nbsp;
            <input onInput={e=>this.firebaseRefs.buzz.child('answer').set(e.currentTarget.value || '')} autoFocus></input>
            <button type="submit">Submit</button>
          </form>
        }
        </div>
      }
        {this.props.children}
      </div>
    );
  }
}

export default Buzzer;
