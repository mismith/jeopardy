import React, { Component } from 'react';
import classNames from 'classnames';

import './Timer.css';

class Timer extends Component {
  arrayPyramid(max) {
    return Array.from(Array(max * 2 - 1)).map((v,i,a) => i >= max ? max * 2 - i - 1 : i + 1);
  }

  render() {
    return (
      <figure className="Timer">
      {this.arrayPyramid(this.props.timeout).map((t, i) =>
        <div key={i} className={classNames({elapsed: this.props.time >= t})}></div>
      )}
      </figure>
    );
  }
}
Timer.defaultProps = {
  timeout: 5,
  time:    0,
};

export default Timer;
