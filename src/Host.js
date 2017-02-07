import React, { Component } from 'react';
import classNames from 'classnames';

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
    picks:      undefined,
    clue:       undefined,

    clueTime:      undefined,
    clueTimer:     undefined,
    answered:      undefined,
    responseTime:  undefined,
    responseTimer: undefined,
  }

  reloadGameData() {
    fetch(`/games/1.json`)
      .then(res => res.json())
      .then(gameData => {
        const rounds = gameData.rounds.map((round, i) => {
          round.clues.map(clue => {
            clue.value = (clue.row || 0) * (i + 1) * 200; // overwrite DD wagers
            return clue;
          });
          return round;
        });
        this.firebaseRefs.game.child('rounds').set(rounds);
      });
  }
  componentWillMount() {
    firebase.sync(this, 'game', `games/${this.props.params.gameId}`)
      .child('round').on('value', snap => {
        const round = snap.val() - 1;

        firebase.sync(this, 'round', `games/${this.props.params.gameId}/rounds/${round}`);
        firebase.sync(this, 'clues', `games/${this.props.params.gameId}/rounds/${round}/clues`);
        firebase.sync(this, 'picks', `games/${this.props.params.gameId}/rounds/${round}/picks`);
        firebase.sync(this, 'clue',  `games/${this.props.params.gameId}/rounds/${round}/clue`);
      });
    firebase.sync(this, 'players', `games:players/${this.props.params.gameId}`);

    //this.reloadGameData();
  }
  componentWillUnmount() {
    firebase.unsync(this, 'game', 'players', 'round', 'clues', 'picks', 'clue');
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

  readAloud(text) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(); // @TODO: trigger after text2speech completes
      }, (text || '').split(' ').length * 200); // simulate reading the clue
    });
  }

  pickClue(clueIndex) {
    const clue = this.state.clues[clueIndex];
    if (clueIndex < 0 || !clue) return; // @TODO: throw error

    // show clue card
    const clueRef = this.firebaseRefs.clue;
    clueRef.set(clue) // set current clue
      .then(() => this.firebaseRefs.clues.child(clueIndex).remove()) // remove from original clues list
      .then(() => this.readAloud(clue.question)) // read clue aloud
      .then(() => clueRef.child('buzzesAt').set(firebase.database.ServerValue.TIMESTAMP)) // start allowing/accepting buzzes
      .then(() => this.runClueTimer()); // run countdown timer

    // track buzzes
    clueRef.child('buzzes').on('child_added', snap => {
      const buzz = snap.val();
      clueRef.once('value')
        .then(snap => snap.val() || {})
        .then(clue => {
          if (!clue.response) {
            // no-one is currently buzzed in
            if (clue.buzzesAt && buzz.buzzedAt >= clue.buzzesAt) {
              // legit buzz, begin response
              const responseRef = clueRef.child('response');

              // @TODO: pause clue timer
              //if (this.state.clueTimer) clearInterval(this.state.clueTimer);

              // start response timer
              this.setState({
                responseTimer: setInterval(() => {
                  const responseTime = (this.state.responseTime || 0) + 1;

                  if (responseTime < this.props.responseTimeout) {
                    // increment the timer
                    this.setState({
                      responseTime,
                    });
                  } else {
                    // time has elapsed, discard the response
                    responseRef.child('expired').set(true)
                    // @TODO:  .then(this.finishResponse.bind(this));
                  }
                }, 1000),
              });

              responseRef.set(buzz)
                .then(() => responseRef.child('answer').once('value'))
                .then(snap => snap.val() || '')
                .then(answer => {
                  // @TODO: properly/flexibly check answer
                  if (clue.answer === answer) {
                    // correct answer
                    // @TODO: award player points
                  } else {
                    // incorrect answer
                    // @TODO: allow other buzzes (if any players remain)
                  }
                });
            } else {
              // buzz was too early
              // @TODO: penalize the player
            }
          } else {
            // someone already buzzed in, ignore this buzz
          }
        })
    });
  }
  runClueTimer() {
    this.setState({
      clueTimer: setInterval(() => {
        const clueTime = (this.state.clueTime || 0) + 1;

        if (clueTime < this.props.clueTimeout) {
          // increment the timer
          this.setState({
            clueTime,
          });
        } else {
          // time has elapsed, archive the clue
          this.firebaseRefs.clue.child('expired').set(true)
            .then(this.archiveClue.bind(this));
        }
      }, 1000),
    });
  }
  archiveClue() {
    this.showAnswer();

    return this.firebaseRefs.clue.once('value') // get the current clue
      .then(snap => snap.val()) // load it
      .then(clue => this.firebaseRefs.picks.push(clue)) // move to archived list
      .then(() => this.firebaseRefs.clue.remove()) // clear current clue
      .then(() => {
        // @TODO: update stats based on outcome
      });
  }
  showAnswer() {
    if (this.state.clueTimer) clearInterval(this.state.clueTimer);

    this.setState({
      clue:      null,
      clueTime:  0,
      clueTimer: setTimeout(this.hideAnswer.bind(this), 3000),
      answered:  this.state.clue,
    });
  }
  hideAnswer() {
    if (this.state.clueTimer) clearTimeout(this.state.clueTimer);

    this.setState({
      clueTimer: null,
      answered:  null,
    });
  }

  handlePick(row, col) {
    const clueIndex = this.getRoundClues().findIndex(clue => clue && clue.row === row && clue.col === col);

    this.pickClue(clueIndex);
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
        <Board categories={this.getRoundCategories()} clues={this.getRoundClues()} round={this.state.game.round} onPick={this.handlePick.bind(this)}>
        {this.state.clue &&
          <aside className={classNames('Clue', {canBuzz: this.state.clue.buzzesAt})}>
            <div>
              {this.state.clue.question}
            </div>
            <footer className="Timer">
            {[1,2,3,4,5,4,3,2,1].map((t, i) =>
              <div key={i} className={classNames({expired: this.state.clueTime >= t})}></div>
            )}
            </footer>
          </aside>
        }
        {this.state.answered &&
          <aside className="Answer" onClick={e=>this.setState({answered: null})}>
            <div>
              {this.state.answered.answer}
            </div>
          </aside>
        }
        </Board>
      }
        <div className="Players">
        {this.getPlayerSeats().map((player, i) =>
          <Player key={i} player={player} className={player && this.state.game && this.state.game.clue && this.state.game.clue.response && this.state.game.clue.response.playerId === player.$id && 'isResponding'}>
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
  clueTimeout: 5,
  responseTimeout: 5,
};

export default Host;
