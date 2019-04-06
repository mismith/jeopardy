import {
  createReducer,
  configureStore,
} from 'redux-starter-kit';

export const SHOW_LOBBY = 'SHOW_LOBBY';
export const REFRESH_LOBBY = 'REFRESH_LOBBY';
export const LOAD_ROUNDS = 'LOAD_ROUNDS';
export const ADD_PLAYER = 'ADD_PLAYER';
export const START_GAME = 'START_GAME';
export const PAUSE_GAME = 'PAUSE_GAME';
export const RESUME_GAME = 'RESUME_GAME';
export const FINISH_GAME = 'FINISH_GAME';
export const QUIT_GAME = 'QUIT_GAME';
export const TIMER_TICK = 'TIMER_TICK';
export const START_TIMER = 'START_TIMER';
export const STOP_TIMER = 'STOP_TIMER';
export const START_TIMERS = 'START_TIMERS';
export const STOP_TIMERS = 'STOP_TIMERS';
export const ADVANCE_ROUND = 'ADVANCE_ROUND';
export const SHOW_BOARD = 'SHOW_BOARD';
export const ROUND_TIMED_OUT = 'ROUND_TIMED_OUT';
export const END_ROUND = 'END_ROUND';
export const PICK_CLUE = 'PICK_CLUE';
export const SHOW_REGULAR_CLUE = 'SHOW_REGULAR_CLUE';
export const ACCEPT_PLAYER_BUZZES = 'ACCEPT_PLAYER_BUZZES';
export const ACCEPT_PLAYER_RESPONSE = 'ACCEPT_PLAYER_RESPONSE';
export const ACCEPT_PLAYER_WAGER = 'ACCEPT_PLAYER_WAGER';
export const SHOW_WAGERED_CLUE = 'SHOW_WAGERED_CLUE';
export const ACCEPT_WAGERED_RESPONSE = 'ACCEPT_WAGERED_RESPONSE';
export const SUBMIT_PLAYER_BUZZ = 'SUBMIT_PLAYER_BUZZ';
export const SUBMIT_PLAYER_WAGER = 'SUBMIT_PLAYER_WAGER';
export const SUBMIT_PLAYER_RESPONSE = 'SUBMIT_PLAYER_RESPONSE';
export const ADJUST_PLAYER_SCORE = 'ADJUST_PLAYER_SCORE';
export const SCORE_PLAYER_RESPONSE = 'SCORE_PLAYER_RESPONSE';
export const SHOW_FINAL_CATEGORY = 'SHOW_FINAL_CATEGORY';
export const ACCEPT_PLAYER_WAGERS = 'ACCEPT_PLAYER_WAGERS';
export const SHOW_FINAL_CLUE = 'SHOW_FINAL_CLUE';
export const SHOW_FINAL_RESPONSES = 'SHOW_FINAL_RESPONSES';

