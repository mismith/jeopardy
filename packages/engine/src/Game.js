import { Game, TurnOrder } from 'boardgame.io/core';
import {
  getCurrentClue,
  matchResponse,
} from './helpers/game';

const defaultRounds = [ // @TODO
  {
    categories: [
      {
        name: 'Category',
        clues: [
          {
            prompt: 'Prompt Prompt Prompt Prompt Prompt Prompt Prompt Prompt Prompt Prompt Prompt Prompt Prompt Prompt',
            response: 'Response',
            value: 100,
          },
          // {
          //   prompt: 'Long Daily Double prompt that will take some time to be read out loud',
          //   response: 'DD',
          //   value: 200,
          //   isWagered: true,
          // },
          // null,
          // {
          //   prompt: '#4',
          //   response: '4',
          //   value: 400,
          // },
          // {
          //   prompt: 'Number Five',
          //   response: 'five',
          //   value: 1000,
          // },
        ],
      },
      // {
      //   name: '"Another" Category',
      //   clues: [
      //     {
      //       prompt: 'Prompt #2',
      //       response: 'answer',
      //       value: 100,
      //     },
      //     null,
      //     null,
      //     null,
      //     null,
      //   ],
      // },
    ],
  },
  {
    categories: [
      {
        name: 'Double Jeopardy Category',
        clues: [
          {
            prompt: 'One more clue',
            response: 'double',
            value: 200,
          },
        ],
      },
    ],
  },
  {
    categories: [
      {
        name: 'Final Jeopardy Category',
        clues: [
          {
            prompt: 'The final clue',
            response: 'final',
            isWagered: true,
          },
        ],
      },
    ],
  },
];

