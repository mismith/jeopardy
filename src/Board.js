import React, { Component } from 'react';

import './Board.css';

class Board extends Component {
  getCell(row, col) {
    return this.props.clues && this.props.clues.find(clue => clue && clue.row === row && clue.col === col);
  }

  render() {
    const {categories, clues, round, onPick, ...props} = this.props;

    return (
      <div className="Board" {...props}>
        <table width="100%" height="100%">
          <thead>
            <tr>
            {categories.map((category, col) =>
              <th key={col}>
                <span>{category.name}</span>
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
              <td key={col}>
                <div onClick={e=>onPick(row, col, round * row * 200)} className="Cell">
                  {this.getCell(row, col) && '$' + round * row * 200}
                </div>
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
  clues:      [], // only those remaining
  round:      0,  // needed for the automatic values
  onPick:     () => {},
};

export default Board;
