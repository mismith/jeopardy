import React, { Component } from 'react';

//import './Game.css';

class Game extends Component {
  render() {
    return (
      <div className="Game">
        {this.props.children}
      </div>
    );
  }
}

export default Game;
