import React, { Component } from 'react';

import firebase from '../utils/firebase';

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
    const {
      player,
      className,
      children,
      ...props,
    } = this.props;
    
    return (
      <div className={`Player ${className}`} {...props}>
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
        {player && player.dollars &&
          <div className="dollars">${player.dollars}</div>
        }
        </div>
      }
      {player &&
        <div>
        {!this.props.player.connections &&
          <div><em>Disconnected</em></div>
        }
        </div>
      }
      {children}
      </div>
    );
  }
}
Player.defaultProps = {
  player: undefined,
};

export default Player;
