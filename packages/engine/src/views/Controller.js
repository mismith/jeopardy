import React from 'react';
import { Client } from 'boardgame.io/react';
import Grid from '@material-ui/core/Grid';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MoreVert from '@material-ui/icons/MoreVert';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Slider from '@material-ui/lab/Slider';

// import {
//   getCurrentClue,
// } from '../helpers/game';

import game from '../Game';

class Controller extends React.Component {
  state = {
    wager: null,
    wagerError: false,
    wagerErrorMessage: '',
  };

  // getCurrentClue() {
  //   return getCurrentClue(this.props.G, this.props.ctx);
  // }

  handleWagerInput(event, sliderValue = undefined) {
    const wager = Number.parseInt(sliderValue || event.target.value, 10) || 0;
    // @TODO: validate
    this.setState({ wager });
  }
  handleSubmitWager(event) {
    event.preventDefault();

    // @TODO: validate
    const value = this.state.wager;

    this.props.moves.submitWager({ value });
  }

  render() {
    const playerCanAct = this.props.ctx.actionPlayers.includes(this.props.playerID);
    const playerCanSubmitWager = playerCanAct && this.props.ctx.allowedMoves.includes('submitWager');
    const playerCanSubmitBuzz = playerCanAct && this.props.ctx.allowedMoves.includes('submitBuzz');

    return (
      <Grid container direction="column">
        <AppBar position="static">
          <Toolbar>
            <Typography component="h2" variant="title" color="inherit">
              Player {this.props.playerID}
              {this.props.ctx.currentPlayer === this.props.playerID &&
                <strong> •</strong>
              }
            </Typography>
            <IconButton color="inherit" style={{marginLeft: 'auto'}}>
              <MoreVert />
            </IconButton>
          </Toolbar>
        </AppBar>
        {playerCanSubmitWager ? (
          <form onSubmit={this.handleSubmitWager.bind(this)} style={{padding: 16}}>
            <Grid container direction="column" spacing={16}>
              <Grid item>
                <TextField
                  type="number"
                  label="Your Wager"
                  variant="outlined"
                  fullWidth
                  autoFocus
                  required
                  pattern={/^[0-9]+$/}
                  error={!!this.state.wagerError}
                  helperText={this.state.wagerErrorMessage}
                  value={this.state.wager || ''}
                  onInput={this.handleWagerInput.bind(this)}
                />
              </Grid>
              <Grid item container alignItems="center">
                <Grid item>0</Grid>
                <Grid item xs style={{padding: 16}}>
                  <Slider
                    min={0}
                    max={2000}
                    step={1}
                    value={this.state.wager || 0}
                    onChange={this.handleWagerInput.bind(this)}
                  />
                </Grid>
                <Grid item>2000</Grid>
              </Grid>
              <Grid item>
                <Button type="submit" variant="contained" color="primary" size="large" fullWidth>Submit</Button>
              </Grid>
            </Grid>
          </form>
        ) : (
          <Button
            variant="contained"
            color="primary"
            disabled={!playerCanSubmitBuzz}
            onClick={() => this.props.moves.submitBuzz()}
            style={{flexGrow: 1, margin: 16}}
          >
            Buzz
          </Button>
        )}
      </Grid>
    );
  }
}

export default Client({
  game,
  board: Controller,
  multiplayer: { server: 'localhost:3030' },
  // debug: false,
});
