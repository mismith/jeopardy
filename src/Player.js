import React, { Component } from 'react';

//import './Player.css';

class Player extends Component {
  render() {
    return (
      <div className="Player">
        <div className="name">{this.props.name}</div>
        <div className="dollars">${this.props.dollars}</div>
      </div>
    );
  }
}
Player.defaultProps = {
  active: false,
  name: 'Player Name',
  dollars: 0,

  minPlayers: 2,
  maxPlayers: 3,
};

export default Player;
