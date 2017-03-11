import React, { Component } from 'react';
import classNames from 'classnames';

import {browserHistory} from 'react-router';
import firebase from './utils/firebase';

import Board from './Board';
import Player from './Player';

import './Host.css';

class Host extends Component {
  state = {
    game:    undefined,
    round:   undefined,
    clues:   undefined,
    players: undefined,

    clue:    undefined,
    buzz:    undefined,
  }

  reloadGameData() {
    fetch(`/games/2.json`)
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

  // player
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
  getPlayerDollars(playerId) {
    let dollars = 0;
    if (this.state.clues) {
      Object.values(this.state.clues).forEach(clue => {
        dollars += clue.rewards ? clue.rewards[playerId] || 0 : 0;
        dollars -= clue.penalties ? clue.penalties[playerId] || 0 : 0;
      });
    }
    return dollars;
  }

  // game
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

  // helpers
  arrayPyramid(max) {
    return Array.from(Array(max * 2 - 1)).map((v,i,a) => i >= max ? max * 2 - i - 1 : i + 1);
  }
  readAloud(text) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(); // @TODO: trigger after text2speech completes
      }, (text || '').split(' ').length * 200); // simulate reading the clue
    });
  }
  startIntervalTimer(name, timeout, interval = 1000) {
    return new Promise(resolve => {
      this.setState({
        [`${name}Timer`]: setInterval(() => {
          const elapsed = (this.state[`${name}Time`] || 0) + 1;

          if (elapsed < (timeout || this.props[`${name}Timeout`])) {
            // increment the timer
            this.setState({
              [`${name}Time`]: elapsed,
            });
          } else {
            // time has elapsed
            this.stopIntervalTimer(name) // stop timer
              .then(resolve);
          }
        }, interval),
      });
    });
  }
  stopIntervalTimer(name) {
    return new Promise(resolve => {
      if (this.state[`${name}Timer`]) clearInterval(this.state[`${name}Timer`]);

      this.setState({
        [`${name}Time`]:  null,
        [`${name}Timer`]: null,
      }, resolve);
    });
  }

  // clue
  showClue(clue) {
    if (!clue || !clue.$id) throw new Error('Invalid clue');

    // show clue card
    return firebase.sync(this, 'clue', this.firebaseRefs.clues.path.toString(), clue.$id)
      .child('pickedAt').set(firebase.database.ServerValue.TIMESTAMP)
      .then(() => this.firebaseRefs.game.child('pickedClueId').set(clue.$id))
      .then(() => this.startAllowingBuzzes())
      .then(() => this.readAloud(clue.question))
      .then(() => this.startAcceptingBuzzes())
      .then(() => this.startIntervalTimer('clue'))
      .then(() => this.finishClue());
  }
  startAllowingBuzzes() {
    this.firebaseRefs.clue.child('buzzes').on('child_added', snap => {
      const buzz = {
        $id: snap.key,
        ...snap.val(),
      };

      if (this.state.clue && !this.state.clue.pickedBuzzId) {
        // no-one is currently buzzed in
        if (this.state.clue.buzzesAt && buzz.buzzedAt >= this.state.clue.buzzesAt) {
          // legit buzz, begin response
          this.stopIntervalTimer('clue')
            .then(() => this.showResponse(buzz))
            .then(() => {
              return this.checkResponse()
                .then(() => this.answerClue())
                .catch(() => this.misanswerClue());
            });
        } else {
          // buzz was too early
          // @TODO: penalize the player
        }
      } else {
        // someone is already responding, so ignore this buzz
      }
    });
  }
  startAcceptingBuzzes() {
    return this.firebaseRefs.clue
      .child('buzzesAt').set(firebase.database.ServerValue.TIMESTAMP);
  }
  answerClue() {
    return this.rewardPlayer()
      .then(() => this.finishResponse())
      .then(() => this.finishClue());
  }
  misanswerClue() {
    return this.penalizePlayer()
      .then(() => this.finishResponse())

      // @TODO: check that there are still players who can answer left
      .then(() => this.startIntervalTimer('clue')) // restart counter for remaining players

      .then(() => this.finishClue());
  }
  finishClue() {
    return this.firebaseRefs.clue
      .child('completedAt').set(firebase.database.ServerValue.TIMESTAMP)

      .then(() => this.startIntervalTimer('answer')) // temporarily show the correct answer

      .then(() => this.firebaseRefs.game.child('pickedClueId').remove())
      .then(() => firebase.unsync(this, 'clue'))
      .then(() => {
        this.setState({
          clue: null,
        });
      });
  }

  // dollars
  rewardPlayer() {
    return this.firebaseRefs.clue.child('rewards').child(this.state.buzz.playerId).set(this.state.clue.value);
  }
  penalizePlayer() {
    return this.firebaseRefs.clue.child('penalties').child(this.state.buzz.playerId).set(this.state.clue.value);
  }

  // response
  showResponse(buzz) {
    if (!buzz || !buzz.$id) throw new Error('Invalid buzz');

    return firebase.sync(this, 'buzz', this.firebaseRefs.clue.path.toString(), 'buzzes', buzz.$id)
      .child('pickedAt').set(firebase.database.ServerValue.TIMESTAMP)
      .then(() => this.firebaseRefs.clue.child('pickedBuzzId').set(buzz.$id))
      // @TODO: check for submittedAt and skip timer if necessary
      .then(() => this.startIntervalTimer('response'));
  }
  checkResponse() {
    return new Promise((resolve, reject) => {
      if ((this.state.clue.answer || '').toLowerCase() === (this.state.buzz.answer || '').toLowerCase()) { // @TODO: do proper/flexible answer checking
        return resolve();
      }
      return reject();
    });
  }
  finishResponse() {
    return this.stopIntervalTimer('response') // @TODO: is this necessary?
      .then(() => this.firebaseRefs.clue.child('pickedBuzzId').remove())
      .then(() => firebase.unsync(this, 'buzz'))
      .then(() => {
        this.setState({
          buzz: null,
        });
      });
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
        {this.state.clue && !this.state.clue.completedAt &&
          <aside className={classNames('Clue', {canBuzz: this.state.clue.buzzesAt})}>
            <div>
              {this.state.clue.question}
            </div>
          {!this.state.buzz &&
            <footer className="Timer">
            {this.arrayPyramid(this.props.clueTimeout).map((t, i) =>
              <div key={i} className={classNames({elapsed: this.state.clueTime >= t})}></div>
            )}
            </footer>
          }
          </aside>
        }
        {this.state.clue && this.state.clue.completedAt &&
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
          <Player key={i} player={player} className={player && this.state.buzz && this.state.buzz.playerId === player.$id && 'isResponding'}>
          {player &&
            <button onClick={e=>this.removePlayer(player.$id)}>Remove Player</button>
          }
          {player &&
            <div>
              <output>{this.getPlayerDollars(player.$id)}</output>
            </div>
          }
          {player && this.state.buzz && this.state.buzz.playerId === player.$id &&
            <div>
              <div>{this.state.buzz.answer}</div>
              <footer className="Timer">
              {this.arrayPyramid(this.props.responseTimeout).map((t, i) =>
                <div key={i} className={classNames({elapsed: this.state.responseTime >= t})}></div>
              )}
              </footer>
            </div>
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
  responseTimeout: 10,
  answerTimeout: 2,
};

export default Host;
