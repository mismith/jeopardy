import React, { Component } from 'react';

import firebase from './utils/firebase';

import Board from './Board';
import Scores from './Scores';

import './Host.css';

class Host extends Component {
  state = {
    game:    undefined,
    players: undefined,
    status:  0,
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

  render() {
    return (
      <div className="Host">
      {!this.state.status && this.state.game &&
        <div>
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
            <button onClick={e=>this.setState({status: 1})} disabled={this.numPlayers() < 2}>Start Game</button>
          </div>
        </div>
      }
      {this.state.status > 0 &&
        <Board />
      }
      {this.state.players &&
        <Scores players={this.state.players} />
      }
      </div>
    );
  }
}
Host.defaultProps = {
  minPlayers: 2,
  maxPlayers: 3,
};

export default Host;
