export default {
  correct: (answer) => [
    `Yes`,
    `You got it`,
    `Correct`,
    `Right`,
    `That's right`,
    `That's it`,
    `That's correct`,
    `Well done`,
    `You're right`,
    `You're correct`,
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
  ],
  expired: (answer) => [ 
    `The answer is ${answer}`,
    `It's ${answer}`,
  ],
};

/*
good
X is right
X is right, yes
no
and that would be X
that's right
X, that's right
that correct response this time, is X
Answer, daily double
okay, # it is
that's it
right
it's X
yup
you got him
what is X
that's followed by
and finally
he's the one
and that is X
correct
looking for X
that's right
X, good
that's the X
X, right
X, right you are
that'd be X
what is X
// */