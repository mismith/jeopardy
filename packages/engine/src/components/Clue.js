import React from 'react';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';

import {
  isCurrentClue,
} from '../helpers/game';

import CountdownTimer from './CountdownTimer';

export default class Clue extends React.Component {
  render() {
    const {
      G,
      ctx,
      clue,
      timerValue,
      onClick,
      children,
    } = this.props;

    const isCurrent = isCurrentClue(G, ctx, clue);

    const style = {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
    };
    const floating = {
      display: 'flex',
      flexDirection: 'column',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '100%',
      overflow: 'hidden',
    };

    return (
      <Paper onClick={() => clue && !clue.picked && onClick && onClick(clue)} style={style}>
        {clue && isCurrent ? (
          <Paper style={floating}>
            <Grid item container justify="center" alignItems="center" style={{flexGrow: 1, padding: 32, paddingBottom: 0}}>
              {!clue.isWagered || clue.wagers ? clue.prompt : 'Daily Double'}
            </Grid>
            <div style={{height: 32}}>
              <CountdownTimer
                value={timerValue}
                style={{height: 32}}
              />
            </div>
          </Paper>
        ) : (
          <Grid item>{children || (clue && !clue.picked && clue.value)}</Grid>
        )}
      </Paper>
    );
  }
}
