import React from 'react';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';

import CountdownTimer from './CountdownTimer';

export default class Lecturn extends React.Component {
  render() {
    const {
      G,
      ctx,
      gameID,
      playerID,
      timerValue,
    } = this.props;

    const player = G.players[playerID];
    const isResponding = G.screenPlayerID === playerID;

    const style = {
      height: '100%',
      transform: isResponding ? 'translate3d(0, 0, 0)' : 'translate3d(0, 32px, 0)',
      borderTopRightRadius: 8,
      borderTopLeftRadius: 8,
      borderBottomRightRadius: 0,
      borderBottomLeftRadius: 0,
    };

    return (
      <Paper style={style}>
        <Grid container direction="column">
          <Grid item container justify="center" style={{padding: 8, paddingBottom: 0}}>
            {(player && player.name) || 'Join with Game Code:'}
            {ctx.currentPlayer === playerID &&
              <strong>&nbsp;•</strong>
            }
          </Grid>
          <Grid item xs={12} style={{padding: 8}}>
            <TextField
              variant="outlined"
              fullWidth
              defaultValue={player && player.name ? player.score : gameID}
              inputProps={{style: {fontSize: 24, textAlign: 'center', padding: 8}, readOnly: true}}
            />
          </Grid>
          <CountdownTimer
            value={timerValue}
            persist
            style={{height: 32}}
          />
        </Grid>
      </Paper>
    );
  }
}
