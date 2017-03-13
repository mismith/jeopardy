import React, { Component } from 'react';

import {browserHistory} from 'react-router';
import firebase from './utils/firebase';

import UserInfo from './helpers/UserInfo';

import './Buzzer.css';

class Buzzer extends Component {
  state = {
    game:       undefined,

    player:     undefined,
    user:       undefined,
  }

  // data fetchers
  game(asReference = false) {
    if (asReference) {
      return this.firebaseRefs.game;
    }
    return this.state.game;
  }
  round(asReference = false) {
    const game = this.game();
    if (game && game.round && game.rounds) {
      if (asReference) {
        return this.game(true).child('rounds').child(game.round - 1);
      }
      return game.rounds[game.round - 1];
    }
  }
  clue(asReference = false) {
    const round = this.round();
    if (round && round.clues && round.pickedClueId) {
      if (asReference) {
        return this.round(true).child('clues').child(round.pickedClueId);
      }
      return round.clues[round.pickedClueId];
    }
  }
  buzz(asReference = false) {
    const clue = this.clue();
    if (clue && clue.buzzes && clue.pickedBuzzId) {
      if (asReference) {
        return this.clue(true).child('buzzes').child(clue.pickedBuzzId);
      }
      return clue.buzzes[clue.pickedBuzzId];
    }
  }

  componentWillMount() {
    // game data + sync
    firebase.sync(this, 'game', `games/${this.props.params.gameId}`);

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
    firebase.unsync(this, 'game', 'player', 'user');

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
    this.clue(true).child('buzzes').push({
      playerId: this.props.params.playerId,
      buzzedAt: firebase.database.ServerValue.TIMESTAMP,
    });
  }

  render() {
    const game = this.game();
    const clue = this.clue();
    const buzz = this.buzz();

    return (
      <div className="Buzzer">
      {this.state.user &&
        <UserInfo user={this.state.user} />
      }
      {this.state.player &&
        <button onClick={this.leaveGame.bind(this)}>Leave Game</button>
      }
      {game &&
        <div>
          <button className="button" onClick={this.buzzIn.bind(this)} disabled={!clue || clue.pickedBuzzId || clue.completedAt}>Buzz In</button>
        {buzz &&
          <form onSubmit={e=>e.preventDefault()}>
            What is&hellip;&nbsp;
            <input onInput={e=>this.buzz(true).child('answer').set(e.currentTarget.value || '')} autoFocus></input>
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
