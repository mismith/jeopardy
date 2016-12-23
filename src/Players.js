import React, { Component } from 'react';

import Player from './Player';

import './Players.css';

class Players extends Component {
  render() {
    let seats = [];
    if (this.props.players) {
      Object.keys(this.props.players).forEach(playerId => {
        const seat = this.props.players[playerId];
        if (seat.active) seats.push(seat);
      });
    }
    while(seats.length < this.props.maxPlayers) {
      seats.push({});
    };

    return (
      <div className="Players">
      {seats.map((seat, i) =>
        <Player key={i} name={seat.name} dollars={seat.dollars} />
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
