import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Pause from '@material-ui/icons/Pause';
import PlayArrow from '@material-ui/icons/PlayArrow';
import MoreVert from '@material-ui/icons/MoreVert';

import CountdownTimer from './CountdownTimer';

export default class HUD extends React.Component {
  render() {
    return (
      <AppBar position="static" style={{position: 'relative'}}>
        <Toolbar>
          <Typography variant="title" color="inherit" style={{marginRight: 'auto'}}>
            Game Code: {this.props.gameID}
          </Typography>

          {this.props.G.roundIndex >= 0 && !this.props.ctx.gameover &&
            <IconButton color="inherit" onClick={this.props.onPauseToggle}>
              {this.props.isPaused ? (
                <PlayArrow />
              ) : (
                <Pause />
              )}
            </IconButton>
          }
          <IconButton color="inherit">
            <MoreVert />
          </IconButton>
        </Toolbar>
        <CountdownTimer
          value={this.props.timerValue}
          style={{position: 'absolute', left: 0, right: 0, bottom: 0}}
        />
      </AppBar>
    );
  }
}