const reducer = createReducer({
  actions: {
    SHOW_LOBBY,
  },
}, {
  // lobby
  [SHOW_LOBBY]: (state, { payload }) => {
    state.rounds = [];
    state.players = [];
    state.view = SHOW_LOBBY;
    state.timers = {
      round: {},
      clue: {},
    };

    dispatch(REFRESH_LOBBY);
  },
  [REFRESH_LOBBY]: (state, { payload }) => {
    state.actions = {
      // wait for game data to be selected/loaded
      LOAD_ROUNDS: !state.rounds.length,
      // limit to 16 players
      ADD_PLAYER: state.players.length < 16,
      // wait for both game data and players to be present
      START_GAME: state.rounds.length && state.players.length,
    };
  },
  [LOAD_ROUNDS]: (state, { payload }) => {
    state.rounds = payload.rounds;
    dispatch(REFRESH_LOBBY);
  },
  [ADD_PLAYER]: (state, { payload }) => {
    state.players.push({
      name: payload.name,
      score: 0,
    });
    dispatch(REFRESH_LOBBY);
  },

  // game
  [START_GAME]: (state, { payload }) => {
    state.started = +new Date();
    state.actions = {
      PAUSE_GAME,
    };

    dispatch(ADVANCE_ROUND);
  },
  [PAUSE_GAME]: (state, { payload }) => {
    state.view = PAUSE_GAME;
    state.paused = {
      view: state.view,
      actions: state.actions,
    };

    dispatch(STOP_TIMERS);

    state.actions = {
      RESUME_GAME,
      QUIT_GAME,
    };
  },
  [RESUME_GAME]: (state, { payload }) => {
    state.view = state.paused.view;
    state.actions = state.paused.actions;
    state.paused = null;

    dispatch(START_TIMERS);
  },
  [FINISH_GAME]: (state, { payload }) => {
    state.finished = +new Date();
    state.view = FINISH_GAME;
    state.actions = {
      QUIT_GAME,
    };
  },
  [QUIT_GAME]: (state, { payload }) => {
    dispatch(STOP_TIMERS);

    dispatch(SHOW_LOBBY);
  },

  // timers
  [TIMER_TICK]: (state, { payload }) => {
    state.timers[payload.name].seconds -= 1;

    // auto-stop once elapsed
    if (state.timers[payload.name].seconds <= 0) {
      dispatch(STOP_TIMER, { name: payload.name });

      state.timers[payload.name].seconds = 0;
    }
  },
  [START_TIMER]: (state, { payload }) => {
    // if seconds is specified, start anew from there,
    // otherwise, resume timer from existing seconds count
    const running = state.timers[payload.name] || {};
    const interval = running.interval || setInterval(() => {
      dispatch(TIMER_TICK, { name: payload.name });
    }, 1000);
    const seconds = payload.seconds || running.seconds;

    state.timers[payload.name] = {
      interval,
      seconds,
    };
  },
  [STOP_TIMER]: (state, { payload }) => {
    if (state.timers[payload.name] && state.timers[payload.name].interval) {
      clearInterval(state.timers[payload.name].interval);
      state.timers[payload.name].interval = null;
    }
  },
  [START_TIMERS]: (state, { payload }) => {
    Object.keys(state.timers || {}).forEach((name) => {
      dispatch(START_TIMER, { name });
    });
  },
  [STOP_TIMERS]: (state, { payload }) => {
    Object.keys(state.timers || {}).forEach((name) => {
      dispatch(STOP_TIMER, { name });
    });
  },

  // rounds
  [ADVANCE_ROUND]: (state, { payload }) => {
    state.roundIndex = (state.roundIndex || 0) + 1;

    switch (state.roundIndex) {
      case 1:
      case 2: {
        // determine which player goes first
        if (state.roundIndex === 1) {
          state.playerIndex = 0;
        } else {
          // @TODO: pick player with lowest score
        }

        dispatch(START_TIMER, { name: 'round', seconds: 15 * 60 });
        dispatch(SHOW_BOARD);
        break;
      }
      case 3: {
        dispatch(SHOW_FINAL_CATEGORY);
        break;
      }
      case 4: {
        dispatch(FINISH_GAME);
        break;
      }
    }
  },
  [SHOW_BOARD]: (state, { payload }) => {
    if (!state.timers.round.seconds) {
      dispatch(ROUND_TIMED_OUT);
    } else {
      const round = state.rounds[state.roundIndex];
      const totalClues = round.categories
        .reduce((total, category) => total + category.clues.filter(clue => clue).length, 0);
      const cluesRemaining = totalClues - round.cluesPicked;

      if (cluesRemaining > 0) {
        state.view = SHOW_BOARD;
        state.actions = {
          PAUSE_GAME,
          PICK_CLUE,
        };

        // stop for a 'commercial' break after half the clues are picked in the first round
        if (state.roundIndex === 1 && round.cluesPicked === 15) {
          dispatch(PAUSE_GAME);
        }
      } else {
        dispatch(END_ROUND);
      }
    }
  },
  [ROUND_TIMED_OUT]: (state, { payload }) => {
    state.view = ROUND_TIMED_OUT;
    state.actions = {
      ADVANCE_ROUND,
    };
  },
  [END_ROUND]: (state, { payload }) => {
    state.view = END_ROUND;
    state.actions = {
      ADVANCE_ROUND,
    };
  },

  // clues
  [PICK_CLUE]: (state, { payload }) => {
    state.categoryIndex = payload.categoryIndex;
    state.clueIndex = payload.clueIndex;

    const round = state.rounds[state.roundIndex];
    const clue = round.categories[state.categoryIndex].clues[state.clueIndex];
    if (clue) {
      round.cluesPicked = (round.cluesPicked || 0) + 1;
      clue.orderPicked = round.cluesPicked;

      if (clue.value) {
        dispatch(SHOW_REGULAR_CLUE);
      } else {
        dispatch(ACCEPT_PLAYER_WAGER);
      }
    }
  },
  [SHOW_REGULAR_CLUE]: (state, { payload }) => {
    const clue = state.rounds[state.roundIndex].categories[state.categoryIndex].clues[state.clueIndex];
    clue.buzzes = [];

    state.view = SHOW_REGULAR_CLUE;
    state.actions = {
      PAUSE_GAME,
      // allow buzzes immediately...
      SUBMIT_PLAYER_BUZZ,
      // ...but don't accept them until this is triggered (e.g. once clue is read)
      ACCEPT_PLAYER_BUZZES,
    };
  },
  [ACCEPT_PLAYER_BUZZES]: (state, { payload }) => {
    const clue = state.rounds[state.roundIndex].categories[state.categoryIndex].clues[state.clueIndex];
    clue.buzzes.push(+new Date());

    // begin buzz-in window
    dispatch(START_TIMER, { name: 'clue', seconds: 5 });

    state.actions = {
      PAUSE_GAME,
      SUBMIT_PLAYER_BUZZ,
      // if no player buzzes in, wait for the buzz-in window to lapse
      SHOW_BOARD: !state.timers.clue.seconds,
    };
  },
  [ACCEPT_PLAYER_RESPONSE]: (state, { payload }) => {
    const clue = state.rounds[state.roundIndex].categories[state.categoryIndex].clues[state.clueIndex];

    // begin response windows
    dispatch(START_TIMER, { name: 'clue', seconds: 10 });

    state.view = ACCEPT_PLAYER_RESPONSE;
    state.actions = {
      PAUSE_GAME,
      SUBMIT_PLAYER_RESPONSE,
      // wait for player's response, or time to expire
      SCORE_PLAYER_RESPONSE: clue.responses.find(response => response.playerIndex === payload.playerIndex) || !state.timers.clue.seconds,
    };
  },

  [ACCEPT_PLAYER_WAGER]: (state, { payload }) => {
    const clue = state.rounds[state.roundIndex].categories[state.categoryIndex].clues[state.clueIndex];
    clue.wagers = [];

    // @TODO: does player get to pick the next clue even if response was incorrect?
    state.playerIndex = payload.playerIndex;

    // add an inactivity timeout (e.g. so if player disconnects, the others can still continue)
    dispatch(START_TIMER, { name: 'clue', seconds: 15 });

    state.view = ACCEPT_PLAYER_WAGER;
    state.actions = {
      PAUSE_GAME,
      SUBMIT_PLAYER_WAGER,
      // wait for player to submit their wager, or for inactivity timeout
      SHOW_WAGERED_CLUE: clue.wagers.length || !state.timers.clue.seconds,
    };
  },
  [SHOW_WAGERED_CLUE]: (state, { payload }) => {
    state.view = SHOW_WAGERED_CLUE;
    state.actions = {
      PAUSE_GAME,
      ACCEPT_WAGERED_RESPONSE,
    };
  },
  [ACCEPT_WAGERED_RESPONSE]: (state, { payload }) => {
    const clue = state.rounds[state.roundIndex].categories[state.categoryIndex].clues[state.clueIndex];

    // begin response windows
    dispatch(START_TIMER, { name: 'clue', seconds: 15 });

    state.view = ACCEPT_WAGERED_RESPONSE;
    state.actions = {
      PAUSE_GAME,
      SUBMIT_PLAYER_RESPONSE,
      // wait for player's response, or time to expire
      SCORE_PLAYER_RESPONSE: clue.responses.find(response => response.playerIndex === payload.playerIndex) || !state.timers.clue.seconds,
    };
  },

  // responses/scoring
  [SUBMIT_PLAYER_BUZZ]: (state, { payload }) => {
    const clue = state.rounds[state.roundIndex].categories[state.categoryIndex].clues[state.clueIndex];
    const accepted = !Number.isNaN(clue.buzzes.slice(-1));
    clue.buzzes.push({
      playerIndex: payload.playerIndex,
      timestamp: +new Date(),
      accepted,
    });

    if (accepted) {
      dispatch(ACCEPT_PLAYER_RESPONSE);
    }
  },
  [SUBMIT_PLAYER_WAGER]: (state, { payload }) => {
    const clue = state.rounds[state.roundIndex].categories[state.categoryIndex].clues[state.clueIndex];
    clue.wagers.push(payload);
  },
  [SUBMIT_PLAYER_RESPONSE]: (state, { payload }) => {
    const clue = state.rounds[state.roundIndex].categories[state.categoryIndex].clues[state.clueIndex];
    clue.responses.push(payload);
  },
  [ADJUST_PLAYER_SCORE]: (state, { payload }) => {
    const player = state.players[payload.playerIndex];
    player.score = (player.score || 0) + (payload.value * (payload.correct ? 1 : -1));
  },
  [SCORE_PLAYER_RESPONSE]: (state, { payload }) => {
    // @TODO: merge with SUBMIT_PLAYER_RESPONSE?
    const clue = state.rounds[state.roundIndex].categories[state.categoryIndex].clues[state.clueIndex];

    dispatch(ADJUST_PLAYER_SCORE, {
      playerIndex: payload.playerIndex,
      value: clue.value,
      correct: payload.correct,
    });

    if (payload.correct) {
      state.playerIndex = payload.playerIndex;

      dispatch(SHOW_BOARD);
    } else {
      if (state.view === SHOW_REGULAR_CLUE) {
        const responsesCount = clue.responses.reduce((count, response) => response !== undefined ? count + 1 : count, 0);
        const playerCount = state.players.length;
        if (responsesCount < playerCount) {
          dispatch(SHOW_REGULAR_CLUE);
        } else {
          dispatch(SHOW_BOARD);
        }
      } else {
        dispatch(SHOW_BOARD);
      }
    }
  },

  // final round
  [SHOW_FINAL_CATEGORY]: (state, { payload }) => {
    state.view = SHOW_FINAL_CATEGORY;
    state.actions = {
      PAUSE_GAME,
      ACCEPT_PLAYER_WAGERS,
    };
  },
  [ACCEPT_PLAYER_WAGERS]: (state, { payload }) => {
    const clue = state.rounds[state.roundIndex].categories[state.categoryIndex].clues[state.clueIndex];

    // only positive scores can participant in final round,
    // so submit a null wager for players with nothing to wager
    state.players
      .filter(player => player.score <= 0)
      .forEach((player, playerIndex) => {
        dispatch(SUBMIT_PLAYER_WAGER, {
          value: null,
        });
      });

    // add an inactivity timeout (e.g. so if a player disconnects, the others can still continue)
    dispatch(START_TIMER, { name: 'clue', seconds: 15 });

    state.view = ACCEPT_PLAYER_WAGERS;
    state.actions = {
      PAUSE_GAME,
      SUBMIT_PLAYER_WAGER,
      // wait for all players to submit their wagers, or for inactivity timeout
      SHOW_FINAL_CLUE: clue
        .wagers.every(wager => wager !== undefined) || !state.timers.clue.seconds,
    };
  },
  [SHOW_FINAL_CLUE]: (state, { payload }) => {
    dispatch(START_TIMER, { name: 'clue', seconds: 30 });

    state.view = SHOW_FINAL_CLUE;
    state.actions = {
      PAUSE_GAME,
      SUBMIT_PLAYER_RESPONSE,
      // wait for timer to elapse
      SHOW_FINAL_RESPONSES: !state.timers.round.seconds,
    };
  },
  [SHOW_FINAL_RESPONSES]: (state, { payload }) => {
    // @TODO: score final responses

    state.view = SHOW_FINAL_RESPONSES;
    state.actions = {
      PAUSE_GAME,
      ADVANCE_ROUND,
    };
  },
});

export const store = configureStore({
  reducer,
});

export default store;
