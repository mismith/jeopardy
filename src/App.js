import React, { Component } from 'react';
import './App.css';

class App extends Component {
  render() {
    const board = {
      categories: [
        {name: 'Cat1'},
        {name: 'Cat2'},
        {name: 'Cat3'},
        {name: 'Cat4'},
        {name: 'Cat5'},
        {name: 'Cat6'},
      ],
      values: [
        200,
        400,
        600,
        800,
        1000,
      ],
      clues: {
        Cat1: {
          200: {question: 'ques11'},
          400: {question: 'ques12'},
          600: {question: 'ques13'},
          800: {question: 'ques14'},
          1000: {question: 'ques15'},
        },
        Cat2: {
          200: {question: 'ques21'},
          400: {question: 'ques22'},
          600: {question: 'ques23'},
          800: {question: 'ques24'},
          1000: {question: 'ques25'},
        },
        Cat3: {
          200: {question: 'ques31'},
          400: {question: 'ques32'},
          600: {question: 'ques33'},
          800: {question: 'ques34'},
          1000: {question: 'ques35'},
        },
        Cat4: {
          200: {question: 'ques41'},
          400: {question: 'ques42'},
          600: {question: 'ques43'},
          800: {question: 'ques44'},
          1000: {question: 'ques45'},
        },
        Cat5: {
          200: {question: 'ques51'},
          400: {question: 'ques52'},
          600: {question: 'ques53'},
          800: {question: 'ques54'},
          1000: {question: 'ques55'},
        },
        Cat6: {
          200: {question: 'ques61'},
          400: {question: 'ques62'},
          600: {question: 'ques63'},
          800: {question: 'ques64'},
          1000: {question: 'ques65'},
        },
      }
    };
    return (
      <div className="App">
        <table width="100%" height="100%">
          <thead>
            <tr>
            {board.categories.map(category =>
              <th key={category.name}>{category.name}</th>
            )}
            </tr>
          </thead>
          <tbody>
          {board.values.map(value =>
            <tr key={value}>
            {board.categories.map(category =>
              <td key={category.name}>{board.clues[category.name][value].question}</td>
            )}
            </tr>
          )}
          </tbody>
        </table>
      </div>
    );
  }
}

export default App;
