import React, { Component } from 'react';

import firebase from './utils/firebase';

import Board from './Board';
import Players from './Players';

import './Display.css';

class Display extends Component {
  state = {
    isStarted: false,
    buzzers: null,
  }

  componentWillMount() {
    firebase.sync(this, 'buzzers', `games/${this.props.params.gameId}/buzzers`);
  }
  componentWillUnmount() {
    firebase.unsync(this, 'buzzers');
  }

  numPlayers() {
    return this.state.buzzers ? Object.keys(this.state.buzzers).length : 0;
  }

  render() {
    return (
      <div className="Display">
      {!this.state.isStarted &&
        <div>
          <div>
            Join Game ID: <input defaultValue={this.props.params.gameId} readOnly />
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
            <button onClick={e=>this.setState({isStarted: true})} disabled={this.numPlayers() < 2}>Start Game</button>
          </div>
        </div>
      }
      {this.state.isStarted &&
        <Board />
      }
        <Players players={this.state.buzzers} />
      </div>
    );
  }
}
Display.defaultProps = {
  minPlayers: 2,
  maxPlayers: 3,
};

export default Display;
