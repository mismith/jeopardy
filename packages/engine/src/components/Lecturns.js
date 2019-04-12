import React from 'react';
import Grid from '@material-ui/core/Grid';

import Lecturn from './Lecturn';

export default class Lecturns extends React.Component {
  render() {
    return (
      <Grid container spacing={16} style={{width: 'calc(100% - 16px)', marginLeft: 8, marginRight: 8}}>
        {['0', '1', '2'].map(playerID =>
          <Grid key={playerID} item xs style={{marginTop: -32}}>
            <Lecturn
              {...this.props}
              playerID={playerID}
            />
          </Grid>
        )}
      </Grid>
    );
  }
}
