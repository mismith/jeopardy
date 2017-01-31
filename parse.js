const fs = require('fs');

// const fs  = require('fs'),
//       csv = require('csv');

// fs.readFile('data.csv', 'utf8', (err, text) => {
// 	if (err) throw err;

// 	const data = csv.parse(text);

// 	console.log(data);
// });


let data = JSON.parse(fs.readFileSync('data.json', 'utf8')).sort((a, b) => a.show_number < b.show_number ? -1 : 1);

let shows = {};
let datum;
while ((datum = data.shift()) && datum.show_number <= 1) {
  let show       = shows[datum.show_number]   = shows[datum.show_number]   || {};
  let round      = show[datum.round]          = show[datum.round]          || {};
  let categories = round.categories           = round.categories           || {};
  let category   = categories[datum.category] = categories[datum.category] || {};
  let value      = parseInt((datum.value || '').replace(/[^0-9]/g, '')) || 0;

  if (category[value]) {
    console.dir(datum, {depth: null});
  } else {
    category[value] = {
      question: datum.question,
      answer:   datum.answer,
    };
  }
}

//console.log(JSON.stringify(shows, null, 2));