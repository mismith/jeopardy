import React, { Component } from 'react';
import classNames from 'classnames';

import './Board.css';

class Board extends Component {
  render() {
    const {
      categories,
      clues,
      onPick,
      children,
      ...props,
    } = this.props;

    // turn object-'array' into row/col nested list for faster retrieval
    let nestedClues = {};
    Object.entries(clues).forEach(([clueId, clue]) => {
      nestedClues[clue.row] = nestedClues[clue.row] || {};

      clue.$id = clueId;
      nestedClues[clue.row][clue.col] = clue;
    });
    function getClue(row, col) {
      return nestedClues && nestedClues[row] && nestedClues[row][col];
    }

    return (
      <div className="Board" {...props}>
        <header>
          {Object.entries(categories).map(([categoryId, category]) =>
            <div key={categoryId} className="Cell">
              <span>{category.name}</span>
            {category.comments &&
              <small>{category.comments}</small>
            }
            </div>
          )}
        </header>
      {[1,2,3,4,5].map(row =>
        <article key={row}>
        {[1,2,3,4,5,6].map(col => {
          const clue = getClue(row, col);
          if (!clue) return <div key={col} className="Cell" />;
          return (
          <div
            key={col}
            onClick={e => clue.pickedAt ? null : onPick(clue)}
            className={classNames('Cell', 'isClue', {hasValue: clue && !clue.pickedAt})}
          >
            ${clue.value}
          </div>
          );
        })}
        </article>
      )}
        {children}
      </div>
    );
  }
}
Board.defaultProps = {
  categories: {},
  clues:      {},
  onPick:     () => {},
};

export default Board;
