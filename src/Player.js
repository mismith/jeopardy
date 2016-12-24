import React, { Component } from 'react';

import firebase from './utils/firebase';

import UserInfo from './UserInfo';

//import './Player.css';

class Player extends Component {
  state = {
    user: undefined,
  }

  bindUser(props = this.props) {
    if (props.player && props.player.userId) {
      firebase.sync(this, 'user', `users/${props.player.userId}`);
    } else {
      this.setState({
        user: null,
      });
    }
  }

  componentWillMount() {
    this.bindUser();
  }
  componentWillReceiveProps(nextProps) {
    this.bindUser(nextProps);
  }
  componentWillUnmount() {
    firebase.unsync(this, 'user');
  }

  render() {
    return (
      <div className="Player">
      {this.state.user === undefined && 
        <div>
          Loading…
        </div>
      }
      {this.state.user === null && 
        <div>
          <em>Waiting for player…</em>
        </div>
      }
      {this.state.user &&
        <div>
          <UserInfo user={this.state.user} />
        {this.props.player && this.props.player.dollars &&
          <div className="dollars">${this.props.player.dollars}</div>
        }
        </div>
      }
      </div>
    );
  }
}
Player.defaultProps = {
  player: undefined,
};

export default Player;
