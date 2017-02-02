import React, { Component } from 'react';

import './Board.css';

class Cell extends Component {
  render() {
    const cell = this.props.data || {},
          status = this.props.status || 0;
    return (
      <div className="Cell">
      {!cell.value &&
        <div className="empty"></div>
      }
      {cell.value && status === 0 &&
        <div className="value">{cell.value}</div>
      }
      {cell.value && status === 1 &&
        <div className="question">{cell.question}</div>
      }
      {cell.value && status === 2 &&
        <div className="answer">{cell.answer}</div>
      }
      </div>
    );
  }
}
Cell.defaultProps = {
  cell:    undefined,
  status:  0,
}

class Board extends Component {
  getCell(row, col) {
    return this.props.clues.find(clue => clue.row === row && clue.col === col) || {};
  }

  render() {
    const {categories, clues, onPick, className, ...props} = this.props;

    return (
      <div className={`Board ${className}`} {...props}>
        <table width="100%" height="100%">
          <thead>
            <tr>
            {categories.map((category, col) =>
              <th key={col}>
                {category.name}
              {category.comments &&
                <button title={category.comments}>?</button>
              }</th>
            )}
            </tr>
          </thead>
          <tbody>
          {[1,2,3,4,5].map(row =>
            <tr key={row}>
            {[1,2,3,4,5,6].map(col => 
              <td key={col} onClick={e=>onPick(row, col)}>
                <Cell data={this.getCell(row, col)} />
              </td>
            )}
            </tr>
          )}
          </tbody>
        </table>
      </div>
    );
  }
}
Board.defaultProps = {
  categories: [],
  clues:      [],
  onPick:     () => {},
};

export default Board;
