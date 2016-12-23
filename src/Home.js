import React, { Component } from 'react';

import {browserHistory} from 'react-router';
import firebase from './utils/firebase';

//import './Home.css';

class Home extends Component {
  newGame() {
    const boardId = prompt('Which board do you want to play?');
    const gameId = Math.random().toString(36).substr(2,5).toUpperCase();
    firebase.database().ref(`/games/${gameId}`).set({
      boardId,
      createdAt: new Date().toISOString(),
      active: true,
    }).then(() => {
      browserHistory.push(`/game/${gameId}`);
    });
  }
  joinGame() {
    const gameId = prompt('Enter the Game ID on the screen:');
    if (gameId) {
      // check if it matches a currently running game
      const gameRef = firebase.database().ref(`/games/${gameId}`);
      gameRef.once('value').then(snapshot => {
        if (snapshot.val()) {
          if (snapshot.child('active').val()) {
            // game is active, let's see if we can join
            // check that the game is accepting new players
            const players = snapshot.child('buzzers').val() || {},
                  numPlayers = Object.keys(players).length;
            if (numPlayers < this.props.maxPlayers) {
              // there's a spot free, let's join!
              const playerName = prompt(`What's your name?`);
              const playerRef = gameRef.child('buzzers').push({
                name: playerName,
              });
              playerRef.then(() => {
                browserHistory.push(`/game/${gameId}/buzzer/${playerRef.key}`);
              });
            } else {
              throw new Error(`That game has no room left`);
            }
          } else {
            throw new Error(`That game isn't active right now`);
          }
        } else {
          throw new Error(`That Game ID doesn't exist`);
        }
      });
    } else {
      throw new Error(`You need to enter a Game ID`);
    }
  }
  render() {
    return (
      <div className="Home">
        <button onClick={this.newGame.bind(this)}>New Game</button>
        <button onClick={this.joinGame.bind(this)}>Join Game</button>
      </div>
    );
  }
}
Home.defaultProps = {
  minPlayers: 2,
  maxPlayers: 3,
};

export default Home;
