import React, { Component } from 'react';

import {browserHistory} from 'react-router';
import firebase from './utils/firebase';

import Board from './Board';
import Player from './Player';

import './Host.css';

class Host extends Component {
  state = {
    game:       undefined,
    players:    undefined,

    round:      undefined,
    clues:      undefined,
    clue:       undefined,
    picks:      undefined,
  }

  reloadGameData() {
    fetch(`/games/1.json`)
      .then(res => res.json())
      .then(gameData => {
        this.firebaseRefs.game.child('rounds').set(gameData.rounds);
      });
  }
  componentWillMount() {
    firebase.sync(this, 'game', `games/${this.props.params.gameId}`)
      .child('round').on('value', snap => {
        const round = snap.val() - 1;

        firebase.sync(this, 'round', `games/${this.props.params.gameId}/rounds/${round}`);
        firebase.sync(this, 'clues', `games/${this.props.params.gameId}/rounds/${round}/clues`);
        firebase.sync(this, 'clue',  `games/${this.props.params.gameId}/rounds/${round}/clue`);
        firebase.sync(this, 'picks', `games/${this.props.params.gameId}/rounds/${round}/picks`);
      });
    firebase.sync(this, 'players', `games:players/${this.props.params.gameId}`);

    //this.reloadGameData();
  }
  componentWillUnmount() {
    firebase.unsync(this, 'game', 'players', 'round', 'clues', 'clue', 'picks');
  }

  numPlayers() {
    return this.state.players ? Object.keys(this.state.players).length : 0;
  }
  getPlayerSeats() {
    let players = [];
    if (this.state.players) {
      Object.keys(this.state.players).forEach(playerId => {
        let player = this.state.players[playerId];
        player.$id = playerId;
        players.push(player);
      });
    }
    while(players.length < this.props.maxPlayers) {
      players.push(null);
    };
    return players;
  }
  removePlayer(playerId) {
    this.firebaseRefs.players.child(playerId).remove();
  }
  regressGame() {
    this.firebaseRefs.game.child('round').set(this.state.game.round - 1);
  }
  advanceGame() {
    this.firebaseRefs.game.child('round').set((this.state.game.round || 0) + 1);
  }
  cancelGame(e) {
    if (e.shiftKey || confirm(`Are you sure?`)) {
      this.firebaseRefs.game.remove()
        .then(() => {
          browserHistory.push(`/`);
        });
    }
  }

  getRoundCategories() {
    return this.state.round ? Array.from(this.state.round.categories) : [];
  }
  getRoundClues() {
    return this.state.clues || [];
  }
  pickClue(clueIndex, value) {
    const clue = this.state.clues[clueIndex];
    if (clueIndex < 0 || !clue) return; // @TODO: throw error

    // buzzing enabled (but they will be penalized if they buzz now)
    clue.value = value; // override (in case it was a DD)
    const clueRef = this.firebaseRefs.clue;
    clueRef.set(clue);
    this.firebaseRefs.clues.child(clueIndex).remove();

    // read clue aloud
    setTimeout(() => {
      // start allowing/accepting buzzes
      clueRef.child('buzzesAt').set(firebase.database.ServerValue.TIMESTAMP);

      this.clueTimeout = setTimeout(() => {
        clueRef.child('expired').set(true)
          .then(() => this.finishClue(clue));
      }, 5000);
    }, 1000 + Math.random()*2000); // simulate reading the clue // @TODO: trigger after text2speech completes

    // track buzzes
    clueRef.child('buzzes').on('child_added', snap => {
      const buzz = snap.val();
      clueRef.once('value')
        .then(snap => snap.val())
        .then(clue => {
          if (!clue.currentResponse && clue.buzzesAt && buzz.buzzedAt >= clue.buzzesAt) {
            // legit buzz, begin response
            const currentResponseRef = clueRef.child('currentResponse');
            return currentResponseRef.set(buzz)
              .then(() => currentResponseRef.child('answer').once('value'))
              .then(snap => snap.val() || '')
              .then(answer => {
                // @TODO: check answer
              });
          }
          // buzz wasn't good (e.g. too early)
          // @TODO: penalize the player
        });
    });
  }
  finishClue(clue) {
    if (this.clueTimeout) clearTimeout(this.clueTimeout);

    this.firebaseRefs.clue.once('value') // get the current clue
      .then(snap => snap.val()) // load it
      .then(clue => this.firebaseRefs.picks.push(clue)) // move to archived list
      .then(() => this.firebaseRefs.clue.remove()) // clear current clue
      .then(() => {
        // @TODO: update stats based on outcome
      });
  }

  handlePick(row, col, value) {
    const clueIndex = this.getRoundClues().findIndex(clue => clue && clue.row === row && clue.col === col);

    this.pickClue(clueIndex, value);
  }

  render() {
    return (
      <div className="Host">
      {this.state.game === undefined &&
        <div>
          Loading…
        </div>
      }
      {this.state.game &&
        <header style={{display: 'flex', justifyContent: 'space-between', padding: 10}}>
          <div>
            Join Code: <input defaultValue={this.state.game.joinCode} readOnly />
          </div>
          <div>
          {this.numPlayers() < this.props.minPlayers &&
            <div>
              Waiting for {this.props.minPlayers - this.numPlayers()}-{this.props.maxPlayers - this.numPlayers()} more players…
            </div>
          }
          {this.numPlayers() >= this.props.minPlayers &&
            <div>
              {this.props.maxPlayers - this.numPlayers() || 'No'} more player{this.props.maxPlayers - this.numPlayers() !== 1 && 's'} can join
            </div>
          }
          </div>
          <div>
          {this.state.game.round > 0 &&
            <button onClick={this.regressGame.bind(this)}>Previous Round</button>
          }
          {this.state.game.round < 3 &&
            <button onClick={this.advanceGame.bind(this)} disabled={this.numPlayers() < this.props.minPlayers}>{this.state.game.round ? 'Next Round' : 'Start Game'}</button>
          }
            <button onClick={this.cancelGame.bind(this)}>Delete Game</button>
          </div>
        </header>
      }
      {this.state.game && this.state.game.round > 0 &&
        <Board categories={this.getRoundCategories()} clues={this.getRoundClues()} round={this.state.game.round} onPick={this.handlePick.bind(this)} />
      }
      {this.state.game && this.state.clue &&
        <aside className="Clue">
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', flexGrow: 1, padding: '5%'}}>
            {this.state.clue.question}
          </div>
          <progress value={this.state.clue.buzzesAt} max={5000} style={{width: '100%', visibility: !this.state.clue.buzzesAt && 'hidden'}} />
        </aside>
      }
        <div className="Players">
        {this.getPlayerSeats().map((player, i) =>
          <Player key={i} player={player} className={player && this.state.game && this.state.game.clue && this.state.game.clue.currentResponse && this.state.game.clue.currentResponse.playerId === player.$id && 'isResponding'}>
          {player &&
            <button onClick={e=>this.removePlayer(player.$id)}>Remove Player</button>
          }
          </Player>
        )}
        </div>
      </div>
    );
  }
}
Host.defaultProps = {
  minPlayers: 1,
  maxPlayers: 3,
};

export default Host;
