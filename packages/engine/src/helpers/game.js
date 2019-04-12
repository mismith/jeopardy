export const getCurrentRound = (G) => {
  return G && G.rounds && G.rounds[G.roundIndex];
};

export const getCurrentClue = (G) => {
  const round = getCurrentRound(G);
  const category = round && round.categories && round.categories[G.categoryIndex];
  const clue = category && category.clues && category.clues[G.clueIndex];
  return clue;
};

export const getCluesRemaining = (G, check = clue => clue && !clue.picked) => {
  const round = getCurrentRound(G);
  return (round && round.categories && round.categories.reduce((cluesRemaining, category) => {
    const count = category && category.clues && category.clues.filter(check).length;
    return cluesRemaining + (count || 0);
  }, 0)) || 0;
};

export const isCurrentClue = (G, ctx, clue) => {
  return clue && (clue.picked === ctx.turn + 1);
};

export const compareLoosely = (a, b) => {
  return `${a || ''}`.toLowerCase().replace(/[^a-z0-9- ]/g, '') === `${b || ''}`.toLowerCase().replace(/[^a-z0-9- ]/g, '');
};

export const compareCategory = (a, b) => {
  return compareLoosely(a, b);
};
export const compareClue = (a, b) => {
  return compareLoosely(parseWager(a), parseWager(b));
};
export const parseClue = (input) => {
  const [category, value] = `${input || ''}`.toLowerCase().split(' for ');
  if (category && value) {
    return [category, value];
  }
  return null;
};
export const matchClue = ([categoryName, clueValue], categories) => {
  let output = null;
  if (categories && categories.length) {
    categories.find((category, categoryIndex) => {
      if (compareCategory(category.name, categoryName)) {
        return category.clues.find((clue, clueIndex) => {
          if (clue && compareClue(clue.value, clueValue)) {
            output = {
              categoryIndex,
              clueIndex,
            };
            return true;
          }
          return false;
        });
      }
      return false;
    });
  }
  return output;
};

export const parseResponse = (input) => {
  const questionRegex = /^.*(what|who|where) (is|are|were|was) /;
  const stringified = `${input || ''}`.toLowerCase();
  if (questionRegex.test(stringified)) {
    return stringified.replace(questionRegex, '');
  }
  return null;
};
export const matchResponse = (response, correct) => {
  return compareLoosely(response, correct) && response;
};

export const parseWager = (input) => {
  return Number.parseInt(`${input || ''}`.replace(/[^-0-9]/g, ''), 10) || 0;
};

export const matchWager = (wager, min = 0, max = Infinity) => {
  return Math.max(min, Math.min(wager, max)) || 0;
};
