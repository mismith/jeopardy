import React, { Component } from 'react';
import classNames from 'classnames';

import './Board.css';

class Board extends Component {
  getCell(row, col) {
    // @TODO: add caching? (or at least remove duplicate calls)
    return this.props.clues && this.props.clues.find(clue => clue && clue.row === row && clue.col === col);
  }

  render() {
    const {categories, clues, round, onPick, children, ...props} = this.props;

    return (
      <div className="Board" {...props}>
        <header>
          {categories.map((category, col) =>
            <div key={col} className="Cell">
              <span>{category.name}</span>
            {category.comments &&
              <button title={category.comments}>?</button>
            }</div>
          )}
        </header>
      {[1,2,3,4,5].map(row =>
        <article key={row}>
        {[1,2,3,4,5,6].map(col => 
          <div key={col} onClick={e=>onPick(row, col)} className={classNames('Cell', {hasValue: this.getCell(row, col)})}>
            {this.getCell(row, col) && '$' + this.getCell(row, col).value}
          </div>
        )}
        </article>
      )}
        {children}
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
