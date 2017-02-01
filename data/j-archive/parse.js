const fs          = require('fs'),
      jsdom       = require('jsdom'),
      ProgressBar = require('progress');

function toNum(str) {
  return str && parseFloat(str.replace(/[^\d]/g, ''));
}
function getText(node) {
  return node && node.textContent || undefined;
}

const max = 100;
const bar = new ProgressBar('Parsing files [:bar] :current/:total', {total: max});

for (let i = 1; i <= max; i++) {
  const html = fs.readFileSync(`input/${i}.html`, 'utf8');
  jsdom.env(html, (err, window) => {
    const doc = window.document;
    const [title, number, date] = getText(doc.querySelector('title')).match(/Show #(\d+), aired ([0-9-]+)$/i);

    let contestants = [].slice.call(doc.querySelectorAll('#contestants_table .contestants')).map(contestant => {
      const [description, name, occupation, origin, streak, winnings] = getText(contestant).match(/^\s*([^,]+)\s*,\s*(.*?) from (.*?)\s*(?:\(.*? ([\d\,\.]+?)-day .*? \$([\d\,\.]+)\s*\))?\s*$/);

      return {
        name,
        occupation,
        origin,
        streak:   toNum(streak),
        winnings: toNum(winnings),
      };
    });

    let rounds = [].slice.call(doc.querySelectorAll('table.round, table.final_round')).map(round => {
      const categories = [].slice.call(round.querySelectorAll('.category')).map(category => {
        return {
          name:     getText(category.querySelector('.category_name')),
          comments: getText(category.querySelector('.category_comments')),
        };
      });
      const clues = [].slice.call(round.querySelectorAll('.clue')).map(clue => {
        const dd = clue.querySelector('.clue_value_daily_double');

        const div = doc.createElement('div');
        let   answer,
              col,
              row;
        function toggle(id, b, ans) { // use name of function to intercept it's calling
          [nil, col, row] = id.match(/_(\d+)_(\d+)$/) || [undefined, undefined, undefined];
          div.innerHTML = ans;
          answer = getText(div.querySelector('.correct_response'));
        }
        eval((clue.querySelector('[onmouseover]') || round.querySelector('[onmouseover]')).getAttribute('onmouseover'));

        return {
          question: getText(clue.querySelector('.clue_text')),
          answer,
          value:    toNum(getText(dd || clue.querySelector('.clue_value'))),
          order:    toNum(getText(clue.querySelector('.clue_order_number'))),
          dd:       dd ? toNum(getText(dd)) : undefined,
          row:      toNum(row),
          col:      toNum(col),
        };
      });

      return {
        categories,
        clues,
      };
    });

    const game = {
      number: toNum(number),
      date,
      comments: getText(doc.querySelector('#game_comments')),
      contestants,
      rounds,
    };

    fs.writeFileSync(`output/${i}.json`, JSON.stringify(game, null, 2), 'utf8');

    bar.tick();
    if (bar.complete) console.log('');
  });
}