export default Game({
  name: 'jeopardy',

  setup: (ctx, { rounds = defaultRounds, numPlayers = 2 } = {}) => ({
    rounds,
    roundIndex: undefined,
    categoryIndex: undefined,
    clueIndex: undefined,
    screenPlayerID: undefined,
    players: Array.from(Array(2).keys()).reduce((players, playerID) => ({
      ...players,
      [`${playerID}`]: {
        score: 0,
      },
    }), {}),
  }),

  moves: {
    pickClue(G, ctx, { categoryIndex, clueIndex, playerID = ctx.currentPlayer }) {
      G.categoryIndex = categoryIndex;
      G.clueIndex = clueIndex;

      const clue = getCurrentClue(G, ctx);
      if (clue) {
        clue.picked = ctx.turn + 1;

        // if it's a wagered clue, proceed to accept player's wager
        if (clue.isWagered) {
          G.screenPlayerID = playerID;
          ctx.events.endPhase({
            next: 'wager',
          });
        } else {
          ctx.events.endPhase();
        }
      } else {
        throw new Error('invalid clue');
      }
    },
    acceptBuzzes(G, ctx) {
      if (ctx.playerID === 'screen') {
        const clue = getCurrentClue(G, ctx);
        if (clue && !clue.isWagered) {
          // add acceptance marker: the next buzz after this will be accepted
          clue.buzzes = [
            ...(clue.buzzes || []),
            {
              playerID: true,
              timestamp: Date.now(),
            },
          ];
        } else {
          throw new Error('invalid clue');
        }
      } else {
        throw new Error('only host can initiate accepting buzzes');
      }
    },
    submitBuzz(G, ctx, { playerID = ctx.playerID } = {}) {
      // allow screen to submit on player's behalf
      if (playerID === 'screen') playerID = G.screenPlayerID;

      const clue = getCurrentClue(G, ctx);
      if (clue && !clue.isWagered) {
        // penalize players for early buzzes
        const previousBuzzes = clue.buzzes || [];
        const playerPreviousBuzz = [...previousBuzzes].reverse()
          .find(buzz => buzz.playerID === playerID);
        const playerPreviousTimestamp = playerPreviousBuzz && playerPreviousBuzz.timestamp;
        const timestamp = Date.now();
        if (timestamp - (playerPreviousTimestamp || 0) > 250) {
          clue.buzzes = [
            ...previousBuzzes,
            {
              playerID,
              timestamp,
            },
          ];

          // the first buzz after buzzes are accepted wins the race for that player
          const previousBuzz = previousBuzzes[previousBuzzes.length - 1];
          if (previousBuzz && previousBuzz.playerID === true) {
            G.screenPlayerID = playerID;
            ctx.events.endPhase();
          }
        } else {
          console.warn(`buzz penalized for player ${playerID}`); // @TODO: track stats on these?
        }
      } else {
        throw new Error('invalid clue');
      }
    },
    submitWager(G, ctx, { value = undefined, playerID = ctx.playerID }) {
      // allow screen to submit on player's behalf
      if (playerID === 'screen') playerID = G.screenPlayerID;

      const clue = getCurrentClue(G, ctx);
      if (clue && clue.isWagered) {
        clue.wagers = [
          ...(clue.wagers || []),
          {
            playerID,
            value: Number.parseInt(value, 10) || 0,
          },
        ];

        if (G.roundIndex < 2) {
          ctx.events.endPhase();
        }
        // in final, wait for all wagers and manual phase end
      } else {
        throw new Error('invalid clue');
      }
    },
    submitResponse(G, ctx, { response, playerID = ctx.playerID }) {
      // allow screen to submit on player's behalf
      if (playerID === 'screen') playerID = G.screenPlayerID;

      const clue = getCurrentClue(G, ctx);
      if (clue) {
        clue.responses = [
          ...(clue.responses || []),
          {
            playerID,
            response,
            isCorrect: !!matchResponse(response, clue.response),
          },
        ];

        if (G.roundIndex < 2) {
          ctx.events.endPhase();
        }
      } else {
        throw new Error('invalid clue');
      }
    },
    scoreResponse(G, ctx, { isCorrect = undefined, playerID = ctx.playerID } = {}) {
      // allow screen to submit on player's behalf
      if (playerID === 'screen') playerID = G.screenPlayerID;

      const clue = getCurrentClue(G, ctx);
      if (clue) {
        // only update score if a response was provided
        if (isCorrect !== undefined) {
          let value = clue.value;
          if (clue.isWagered && clue.wagers) {
            const wager = clue.wagers.find(wager => wager.playerID === playerID);
            value = wager && wager.value;
          }
          G.players[playerID].score += (value || 0) * (isCorrect ? 1 : -1);
        }

        if (G.roundIndex < 2) {
          G.screenPlayerID = null;

          // move on to the next phase/turn
          if (isCorrect || clue.isWagered) {
            // even if a player gets a wagered clue wrong, they get to pick next
            ctx.events.endTurn({
              next: playerID,
            });
            ctx.events.endPhase();
          } else if (clue.responses.length === ctx.numPlayers) {
            // all players have responded (incorrectly), let the same player pick again
            ctx.events.endTurn({
              next: ctx.currentPlayer,
            });
            ctx.events.endPhase();
          } else {
            // pass to remaining players
            ctx.events.endPhase({
              next: 'buzz',
            });
          }
        }
        // in final, wait for all responses and manual turn end
      } else {
        throw new Error('invalid clue');
      }
    },
    expireClue(G, ctx) {
      if (ctx.playerID === 'screen') {
        const clue = getCurrentClue(G, ctx);
        if (clue) {
          ctx.events.endTurn({
            next: ctx.currentPlayer,
          });
          ctx.events.endPhase({
            next: 'pick',
          });
        } else {
          throw new Error('invalid clue');
        }
      } else {
        throw new Error('only host can expire a clue');
      }
    },
    endRound(G, ctx) {
      if (ctx.playerID === 'screen') {
        G.roundIndex = G.roundIndex === undefined ? 0 : G.roundIndex + 1;
      } else {
        throw new Error('only host can end a round');
      }
    },
  },

  flow: {
    startingPhase: 'pick',
    turnOrder: {
      ...TurnOrder.ANY,
      playOrder: (G, ctx) => Object.keys(G.players),
      actionPlayers: {
        value: (G, ctx) => {
          const clue = getCurrentClue(G, ctx);
          const responses = clue && clue.responses;
          const respondedPlayerIDs = responses ? responses.map(({ playerID }) => playerID) : [];

          return [
            'screen',
            ...(clue && !clue.isWagered
              ? Object.keys(G.players).filter(playerID => !respondedPlayerIDs.includes(playerID))
              : [ctx.currentPlayer]),
          ];
        },
      },
    },

    onTurnEnd: (G, ctx) => {
      // un-pick clue
      G.categoryIndex = null;
      G.clueIndex = null;
    },
    endGameIf: (G, ctx) => {
      if (G.roundIndex > 2) {
        return true;
      }
      return;
    },

    phases: {
      pick: {
        allowedMoves: [
          'pickClue',
          'endRound',
        ],
        next: 'buzz',
      },
      buzz: {
        allowedMoves: [
          'acceptBuzzes',
          'submitBuzz',
          'expireClue',
        ],
        next: 'respond',
      },
      wager: {
        allowedMoves: [
          'submitWager',
        ],
        next: 'respond',
      },
      respond: {
        allowedMoves: [
          'submitResponse',
          // 'submitBuzz', // to track stats on late buzzes
        ],
        next: 'score',
      },
      score: {
        allowedMoves: [
          'scoreResponse',
        ],
        next: 'pick',
      },
    },
  },
});
