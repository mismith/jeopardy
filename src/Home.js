import React, { Component } from 'react';

import {browserHistory} from 'react-router';
import firebase from './utils/firebase';

//import './Home.css';

class Home extends Component {
  state = {
    me: undefined,
  }

  login() {
    return firebase.auth().signInWithRedirect(new firebase.auth.FacebookAuthProvider());
  }
  logout() {
    return firebase.auth().signOut();
  }

  hostGame() {
    if (!this.state.me || !this.state.me.uid) throw new Error('You must be logged in first');

    const gamesRef = firebase.database().ref(`games`);
    gamesRef.once('value', snapshot => {
      // check if there are any existing games
      const games = snapshot.val();
      if (games) {
        // there are existing games, so let's check if I am already hosting any of those
        const hostedGameIds = Object.keys(games).filter(gameId => {
          return snapshot.child(gameId).child(`userId`).val() === this.state.me.uid;
        });
        if (hostedGameIds.length) {
          // they are hosting at least one game, so let's re-join one
          // @TODO: let me pick one, or be able to create a new one
          console.log('hostedGameIds', hostedGameIds);
          const selectedGameIndex = Math.floor(Math.random()*hostedGameIds.length); 
          const hostedGameId = hostedGameIds[selectedGameIndex]; 

          // redirect
          return browserHistory.push(`/game/${hostedGameId}`);
        } else {
          // they aren't hosting any games, so let's create a new one by falling back to below
        }
      }

      // let's host a new game
      const gameRef = firebase.database().ref(`games`).push({
        joinCode: Math.random().toString(36).substr(2,5).toUpperCase(),
        userId: this.state.me.uid,
        createdAt: new Date().toISOString(),
      })
      gameRef.then(() => {
        browserHistory.push(`/game/${gameRef.key}`);
      });
    });
  }
  joinGame() {
    if (!this.state.me || !this.state.me.uid) throw new Error('You must be logged in first');
    
    const gamesRef = firebase.database().ref(`games`);
    gamesRef.once('value', snapshot => {
      // check if there are any existing games
      const games = snapshot.val();
      if (games) {
        // auto-pick the first game if there's only one to pick from
        const joinCode = Object.keys(games).length === 1 ? games[Object.keys(games)[0]].joinCode : prompt('Enter the on-screen Join Code:');
        // otherwise, check that my input code is valid
        if (/^[a-z0-9]+$/ig.test(joinCode)) {
          // search to see if it matches any games
          const gameId = Object.keys(games).find(gameId => {
            return games[gameId].joinCode === joinCode;
          });
          if (gameId) {
            // the join code matches, let's try joining
            const playersRef = firebase.database().ref(`games:players/${gameId}`);
            playersRef.once('value')
              .then(snapshot => {
                const players = snapshot.val() || {},
                      numPlayers = Object.keys(players).length;

                // determine if I already had a spot
                let userPlayerId;
                Object.keys(players).forEach(playerId => {
                  if(players[playerId].userId === this.state.me.uid) {
                    userPlayerId = playerId;
                  }
                });
                if (userPlayerId) {
                  // user was already playing, so let's re-join
                  browserHistory.push(`/game/${gameId}/buzzer/${userPlayerId}`);
                } else {
                  // they havn't played yet, so let's see if they can join
                  if (numPlayers < this.props.maxPlayers) {
                    // there's a free spot, so let's join!
                    const playerRef = playersRef.push({
                      userId: this.state.me.uid,
                    });
                    playerRef.then(() => {
                      // redirect
                      browserHistory.push(`/game/${gameId}/buzzer/${playerRef.key}`);
                    });
                  } else {
                    throw new Error(`That game has no room left`);
                  }
                }
              });
          } else {
            throw new Error(`That Join Code doesn't match any game`);
          }
        } else {
          throw new Error(`Please enter a valid Join Code`);
        }
      } else {
        throw new Error(`There aren't any games to join`);
      }
    });
  }

  componentWillMount() {
    firebase.auth().onAuthStateChanged(me => {
      this.setState({
        me,
      });
      if (me) {
        firebase.database().ref(`users/${me.uid}`).update(me.providerData[0]);
      }
    });
  }

  render() {
    return (
      <div className="Home">
      {this.state.me === undefined &&
        <div>
          Loading…
        </div>
      }
      {this.state.me === null &&
        <div>
          <button onClick={this.login.bind(this)}>Login with Facebook</button>
        </div>
      }
      {this.state.me &&
        <div>
          <button onClick={this.hostGame.bind(this)}>Host Game</button>
          <button onClick={this.joinGame.bind(this)}>Join Game</button>

          <br />
          <button onClick={this.logout.bind(this)}>Logout</button>
        </div>
      }
      </div>
    );
  }
}
Home.defaultProps = {
  minPlayers: 2,
  maxPlayers: 3,
};

export default Home;
