import React, { Component } from 'react';

import {browserHistory} from 'react-router';
import firebase from './utils/firebase';

import Board from './Board';
import Player from './Player';

import './Host.css';

class Host extends Component {
  state = {
    game:    undefined,
    players: undefined,
  }

  componentWillMount() {
    firebase.sync(this, 'game', `games/${this.props.params.gameId}`);
    firebase.sync(this, 'players', `games:players/${this.props.params.gameId}`);
  }
  componentWillUnmount() {
    firebase.unsync(this, 'game', 'players');
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

  pickCell(cell) {
    const currentCellRef = this.firebaseRefs.game.child('currentCell');

    // buzzing enabled (but they will be penalized if they buzz now)
    currentCellRef.set(cell);

    setTimeout(() => {
      // start allowing/accepting buzzes
      currentCellRef.child('buzzesAt').set(firebase.database.ServerValue.TIMESTAMP);

      cell.$timeout = setTimeout(() => {
        currentCellRef.child('expired').set(true, () => {
          this.finalizeCell(cell);
        });
      }, 5000);
    }, 1000 + Math.random()*2000); // simulate reading the clue

    // track buzzes
    currentCellRef.child('buzzes').on('child_added', snap => {
      const buzz = snap.val();
      currentCellRef.once('value')
        .then(snap => snap.val())
        .then(cell => {
          if (!cell.currentAttempt && cell.buzzesAt && buzz.buzzedAt >= cell.buzzesAt) {
            // legit buzz, begin attempt
            currentCellRef.child('currentAttempt').set(buzz);
            console.log('hit');
            return;
          }
          // buzz wasn't good (e.g. too early)
          // @TODO: penalize the player
        });
    });
  }
  finalizeCell(cell) {
    if (cell.$timeout) clearTimeout(cell.$timeout);

    const currentCellRef = this.firebaseRefs.game.child('currentCell');
    currentCellRef.once('value')
      .then(snap => {
        // move to archived list
        this.firebaseRefs.game.child('usedCells').push(snap.val(), () => {
          currentCellRef.remove();
        });
      });
  }

  handlePick(cell, status) {
    console.log(cell, status);
    switch(status) {
      case 1:
        this.pickCell(cell);
        break;
    }
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
        <div>
          <div className="flex-row" style={{justifyContent: 'space-between'}}>
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
              <button onClick={this.advanceGame.bind(this)} disabled={this.numPlayers() < this.props.minPlayers}>{this.state.game.round ? 'Next Round' : 'Start Game'}</button>
              <button onClick={this.cancelGame.bind(this)}>Delete Game</button>
            </div>
          </div>
        {this.state.game.round > 0 &&
          <Board round={this.state.game.round} onPick={this.handlePick.bind(this)} className={this.state.game.currentCell && this.state.game.currentCell.buzzesAt && 'canBuzz'} />
        }
        </div>
      }
        <div className="Players">
        {this.getPlayerSeats().map((player, i) =>
          <Player key={i} player={player}>
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
