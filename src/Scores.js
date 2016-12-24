import React, { Component } from 'react';

import Player from './Player';

import './Scores.css';

class Scores extends Component {
  render() {
    let players = [];
    if (this.props.players) {
      Object.keys(this.props.players).forEach(playerId => {
        players.push(this.props.players[playerId]);
      });
    }
    while(players.length < this.props.maxPlayers) {
      players.push(null);
    };
    
    return (
      <div className="Scores">
      {players.map((player, i) =>
        <Player key={i} player={player} />
      )}
      </div>
    );
  }
}
Scores.defaultProps = {
  players: undefined,

  minPlayers: 2,
  maxPlayers: 3,
};

export default Scores;
