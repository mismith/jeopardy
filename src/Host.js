import React, { Component } from 'react';
import classNames from 'classnames';

import {browserHistory} from 'react-router';
import firebase from './utils/firebase';
import FuzzySet from 'fuzzyset.js';

import Board from './Board';
import Player from './helpers/Player';
import Timer from './helpers/Timer';

import './Host.css';

class Host extends Component {
  state = {
    game:    undefined,
    players: undefined,

    audio: {
      time: new Audio('/audio/time.wav'),
      'daily-double': new Audio('/audio/daily-double.wav'),
    }
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
              dd:       clue.dd || null,

              row: clue.row || null,
              col: clue.col || null,
            });
          });
        });
      });
  }
  componentWillMount() {
    firebase.sync(this, 'game', `games/${this.props.params.gameId}`);
    firebase.sync(this, 'players', `games:players/${this.props.params.gameId}`);

    this.reloadGameData();
  }
  componentWillUnmount() {
    firebase.unsync(this, 'game', 'players');
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

  // player
  numPlayers() {
    return this.state.players ? Object.keys(this.state.players).length : 0;
  }
  removePlayer(playerId) {
    this.firebaseRefs.players.child(playerId).remove();
  }
  getPlayerSeats() {
    let players = [];
    if (this.state.players) {
      Object.keys(this.state.players).sort().forEach(playerId => {
        let player = this.state.players[playerId];
        player.$id = playerId;
        players.push(player);
      });
    }
    while (players.length < this.props.maxPlayers) {
      players.push(null);
    };
    return players;
  }
  getPlayerScore(playerId) {
    let dollars = 0;
    const game = this.game();
    if (game && game.rounds) {
      game.rounds.forEach(round => {
        Object.values(round.clues).forEach(clue => {
          dollars += clue.rewards ? clue.rewards[playerId] || 0 : 0;
          dollars -= clue.penalties ? clue.penalties[playerId] || 0 : 0;
        });
      });
    }
    return dollars;
  }

  // game
  regressGame() {
    this.firebaseRefs.game.child('round').set(this.game().round - 1);
  }
  advanceGame() {
    this.firebaseRefs.game.child('round').set((this.game().round || 0) + 1);
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
  readAloud(text) {
    return new Promise(resolve => {
      // @TODO: test for support?
      // @HACK: storing in array as per bug here: http://stackoverflow.com/a/35935851/888928
      window.utterances = [];
      const utterance = new SpeechSynthesisUtterance(text);
      window.utterances.push(utterance);
      utterance.onend = () => {
        resolve();
      };
      window.speechSynthesis.speak(utterance);
    });
  }
  pickRandomReply(replies) {
    return replies[Math.floor(Math.random()*replies.length)];
  }
  startIntervalTimer(name, timeout, interval = 1000) {
    return new Promise(resolve => {
      return this.stopIntervalTimer(name) // make sure it isn't already running
        .then(() => {
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
    });
  }
  stopIntervalTimer(name) {
    return new Promise(resolve => {
      clearInterval(this.state[`${name}Timer`]);

      this.setState({
        [`${name}Time`]:  0,
        [`${name}Timer`]: null,
      }, resolve);
    });
  }
  playSound(name) {
    this.state.audio[name].play();
  }

  // clue
  showClue(clue) {
    if (!clue || !clue.$id) throw new Error('Invalid clue');

    // show clue card
    return this.round(true).update({
      pickedClueId: clue.$id,
      [`clues/${clue.$id}/pickedAt`]: firebase.database.ServerValue.TIMESTAMP,
    })
      .then(() => {
        if (clue.dd) {
          // daily double!
          const playerId = this.round().currentPlayerId || this.getPlayerSeats()[0].$id; // @TODO: make this more robust
          const score = this.getPlayerScore(playerId);

          this.playSound('daily-double');

          return this.clue(true).child('buzzes').push({
            dailyDouble: true,
            max: Math.max(score, this.game().round * 1000),
            playerId,
            pickedAt: firebase.database.ServerValue.TIMESTAMP,
          })
            .then(ref => {
              const buzzId = ref.key;
              return this.clue(true).child('pickedBuzzId').set(buzzId)
                .then(() => {
                  // await wager
                  return new Promise(resolve => {
                    ref.child('wager').on('value', snap => {
                      if (snap.val()) return resolve();
                    });
                  });
                });
            })
            .then(() => this.readAloud(clue.question))
            .then(() => this.awaitResponse())
            .then(() => {
              return this.checkResponse()
                .then(() => this.answerClue())
                .catch(() => this.misanswerClue());
            });
        } else {
          // regular clue
          return this.startAllowingBuzzes()
            .then(() => this.readAloud(clue.question))
            .then(() => this.startAcceptingBuzzes())
            .then(() => this.startIntervalTimer('clue'))
            .then(() => this.playSound('time'))
            .then(() => this.finishClue());
        }
      });
  }
  startAllowingBuzzes() {
    this.clue(true).child('buzzes').on('child_added', snap => {
      const buzz = {
        $id: snap.key,
        ...snap.val(),
      };

      const clue = this.clue();
      if (clue && !clue.pickedBuzzId) {
        // no-one is currently buzzed in
        const penalizedUsers = Object.keys(clue.penalties || {});
        if (clue.buzzesAt && buzz.buzzedAt >= clue.buzzesAt && !penalizedUsers.includes(buzz.playerId)) {
          // legit buzz, begin response
          this.showResponse(buzz)
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
    return Promise.resolve();
  }
  startAcceptingBuzzes() {
    return this.clue(true).child('buzzesAt').set(firebase.database.ServerValue.TIMESTAMP);
  }
  answerClue() {
    return this.rewardPlayer() // increase score
      .then(() => this.round(true).child('currentPlayerId').set(this.buzz().playerId)) // save turn
      .then(() => this.readAloud(this.pickRandomReply([
        `Yes`,
        `You got it`,
        `Correct`,
        `Right`,
        `That's right`,
        `That's it`,
        `That's correct`,
        `Well done`,
        `You're right`,
        `You're correct`,
      ])))
      .then(() => this.finishResponse()) // end attempt
      .then(() => this.finishClue()); // end turn
  }
  misanswerClue() {
    return this.penalizePlayer() // reduce score
      .then(() => this.setState({misanswer: this.buzz().answer})) // store incorrect answer locally
      .then(() => this.readAloud(this.pickRandomReply([
        `No`,
        `Nope`,
        `Incorrect`,
        `Wrong`,
        `That's not right`,
        `That's not it`,
        `That's incorrect`,
        `That's wrong`,
      ])))
      .then(() => this.finishResponse()) // end attempt

      .then(() => this.startIntervalTimer('answer')) // show attempted/wrong answer
      .then(() => this.setState({misanswer: null})) // clear incorrect answer

      // restart counter for remaining (non-DD) players, if any
      .then(() => {
        const clue = this.clue();
        if (clue && !clue.dd) {
          // ensure there are still players who can answer left
          if (clue.penalties && Object.keys(clue.penalties).length < this.numPlayers()) {
            return this.startIntervalTimer('clue');
          }
        }
      })

      .then(() => this.finishClue()); // end turn
  }
  finishClue() {
    return Promise.all([
      this.stopIntervalTimer('clue'), // just to make sure
      this.clue(true).child('finishedAt').set(firebase.database.ServerValue.TIMESTAMP),
      this.startIntervalTimer('answer'), // temporarily show the correct answer
    ])
      .then(() => this.round(true).child('pickedClueId').remove()); // clean up
  }

  // dollars
  rewardPlayer() {
    // @TODO: check clue and buzz
    return this.clue(true).child('rewards').child(this.buzz().playerId).set(this.buzz().wager || this.clue().value);
  }
  penalizePlayer() {
    // @TODO: check clue and buzz
    return this.clue(true).child('penalties').child(this.buzz().playerId).set(this.buzz().wager || this.clue().value);
  }

  // response
  showResponse(buzz) {
    if (!buzz || !buzz.$id) throw new Error('Invalid buzz');

    return this.stopIntervalTimer('clue')
      .then(() => this.clue(true).update({
        pickedBuzzId: buzz.$id,
        [`buzzes/${buzz.$id}/pickedAt`]: firebase.database.ServerValue.TIMESTAMP,
      }))
      .then(() => this.awaitResponse());
  }
  awaitResponse() {
    return new Promise(resolve => {
      // check for 'submittedAt' and skip timer if necessary
      this.buzz(true).child('submittedAt').on('value', snap => {
        if (snap.val()) {
          // manually submitted, no need to keep waiting
          return this.stopIntervalTimer('response')
            .then(resolve);
        }
      });

      // run timer until expiry
      return this.startIntervalTimer('response')
        .then(() => this.playSound('time'))
        .then(resolve);
    });
  }
  checkResponse() {
    // @TODO: check clue and buzz
    return new Promise((resolve, reject) => {
      const realAnswer = this.clue().answer;
      const givenAnswer = this.buzz().answer;
      const set = FuzzySet([
        realAnswer,
      ]);
      const match = set.get(givenAnswer);
      if (match && match.length) {
        const [likelihood] = match[0];
        console.info(realAnswer, '~=', givenAnswer, '@', likelihood);
        if (likelihood > this.props.answerThreshold) {
          return resolve();
        }
      }
      return reject();
    });
  }
  finishResponse() {
    return Promise.all([
      this.stopIntervalTimer('response'), // just to make sure
      this.buzz(true).child('finishedAt').set(firebase.database.ServerValue.TIMESTAMP),
      this.clue(true).child('pickedBuzzId').remove(),
    ]);
  }

  render() {
    const game = this.game();
    const round = this.round();
    const clue = this.clue();
    const buzz = this.buzz();

    const renderOverlay = () => {
      if (clue) {
        if (!clue.finishedAt && !this.state.misanswer) {
          return (
            <aside className={classNames('Clue', {canBuzz: clue.buzzesAt})}>
            {(!clue.dd || (buzz && buzz.wager)) &&
              <div>{clue.question}</div>
            }
            {(clue.dd && (!buzz || (buzz && !buzz.wager))) &&
              <div>DAILY DOUBLE</div>
            }
            {!buzz &&
              <Timer timeout={this.props.clueTimeout} time={this.state.clueTime} />
            }
            </aside>
          );
        } else {
          return (
            <aside className={classNames('Answer', {isCorrect: this.clue().rewards, isIncorrect: this.state.misanswer})} onClick={this.finishClue.bind(this)}>
              <div>{this.state.misanswer || clue.answer}</div>
            </aside>
          );
        }
      }
    };

    // console.log(
    //   this.state.clueTime,
    //   this.state.clueTimer,
    //   this.state.responseTime,
    //   this.state.responseTimer,
    //   this.state.answerTime,
    //   this.state.answerTimer,
    // );

    return (
      <div className="Host">
      {game === undefined &&
        <div>
          Loading…
        </div>
      }
      {game &&
        <header style={{display: 'flex', justifyContent: 'space-between', padding: 10}}>
          <div>
            Join Code: <input defaultValue={game.joinCode} readOnly />
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
          {game.round > 0 &&
            <button onClick={this.regressGame.bind(this)}>Previous Round</button>
          }
          {game.round < 3 &&
            <button onClick={this.advanceGame.bind(this)} disabled={this.numPlayers() < this.props.minPlayers}>{game.round ? 'Next Round' : 'Start Game'}</button>
          }
            <button onClick={this.cancelGame.bind(this)}>Delete Game</button>
          </div>
        </header>
      }
      {game && game.round > 0 &&
        <Board categories={this.round().categories} clues={this.round().clues} onPick={this.showClue.bind(this)}>
          {renderOverlay()}
        </Board>
      }
        <div className="Players">
        {this.getPlayerSeats().map((player, i) => {
          const isResponding = (player && buzz && buzz.playerId === player.$id && (!buzz.dailyDouble || (buzz.dailyDouble && buzz.wager)));
          return (
            <Player key={i} player={player} className={classNames({isResponding})}>
            {player &&
              <div>
                <button onClick={e=>this.removePlayer(player.$id)}>Remove Player</button>
                <div>{this.getPlayerScore(player.$id)}</div>
              {round.currentPlayerId === player.$id &&
                <div>&bull;</div>
              }
              </div>
            }
            {isResponding &&
              <Timer timeout={this.props.responseTimeout} time={this.state.responseTime} />
            }
            </Player>
          );
        })}
        </div>
      </div>
    );
  }
}
Host.defaultProps = {
  minPlayers: 1,
  maxPlayers: 3,
  answerThreshold: 0.75,
  clueTimeout: 5,
  responseTimeout: 10,
  answerTimeout: 2,
};

export default Host;
