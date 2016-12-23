import React, { Component } from 'react';

import Player from './Player';

import './Players.css';

class Players extends Component {
  render() {
    return (
      <div className="Players">
      {this.props.players && Object.keys(this.props.players).map(playerId =>
        <Player key={playerId} player={this.props.players[playerId]} />
      )}
      </div>
    );
  }
}
Players.defaultProps = {
  players: null,
  minPlayers: 2,
  maxPlayers: 3,
};

export default Players;
