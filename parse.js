const fs  = require('fs'),
      csv = require('csv');

fs.readFile('data.csv', 'utf8', (err, text) => {
	if (err) throw err;

	const data = csv.parse(text);

	console.log(data);
});