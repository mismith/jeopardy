import React, { Component } from 'react';

import {browserHistory} from 'react-router';
import firebase from './utils/firebase';

import UserInfo from './UserInfo';

//import './Buzzer.css';

class Buzzer extends Component {
  state = {
    answer: '',
    game:   undefined,
    player: undefined,
    user:   undefined,
  }

  componentWillMount() {
    firebase.sync(this, 'game', `games/${this.props.params.gameId}`);
    firebase.sync(this, 'player', `games:players/${this.props.params.gameId}/${this.props.params.playerId}`)
      .once('value', snap => {
        const userId = snap.child('userId').val();
        if (userId) {
          firebase.sync(this, 'user', `users/${userId}`);
        }
      });
    firebase.sync(this, 'connected', `.info/connected`)
      .on('value', snap => {
        if (snap.val() === true) {
          this.firebaseRefs.connection = this.firebaseRefs.player.child('connections').push(true);
          this.firebaseRefs.connection.onDisconnect().remove();
        }
      });
  }
  componentWillUnmount() {
    if (this.firebaseRefs.connection) this.firebaseRefs.connection.remove();
    firebase.unsync(this, 'game', 'player', 'user', 'connected');
  }

  buzzIn() {
    this.firebaseRefs.game.child('currentCell/buzzes').push({
      playerId: this.props.params.playerId,
      buzzedAt: firebase.database.ServerValue.TIMESTAMP,
    });
  }
  leaveGame(e) {
    if (e.shiftKey || confirm(`Are you sure?`)) {
      this.firebaseRefs.player.remove()
        .then(() => {
          browserHistory.push(`/`);
        });
    }
  }

  handleResponse(e) {
    e.preventDefault();
    
    this.firebaseRefs.game.child('currentCell/currentResponse/answer').set(this.state.answer);
  }

  render() {
    return (
      <div className="Buzzer">
      {this.state.user &&
        <UserInfo user={this.state.user} />
      }
      {this.state.player &&
        <button onClick={this.leaveGame.bind(this)}>Leave Game</button>
      }
      {this.state.game &&
        <div>
          <button onClick={this.buzzIn.bind(this)} disabled={!this.state.game.currentCell}>Buzz In</button>
        {this.state.game.currentCell && this.state.game.currentCell.currentResponse && this.state.game.currentCell.currentResponse.playerId === this.props.params.playerId &&
          <form onSubmit={this.handleResponse.bind(this)}>
            <input onChange={e=>this.setState({answer: e.currentTarget.value || ''})} placeholder="What is..." autoFocus></input>
            <button type="submit">Submit</button>
          </form>
        }
        </div>
      }
      {this.props.children}
      </div>
    );
  }
}

export default Buzzer;
