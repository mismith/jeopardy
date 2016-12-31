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
    firebase.unsync(this, 'game');
    firebase.unsync(this, 'players');
  }

  numPlayers() {
    return this.state.players ? Object.keys(this.state.players).length : 0;
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

  render() {
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
              <button onClick={this.advanceGame.bind(this)} disabled={this.numPlayers() < this.props.minPlayers}>{this.state.game.round ? 'Next Round' : 'Start Game'}</button>
              <button onClick={this.cancelGame.bind(this)}>Cancel Game</button>
            </div>
          </div>
        {this.state.game.round > 0 &&
          <Board round={this.state.game.round} />
        }
        </div>
      }
        <div className="Players">
        {players.map((player, i) =>
          <Player key={i} player={player}>
            <button>Remove player</button>
          </Player>
        )}
        </div>
      </div>
    );
  }
}
Host.defaultProps = {
  minPlayers: 2,
  maxPlayers: 3,
};

export default Host;
