import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';

const styles = {
  bar: {
    transition: 'none',
  },
};

class CountdownTimer extends React.Component {
  render() {
    const { value, persist, classes, ...props } = this.props;

    if (!this.props.value && !persist) {
      return null;
    }

    return (
      <LinearProgress
        variant="determinate"
        value={value || 100}
        classes={{
          bar: classes.bar,
        }}
        {...props}
      />
    );
  }
}

export default withStyles(styles)(CountdownTimer);
