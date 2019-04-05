createReducer([], {
  // game
  SHOW_LOBBY(state, payload) {
    state.currentView = SHOW_LOBBY;
    state.nextActions = {
      // wait for game data to be selected/loaded
      LOAD_ROUNDS: !state.rounds.length,
      // limit to 16 players
      ADD_PLAYER: state.players.length < 16,
      // wait for both game data and players to be present
      START_GAME: state.rounds.length && state.players.length,
    };
  },

  START_GAME(state, payload) {
    state.started = new Date().toISOString();
    state.nextActions = {
      PAUSE_GAME,
    };

    dispatch(ADVANCE_ROUND);
  },
  PAUSE_GAME(state, payload) {
    state.currentView = PAUSE_GAME;
    state.paused = {
      currentView: state.currentView,
      nextActions: state.nextActions,
    };

    dispatch(STOP_TIMER, { name: 'round' });

    state.nextActions = {
      RESUME_GAME,
      QUIT_GAME,
    };
  },
  RESUME_GAME(state, payload) {
    state.currentView = state.paused.currentView;
    state.nextActions = state.paused.nextActions;
    state.paused = null;

    dispatch(START_TIMER, { name: 'round' });
  },
  FINISH_GAME(state, payload) {
    state.finished = new Date().toISOString();
    state.currentView = FINISH_GAME;
    state.nextActions = {
      QUIT_GAME,
    };
  },
  QUIT_GAME(state, payload) {
    dispatch(STOP_TIMER, { name: 'round' });

    dispatch(SHOW_LOBBY);
  },

  // timer
  TIMER_TICK(state, payload) {
    state.timers[payload.name].seconds -= 1;

    // auto-stop once elapsed
    if (state.timers[payload.name].seconds <= 0) {
      dispatch(STOP_TIMER, { name: payload.name });

      state.timers[payload.name].seconds = 0;
    }
  },
  START_TIMER(state, payload) {
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
  STOP_TIMER(state, payload) {
    if (state.timers[payload.name] && state.timers[payload.name].interval) {
      clearInterval(state.timers[payload.name].interval);
      state.timers[payload.name].interval = null;
    }
  },

  // round
  ADVANCE_ROUND(state, payload) {
    state.currentRoundIndex = (state.currentRoundIndex || 0) + 1;

    switch (state.currentRoundIndex) {
      case 1:
      case 2: {
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
  SHOW_BOARD(state, payload) {
    if (!state.timers.round.seconds) {
      dispatch(ROUND_TIMED_OUT);
    } else {
      // @TODO
      if (state.cluesLeft.length) {
        state.currentView = SHOW_BOARD;
        state.nextActions = {
          PAUSE_GAME,
          PICK_CLUE,
        };

        if (state.cluesPicked.length === 15) {
          dispatch(PAUSE_GAME);
        }
      } else {
        dispatch(END_ROUND);
      }
    }
    // @TODO
  },
  ROUND_TIMED_OUT(state, payload) {
    state.currentView = ROUND_TIMED_OUT;
    state.nextActions = {
      ADVANCE_ROUND,
    };
  },
  END_ROUND(state, payload) {
    state.currentView = END_ROUND;
    state.nextActions = {
      ADVANCE_ROUND,
    };
  },

  // clue
  PICK_CLUE(state, payload) {
    
  },
  SET_PLAYER_WAGER(state, payload) {
    state.rounds[payload.roundIndex].categories[payload.categoryIndex].clues[payload.clueIndex]
      .wagers[payload.playerIndex] = payload.value;
  },

  // final round
  SHOW_FINAL_CATEGORY(state, payload) {
    state.currentView = SHOW_FINAL_CATEGORY;
    state.nextActions = {
      PAUSE_GAME,
      ACCEPT_PLAYER_WAGERS,
    };
  },
  ACCEPT_PLAYER_WAGERS(state, payload) {
    const roundIndex = state.currentRoundIndex;
    const categoryIndex = 0;
    const clueIndex = 0;

    // only positive scores can participant in final round,
    // so submit a null wager for players with nothing to wager
    // initialize an undefined wager for valid players (so wager check below succeeds)
    state.players.forEach((player, playerIndex) => {
      dispatch(SET_PLAYER_WAGER, {
        roundIndex,
        categoryIndex,
        playerIndex,
        clueIndex,
        value: state.scores[playerIndex] <= 0 ? null : undefined,
      });
    });

    // add an inactivity timeout (e.g. so if a player disconnects, the others can still continue)
    dispatch(START_TIMER, { name: 'round', seconds: 15 });

    state.currentView = ACCEPT_PLAYER_WAGERS;
    state.nextActions = {
      PAUSE_GAME,
      // wait for all players to submit their wagers, or for inactivity timeout
      SHOW_FINAL_PROMPT: state.rounds[roundIndex].categories[categoryIndex].clues[clueIndex]
        .wagers.every(wager => wager !== undefined) || !state.timers.round.seconds,
    };
  },
  SHOW_FINAL_PROMPT(state, payload) {
    dispatch(START_TIMER, { name: 'round', seconds: 30 });

    state.currentView = SHOW_FINAL_PROMPT;
    state.nextActions = {
      PAUSE_GAME,
      // wait for timer to elapse
      SHOW_FINAL_RESPONSES: state.timers.round.seconds <= 0,
    };
  },
  SHOW_FINAL_RESPONSES(state, payload) {
    // @TODO: score final responses

    state.currentView = SHOW_FINAL_RESPONSES;
    state.nextActions = {
      PAUSE_GAME,
      ADVANCE_ROUND,
    };
  },
});
