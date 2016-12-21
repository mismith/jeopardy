import React, { Component } from 'react';
import './App.css';

class App extends Component {
  render() {
    const gameRows = [
      {
        "show_number": 1,
        "round": 1,
        "value": 100,
        "category": "LAKES & RIVERS",
        "clue": "River mentioned most often in the Bible",
        "answer": "the Jordan",
        "air_date": "1984-09-10"
      },
      {
        "show_number": 1,
        "round": 1,
        "value": 100,
        "category": "INVENTIONS",
        "clue": "Marconi's wonderful wireless",
        "answer": "the radio",
        "air_date": "1984-09-10"
      },
      {
        "show_number": 1,
        "round": 1,
        "value": 100,
        "category": "ANIMALS",
        "clue": "These rodents first got to America by stowing away on ships",
        "answer": "rats",
        "air_date": "1984-09-10"
      },
      {
        "show_number": 1,
        "round": 1,
        "value": 100,
        "category": "FOREIGN CUISINE",
        "clue": "The \"coq\" in coq au vin",
        "answer": "chicken",
        "air_date": "1984-09-10"
      },
      {
        "show_number": 1,
        "round": 1,
        "value": 100,
        "category": "ACTORS & ROLES",
        "clue": "Video in which Michael Jackson plays a werewolf & a zombie",
        "answer": "\"Thriller\"",
        "air_date": "1984-09-10"
      },
      {
        "show_number": 1,
        "round": 1,
        "value": 200,
        "category": "LAKES & RIVERS",
        "clue": "Scottish word for lake",
        "answer": "loch",
        "air_date": "1984-09-10"
      },
      {
        "show_number": 1,
        "round": 1,
        "value": 200,
        "category": "INVENTIONS",
        "clue": "In 1869 an American minister created this \"oriental\" transportation",
        "answer": "the rickshaw",
        "air_date": "1984-09-10"
      },
      {
        "show_number": 1,
        "round": 1,
        "value": 200,
        "category": "ANIMALS",
        "clue": "There are about 40,000 muscles & tendons in this part of an elephant's body",
        "answer": "the trunk",
        "air_date": "1984-09-10"
      },
      {
        "show_number": 1,
        "round": 1,
        "value": 200,
        "category": "FOREIGN CUISINE",
        "clue": "A British variety is called \"bangers\", a Mexican variety, \"chorizo\"",
        "answer": "sausage",
        "air_date": "1984-09-10"
      },
      {
        "show_number": 1,
        "round": 1,
        "value": 200,
        "category": "ACTORS & ROLES",
        "clue": "2 \"Saturday Night\" alumni who tried \"Trading Places\"",
        "answer": "Dan Aykroyd & Eddie Murphy",
        "air_date": "1984-09-10"
      },
      {
        "show_number": 1,
        "round": 1,
        "value": 800,
        "category": "LAKES & RIVERS",
        "clue": "River in <a href=\"http://www.j-archive.com/media/1984-09-10_J_14.mp3\">this</a> famous song:",
        "answer": "the Volga River",
        "air_date": "1984-09-10"
      },
      {
        "show_number": 1,
        "round": 1,
        "value": 300,
        "category": "INVENTIONS",
        "clue": "A 1920's hunting trip to Canada inspired Birdseye's food preserving method",
        "answer": "freezing",
        "air_date": "1984-09-10"
      },
      {
        "show_number": 1,
        "round": 1,
        "value": 300,
        "category": "ANIMALS",
        "clue": "When husbands \"pop\" for an ermine coat, they're actually buying this fur",
        "answer": "weasel",
        "air_date": "1984-09-10"
      },
      {
        "show_number": 1,
        "round": 1,
        "value": 300,
        "category": "FOREIGN CUISINE",
        "clue": "Jewish crepe filled with cheese",
        "answer": "a blintz",
        "air_date": "1984-09-10"
      },
      {
        "show_number": 1,
        "round": 1,
        "value": 300,
        "category": "ACTORS & ROLES",
        "clue": "He may \"Never Say Never Again\" when asked to be Bond",
        "answer": "Sean Connery",
        "air_date": "1984-09-10"
      },
      {
        "show_number": 1,
        "round": 1,
        "value": 400,
        "category": "LAKES & RIVERS",
        "clue": "American river only 33 miles shorter than the Mississippi",
        "answer": "the Missouri",
        "air_date": "1984-09-10"
      },
      {
        "show_number": 1,
        "round": 1,
        "value": 400,
        "category": "INVENTIONS",
        "clue": "This fastener gets its name from a brand of galoshes it was used on",
        "answer": "the zipper",
        "air_date": "1984-09-10"
      },
      {
        "show_number": 1,
        "round": 1,
        "value": 400,
        "category": "ANIMALS",
        "clue": "Close relative of the pig, though its name means \"river horse\"",
        "answer": "the hippopotamus",
        "air_date": "1984-09-10"
      },
      {
        "show_number": 1,
        "round": 1,
        "value": 400,
        "category": "FOREIGN CUISINE",
        "clue": "French for a toothsome cut of beef served to a twosome",
        "answer": "Châteaubriand",
        "air_date": "1984-09-10"
      },
      {
        "show_number": 1,
        "round": 1,
        "value": 400,
        "category": "ACTORS & ROLES",
        "clue": "The blonde preferred in the film \"Gentlemen Prefer Blondes\"",
        "answer": "Marilyn Monroe",
        "air_date": "1984-09-10"
      },
      {
        "show_number": 1,
        "round": 1,
        "value": 500,
        "category": "LAKES & RIVERS",
        "clue": "World's largest lake, nearly 5 times as big as Superior",
        "answer": "the Caspian Sea",
        "air_date": "1984-09-10"
      },
      {
        "show_number": 1,
        "round": 1,
        "value": 500,
        "category": "ANIMALS",
        "clue": "If this species of hybrid's parents were reversed, you'd get a hinny",
        "answer": "a mule",
        "air_date": "1984-09-10"
      },
      {
        "show_number": 1,
        "round": 1,
        "value": 500,
        "category": "ACTORS & ROLES",
        "clue": "Sam Shepard played this barrier breaker in \"The Right Stuff\"",
        "answer": "Colonel Chuck Yeager",
        "air_date": "1984-09-10"
      },
      {
        "show_number": 1,
        "round": 2,
        "value": 200,
        "category": "THE BIBLE",
        "clue": "When \"Joshua Fit The Battle Of Jericho\", these took a tumble",
        "answer": "the walls",
        "air_date": "1984-09-10"
      },
      {
        "show_number": 1,
        "round": 2,
        "value": 200,
        "category": "'50'S TV",
        "clue": "Occupation of Richard Diamond, Peter Gunn & Mike Hammer",
        "answer": "private eyes (or private detectives)",
        "air_date": "1984-09-10"
      },
      {
        "show_number": 1,
        "round": 2,
        "value": 200,
        "category": "NATIONAL LANDMARKS",
        "clue": "She came from France to harbor America's freedom",
        "answer": "the Statue of Liberty",
        "air_date": "1984-09-10"
      },
      {
        "show_number": 1,
        "round": 2,
        "value": 200,
        "category": "NOTORIOUS",
        "clue": "It was probably a lyre, not a fiddle, if he played it while Rome burned",
        "answer": "Nero",
        "air_date": "1984-09-10"
      },
      {
        "show_number": 1,
        "round": 2,
        "value": 200,
        "category": "4-LETTER WORDS",
        "clue": "Pulled the trigger or what's in a jigger",
        "answer": "shot",
        "air_date": "1984-09-10"
      },
      {
        "show_number": 1,
        "round": 2,
        "value": 400,
        "category": "THE BIBLE",
        "clue": "His price was 30 pieces of silver",
        "answer": "Judas",
        "air_date": "1984-09-10"
      },
      {
        "show_number": 1,
        "round": 2,
        "value": 400,
        "category": "'50'S TV",
        "clue": "She was \"Our Miss Brooks\"",
        "answer": "Eve Arden",
        "air_date": "1984-09-10"
      },
      {
        "show_number": 1,
        "round": 2,
        "value": 400,
        "category": "NATIONAL LANDMARKS",
        "clue": "When he was home, George Washington slept here",
        "answer": "Mount Vernon",
        "air_date": "1984-09-10"
      },
      {
        "show_number": 1,
        "round": 2,
        "value": 400,
        "category": "NOTORIOUS",
        "clue": "His book, translated as \"My Struggle\", outlined plans to conquer Europe",
        "answer": "Adolf Hitler",
        "air_date": "1984-09-10"
      },
      {
        "show_number": 1,
        "round": 2,
        "value": 400,
        "category": "4-LETTER WORDS",
        "clue": "Basketball defense or Serling's twilight area",
        "answer": "zone",
        "air_date": "1984-09-10"
      },
      {
        "show_number": 1,
        "round": 2,
        "value": 600,
        "category": "THE BIBLE",
        "clue": "According to the Bible, it wasn't necessarily an apple",
        "answer": "the forbidden fruit (or the fruit of the Tree of Knowledge)",
        "air_date": "1984-09-10"
      },
      {
        "show_number": 1,
        "round": 2,
        "value": 600,
        "category": "'50'S TV",
        "clue": "Amount Michael Anthony gave out each week on behalf of John Beresford Tipton",
        "answer": "one million dollars",
        "air_date": "1984-09-10"
      },
      {
        "show_number": 1,
        "round": 2,
        "value": 600,
        "category": "NATIONAL LANDMARKS",
        "clue": "The cornerstone of Massachusetts, it bears the date 1620",
        "answer": "Plymouth Rock",
        "air_date": "1984-09-10"
      },
      {
        "show_number": 1,
        "round": 2,
        "value": 600,
        "category": "NOTORIOUS",
        "clue": "Lenin called him ruthless, and his purges proved he was",
        "answer": "Stalin",
        "air_date": "1984-09-10"
      },
      {
        "show_number": 1,
        "round": 2,
        "value": 600,
        "category": "4-LETTER WORDS",
        "clue": "Little girls do it with a rope, Van Halen does it in a song",
        "answer": "jump",
        "air_date": "1984-09-10"
      },
      {
        "show_number": 1,
        "round": 2,
        "value": 800,
        "category": "THE BIBLE",
        "clue": "Though its name means \"city of peace\", it's seen over 30 wars, the last in 1967",
        "answer": "Jerusalem",
        "air_date": "1984-09-10"
      },
      {
        "show_number": 1,
        "round": 2,
        "value": 800,
        "category": "'50'S TV",
        "clue": "His card read \"Have gun, will travel\"",
        "answer": "Paladin (Richard Boone)",
        "air_date": "1984-09-10"
      },
      {
        "show_number": 1,
        "round": 2,
        "value": 800,
        "category": "NATIONAL LANDMARKS",
        "clue": "Site where John Hancock signed his \"John Hancock\"",
        "answer": "Independence Hall",
        "air_date": "1984-09-10"
      },
      {
        "show_number": 1,
        "round": 2,
        "value": 1000,
        "category": "4-LETTER WORDS",
        "clue": "It's the first 4-letter word in \"The Star Spangled Banner\"",
        "answer": "what",
        "air_date": "1984-09-10"
      },
      {
        "show_number": 1,
        "round": 2,
        "value": 1000,
        "category": "THE BIBLE",
        "clue": "According to 1st Timothy, it is the \"root of all evil\"",
        "answer": "the love of money",
        "air_date": "1984-09-10"
      },
      {
        "show_number": 1,
        "round": 2,
        "value": 1000,
        "category": "'50'S TV",
        "clue": "Name under which experimenter Don Herbert taught viewers all about science",
        "answer": "Mr. Wizard",
        "air_date": "1984-09-10"
      },
      {
        "show_number": 1,
        "round": 2,
        "value": 1000,
        "category": "NATIONAL LANDMARKS",
        "clue": "D.C. building shaken by November '83 bomb blast",
        "answer": "the Capitol",
        "air_date": "1984-09-10"
      },
      {
        "show_number": 1,
        "round": 2,
        "value": 1000,
        "category": "NOTORIOUS",
        "clue": "After the deed, he leaped to the stage shouting \"Sic semper tyrannis\"",
        "answer": "John Wilkes Booth",
        "air_date": "1984-09-10"
      },
      {
        "show_number": 1,
        "round": 2,
        "value": 1000,
        "category": "4-LETTER WORDS",
        "clue": "The president takes one before stepping into office",
        "answer": "oath",
        "air_date": "1984-09-10"
      },
      {
        "show_number": 1,
        "round": 3,
        "value": null,
        "category": "HOLIDAYS",
        "clue": "The third Monday of January starting in 1986",
        "answer": "Martin Luther King Day",
        "air_date": "1984-09-10"
      }
    ];

    let categories = [],
        values     = [];
    gameRows.filter(item => item.round === 1).forEach(item => {
      if (!categories.includes(item.category)) {
        categories.push(item.category);
      }
      if (!values.includes(item.value)) {
        values.push(item.value);
      }
    });
    console.log(categories, values);

    return (
      <div className="App">
        <table width="100%" height="100%">
          <thead>
            <tr>
            {categories.map(category =>
              <th key={category}>{category}</th>
            )}
            </tr>
          </thead>
          <tbody>
          {values.map(value =>
            <tr key={value}>
            {categories.map(category =>
              <td key={category}>
                <div className="value">{value}</div>
                <div className="clue">{(gameRows.find(item => item.category === category && item.value === value) || {}).clue}</div>
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

export default App;
