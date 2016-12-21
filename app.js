const say = require('say');

say.speak('In 1869 an American minister created this "oriental" transportation', null, null, err => {
	if (err) throw err;

	const answer = 'the rickshaw';
	say.speak(`What is ${answer}?`);
});
