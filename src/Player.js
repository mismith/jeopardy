import React, { Component } from 'react';

//import './Player.css';

class Player extends Component {
  render() {
    return (
      <div className="Player">
        <div>{this.props.player.name}</div>
        <div>${this.props.player.dollars || 0}</div>
      </div>
    );
  }
}
Player.defaultProps = {
  player: null,
  minPlayers: 2,
  maxPlayers: 3,
};

export default Player;
