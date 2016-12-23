import React, { Component } from 'react';

class UserInfo extends Component {
  render() {
    return (
      <div className="UserInfo">
      {this.props.user === undefined &&
        <div>
          Loading…
        </div>
      }
      {this.props.user === null &&
        <div>
          <em>Unknown User</em>
        </div>
      }
      {this.props.user &&
        <div>
          <img src={this.props.user.photoURL} alt={this.props.user.displayName} height="48" />
          <div className="name">{this.props.user.displayName}</div>
        </div>
      }
      </div>
    );
  }
}
UserInfo.defaultProps = {
  user: undefined,
};

export default UserInfo;
