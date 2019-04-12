import React from 'react';
import Grid from '@material-ui/core/Grid';

import Clue from './Clue';

export default class Clues extends React.Component {
  render() {
    const {
      G,
      ctx,
      timerValue,
    } = this.props;
    const round = G.rounds[G.roundIndex];
    const categories = (round && round.categories) || [];

    const style = {
      ...this.props.style,
      position: 'relative',
      width: 'calc(100% - 24px)',
      flexWrap: 'nowrap',
      margin: 16,
      marginLeft: 12,
      marginRight: 12,
    };

    return (
      <Grid container spacing={8} style={style}>
        {categories.map((category, categoryIndex) =>
          <Grid key={categoryIndex} item container direction="column" spacing={8}>
            <Grid item xs style={{marginBottom: 12}}>
              <Clue>
                {category.name}
              </Clue>
            </Grid>
            {category.clues.map((clue, clueIndex) =>
              <Grid key={clueIndex} item xs>
                <Clue
                  {...{G, ctx, clue, timerValue}}
                  onClick={() => this.props.moves.pickClue({ categoryIndex, clueIndex })}
                />
              </Grid>
            )}
          </Grid>
        )}
      </Grid>
    );
  }
}
