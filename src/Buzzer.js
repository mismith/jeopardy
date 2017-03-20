import React, { Component } from 'react';

import {browserHistory} from 'react-router';
import firebase from './utils/firebase';

import UserInfo from './helpers/UserInfo';

import './Buzzer.css';

class Buzzer extends Component {
  state = {
    game:   undefined,

    player: undefined,
    user:   undefined,
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
    // log all buzzes (i.e. for stats)
    //const sent = +new Date();
    this.clue(true).child('buzzes').push({
      playerId: this.props.params.playerId,
      buzzedAt: firebase.database.ServerValue.TIMESTAMP,
    })
      // .then(ref => {
      //   const received = +new Date();
      //   ref.once('value', snap => {
      //     console.log(sent, snap.val().buzzedAt, received);
      //     console.log(0, snap.val().buzzedAt - sent, received - snap.val().buzzedAt, received - sent);
      //   });
      // });
  }
  handleAnswerInput(e) {
    this.buzz(true).child('answer').set(e.currentTarget.value || '');
  }
  handleAnswerSubmit(e) {
    e.preventDefault();

    this.buzz(true).child('submittedAt').set(firebase.database.ServerValue.TIMESTAMP);
  }
  handleWagerInput(e) {
    this.setState({
      wager: e.currentTarget.value || null,
    });
  }
  handleWagerSubmit(e) {
    e.preventDefault();

    this.buzz(true).child('wager').set(Math.round(this.state.wager));
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
          <button className="button" onClick={this.buzzIn.bind(this)} disabled={!clue || clue.pickedBuzzId || clue.finishedAt || (clue.penalties && clue.penalties[this.props.params.playerId])}>Buzz In</button>
        {buzz && buzz.playerId === this.props.params.playerId && (!buzz.dailyDouble || (buzz.dailyDouble && buzz.wager)) && !buzz.submittedAt &&
          <form onSubmit={this.handleAnswerSubmit.bind(this)}>
            What is&hellip;&nbsp;
            <input onInput={this.handleAnswerInput.bind(this)} required autoFocus></input>
            <button type="submit">Submit</button>
          </form>
        }
        {buzz && buzz.playerId === this.props.params.playerId && buzz.dailyDouble && !buzz.wager &&
          <form onSubmit={this.handleWagerSubmit.bind(this)}>
            Wager &nbsp;
            <input type="number" min={5} max={buzz.max} onInput={this.handleWagerInput.bind(this)} required autoFocus></input>
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
