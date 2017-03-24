export default {
  // round
  categories: () => [
    //`Here are today's categories:`,
    //`This round's categories are:`,
    //`Categories this round are:`,
    `Here are the categories:`,
    `Here are the categories that await you in this round:`,
  ],
  category(category, col = undefined) {
    switch (col) {
      default:
        return [
          `${category}`,
        ];
      case 1:
        return [
          `${category}`,
          `We start with ${category}. Then:`,
          `To start: ${category}. Next:`,
          `First up, ${category}. Then:`,
        ];
      case 3:
      case 4:
      case 5:
        return [
          `${category}`,
          `then ${category}`,
          `followed by ${category}`,
        ];
      case 6:
        return [
          `and finally, ${category}`,
          `and ${category}`,
        ];
      case 0: // final jeopardy
        return [
          `Let's deal with this subject:`,
          `Today's category is:`,
        ];
    }
  },

  // clue
  correct: (answer) => [
    `Yes`,
    `Yup`,
    `You got it`,
    `Correct`,
    `Right`,
    `That's right`,
    `That's it`,
    `That's correct`,
    `That's the answer`,
    `That's the one`,
    `Good`,
    `Well done`,
    `You are right`,
    `You're right`,
    `You're correct`,
    `Yes, "${answer}"`,
    `"${answer}", good`,
    `"${answer}", right`,
    `"${answer}", right you are`,
    `"${answer}", that's right`,
    `"${answer}" is right`,
    `"${answer}" is right, yes`,
    `"${answer}" is correct`,
  ],
  incorrect: (answer) => [
    `No`,
    `Nope`,
    `Incorrect`,
    `Wrong`,
    `That's not right`,
    `That's not it`,
    `That's incorrect`,
    `That's wrong`,
    `It's not that`,
    `It's not ${answer}`,
  ],
  expired: (answer) => [
    `It's "${answer}"`,
    `That'd be "${answer}"`,
    `...and that would be "${answer}"`,
    `...and that is "${answer}"`,
    `The correct response is "${answer}"`,
    `What is "${answer}"`,
    `...looking for "${answer}"`,
    `We were looking for "${answer}"`,
    `"${answer}" is what we were looking for`,
  ],

  // daily double
  dailyDoubleFound: () => [ 
    `Answer, daily double`,
    `Answer there: daily double`,
    `Answer there, the daily double:`,
    `You've found the daily double`,
  ],
  dailyDoubleWager: () => [
    `How much are you willing to risk?`,
    `What's your wager?`,
    `Make your wager`,
    `Go ahead an make your wager`,
    `How much would you like to wager?`,
  ],
  dailyDoubleWagered: (wager) => [
    `${wager} it is`,
    `For ${wager}:`,
    `Okay, for ${wager}:`,
    `Alright, for ${wager}:`,
    `Okay, ${wager} it is`,
    `Alright, ${wager} it is`,
    `Okay, here is the clue:`,
    `Alright, here's the clue:`,
    //`Okay, here is the clue in ${category}`,
  ],

  // final jeopardy
  finalJeopardyWager(scores) {
    return [
      `Please make your wagers`,
      `Make your wagers please`,
    ];
  },

  round(roundNum) {
    switch (roundNum) {
      default:
      case 1:
        return [
          `Let's play Jeopardy!`,
          `Let's begin!`,
          `Here we go!`,
        ]
      case 2:
        return [
          `Let's continue in the Double Jeopardy round...`,
          `Moving on to the Double Jeopardy round...`,
        ]
      case 3:
        return [
          `Welcome to Final Jeopardy!`,
          `We've made it to Final Jeopardy`,
          `This is it: the Final Jeopardy round`,
        ];
    }
  },
};

/*


We'll see how things work out in the next round
Go ahead and make a selection
We'll continue with round 2, after this

You are the new jeopardy champion!

// */