import React, { Component } from 'react';

import './Board.css';

class Cell extends Component {
  render() {
    const value = this.props.value || 0;
    return (
      <div className="Cell">
      {!value &&
        <div className="empty"></div>
      }
      {value &&
        <div className="value">{value}</div>
      }
      </div>
    );
  }
}
Cell.defaultProps = {
  value: 0,
};

class Board extends Component {
  getCell(row, col) {
    return this.props.clues.find(clue => clue.row === row && clue.col === col) || {};
  }

  render() {
    const {categories, clues, round, onPick, className, ...props} = this.props;

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
                <Cell value={round * row * 200} />
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
  round:      0,
  onPick:     () => {},
};

export default Board;
