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
    round:      undefined,
    clues:      undefined,
    players:    undefined,

    clue:          undefined,
    clueTime:      undefined,
    clueTimer:     undefined,

    response:      undefined,
    responseTime:  undefined,
    responseTimer: undefined,
  }

  reloadGameData() {
    fetch(`/games/1.json`)
      .then(res => res.json())
      .then(gameData => {
        this.firebaseRefs.game.child('rounds').remove();

        gameData.rounds.forEach((round, i) => {
          const roundRef = this.firebaseRefs.game.child(`rounds/${i}`);

          round.categories.forEach(category => {
            roundRef.child('categories').push(category);
          });
          round.clues.forEach(clue => {
            roundRef.child('clues').push({
              question: clue.question,
              answer:   clue.answer,
              value:    (clue.row || 0) * (i + 1) * 200, // overwrite DD wagers
              isDD:     clue.isDD || null,

              row: clue.row || null,
              col: clue.col || null,
            });
          });
        });
      });
  }
  componentWillMount() {
    firebase.sync(this, 'game', `games/${this.props.params.gameId}`)
      .child('round').on('value', snap => {
        const round = snap.val() - 1;

        firebase.sync(this, 'round', `games/${this.props.params.gameId}/rounds/${round}`);
        firebase.sync(this, 'clues', `games/${this.props.params.gameId}/rounds/${round}/clues`);
      });
    firebase.sync(this, 'players', `games:players/${this.props.params.gameId}`);

    //this.reloadGameData();
  }
  componentWillUnmount() {
    firebase.unsync(this, 'game', 'round', 'clues', 'players');
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

  readAloud(text) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(); // @TODO: trigger after text2speech completes
      }, (text || '').split(' ').length * 200); // simulate reading the clue
    });
  }

  showClue(clue) {
    // show clue card
    firebase.sync(this, 'clue', this.firebaseRefs.clues.path.toString(), clue.$id)
      .child('pickedAt').set(firebase.database.ServerValue.TIMESTAMP) // mark as picked
      .then(() => this.startAllowingBuzzes())
      .then(() => this.readAloud(clue.question))
      .then(() => this.startAcceptingBuzzes())
      .then(() => this.startExpirationTimer());
  }
  startAllowingBuzzes() {
    // const clue = this.state.clue;

    // this.firebaseRefs.clue.child('buzzes').on('child_added', snap => {
    //   const buzz = snap.val();

    //   if (!clue.response) {
    //     // no-one is currently buzzed in
    //     if (clue.buzzesAt && buzz.buzzedAt >= clue.buzzesAt) {
    //       // legit buzz, begin response
    //       const responseRef = this.firebaseRefs.clue.child('response');

    //       // @TODO: pause clue timer
    //       if (this.state.clueTimer) clearInterval(this.state.clueTimer);

    //       // start response timer
    //       this.setState({
    //         responseTimer: setInterval(() => {
    //           const responseTime = (this.state.responseTime || 0) + 1;

    //           if (responseTime < this.props.responseTimeout) {
    //             // increment the timer
    //             this.setState({
    //               responseTime,
    //             });
    //           } else {
    //             // time has elapsed, discard the response
    //             responseRef.child('expired').set(true)
    //             // @TODO:  .then(this.finishResponse.bind(this));
    //           }
    //         }, 1000),
    //       });

    //       responseRef.set(buzz)
    //         .then(() => responseRef.child('answer').once('value'))
    //         .then(snap => snap.val() || '')
    //         .then(answer => {
    //           // @TODO: properly/flexibly check answer
    //           if (clue.answer === answer) {
    //             // correct answer
    //             // @TODO: award player points
    //           } else {
    //             // incorrect answer
    //             // @TODO: allow other buzzes (if any players remain)
    //           }
    //         });
    //     } else {
    //       // buzz was too early
    //       // @TODO: penalize the player
    //     }
    //   } else {
    //     // someone already buzzed in, ignore this buzz
    //   }
    // });
  }
  startAcceptingBuzzes() {
    return this.firebaseRefs.clue
      .child('buzzesAt').set(firebase.database.ServerValue.TIMESTAMP);
  }
  startExpirationTimer() {
    this.setState({
      clueTime:  0,
      clueTimer: setInterval(() => {
        const clueTime = (this.state.clueTime || 0) + 1;

        if (clueTime < this.props.clueTimeout) {
          // increment the timer
          this.setState({
            clueTime,
          });
        } else {
          // time has elapsed
          this.expireClue();
        }
      }, 1000),
    });

    // @TODO: return promise?
  }
  expireClue() {
    if (this.state.clueTimer) clearInterval(this.state.clueTimer);

    this.setState({
      clueTime:  null,
      clueTimer: null,
    });

    return this.firebaseRefs.clue
      .child('expiredAt').set(firebase.database.ServerValue.TIMESTAMP) // mark as expired
      .then(() => this.flashAnswer());
  }
  flashAnswer() {
    // temporarily show the correct answer
    this.setState({
      clueTimer: setTimeout(() => {
        // reset timers
        clearTimeout(this.state.clueTimer);
        this.setState({
          clueTimer: null,
        });

        // hide clue
        this.finishClue();
      }, 3000), // reuse timer
    });

    // @TODO: return promise?
  }
  finishClue() {
    // @TODO: update stats based on outcome

    firebase.unsync(this, 'clue');

    this.setState({
      clue: null,
    });

    // @TODO: return promise?
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
        <Board categories={this.state.round.categories} clues={this.state.round.clues} onPick={this.showClue.bind(this)}>
        {this.state.clue && this.state.clue.pickedAt && !this.state.clue.expiredAt &&
          <aside className={classNames('Clue', {canBuzz: this.state.clue.buzzesAt})}>
            <div>
              {this.state.clue.question}
            </div>
            <footer className="Timer">
            {[1,2,3,4,5,4,3,2,1].map((t, i) =>
              <div key={i} className={classNames({elapsed: this.state.clueTime >= t})}></div>
            )}
            </footer>
          </aside>
        }
        {this.state.clue && this.state.clue.expiredAt &&
          <aside className="Answer" onClick={this.finishClue.bind(this)}>
            <div>
              {this.state.clue.answer}
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
