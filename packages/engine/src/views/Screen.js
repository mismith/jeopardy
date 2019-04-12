import React from 'react';
import { Client } from 'boardgame.io/react';
import Grid from '@material-ui/core/Grid';
import { Timestore } from 'timestore';

import HUD from '../components/HUD';
import Clues from '../components/Clues';
import Lecturns from '../components/Lecturns';

import {
  getCurrentClue,
  getCluesRemaining,
  parseClue,
  parseResponse,
  parseWager,
  matchClue,
  matchResponse,
  matchWager,
} from '../helpers/game';
import {
  speak,
  listen,
} from '../helpers/speech';

import game from '../Game';

class Screen extends React.Component {
  timeouts = {
    round: 5 * 1000,
    pick: 0,
    clue: 5 * 1000,
    wager: 10 * 1000,
    respond: 5 * 1000,
  };
  timers = new Timestore();
  state = {
    utterances: [],

    timerValues: {},
    isPaused: false,
    roundHasExpired: false,
  };

  startGame() {
    this.props.moves.endRound();
  }
  async handleRoundStart() {
    if (this.props.ctx.gameover) return;

    if (this.props.G.roundIndex < 2) {
      // @TODO: reveal categories, then fill clue board

      this.timers.setTimeout('round', () => {
        this.setState({ roundHasExpired: true });
      }, this.timeouts.round);

      this.listenForClue();
    } else if (this.props.G.roundIndex === 2) {
      await speak('Welcome to Final Jeopardy!');
    }
  }
  async handleRoundEnd() {
    // stop and reset everything
    this.timers.clearTimeouts(Object.keys(this.timeouts));
    this.setState({ roundHasExpired: false });

    // @TODO: alert users
    await speak(`That's the end of round ${this.props.G.roundIndex + 1}`);

    this.props.moves.endRound();
  }

  handlePauseToggle() {
    if (this.state.isPaused) {
      this.timers.resumeAll();
    } else {
      this.timers.pauseAll();
    }
    this.setState({ isPaused: !this.state.isPaused });
  }

  async logUtterance(input, output) {
    await this.setState({
      utterances: [...this.state.utterances.slice(0, 3), { input, output }],
    });
    console.log(...this.state.utterances); // @TODO
  }
  async listenWithTimer({
    timer = undefined,
    parse = async () => {},
    match = async () => {},
  }) {
    return new Promise((resolve) => {
      const listener = listen();

      if (timer && this.timeouts[timer]) {
        this.timers.setTimeout(timer, () => {
          listener.stop();
          return resolve(null);
        }, this.timeouts[timer]);
      }

      listener.addEventListener('utterance', async ({ detail }) => {
        // console.log(detail); // @TODO

        const parsed = await parse(detail);
        if (!parsed) return;

        // @TODO: should this resolve here instead?
        const matched = await match(parsed);
        this.logUtterance(parsed, matched);
        if (!matched) return;

        listener.stop();
        if (timer) this.timers.clearTimeout(timer);
        return resolve(matched);
      });
    });
  }
  async listenForClue() {
    const tile = await this.listenWithTimer({
      timer: 'pick',
      parse: parseClue,
      match: tile => matchClue(tile, this.props.G.rounds[this.props.G.roundIndex].categories),
    });

    this.props.moves.pickClue(tile);
  }
  async listenForResponse() {
    const clue = getCurrentClue(this.props.G, this.props.ctx);
    if (clue) {
      const response = await this.listenWithTimer({
        timer: 'respond',
        parse: parseResponse,
        match: response => matchResponse(response, clue.response),
      });

      this.props.moves.submitResponse({
        response,
        playerID: this.props.G.screenPlayerID,
      });
    } else {
      throw new Error('invalid clue');
    }
  }
  async listenForWager() {
    const clue = getCurrentClue(this.props.G, this.props.ctx);
      console.log('submitWage0r', clue)
    if (clue) {
      console.log('submitWage1r')
      const wager = await this.listenWithTimer({
        timer: 'wager',
        parse: parseWager,
        match: wager => matchWager(wager, 5, 2000), // @TODO
      });

      console.log('submitWage2r')
      this.props.moves.submitWager({
        wager,
        playerID: this.props.G.screenPlayerID,
      });
    } else {
      throw new Error('invalid clue');
    }
  }

  async componentDidUpdate(prevProps) {
    const isNewlyAllowedMove = (move) => {
      return !prevProps.ctx.allowedMoves.includes(move)
        && this.props.ctx.allowedMoves.includes(move) && (console.log(move) || 1); // @TODO
    };

    if (this.props.G.roundIndex > 2) {
      return;
    }

    let hasNoCluesRemaining = false;
    if (isNewlyAllowedMove('pickClue')) {
      if (getCluesRemaining(this.props.G)) {
        this.listenForClue();
      } else {
        hasNoCluesRemaining = true;
      }
    }

    const clue = getCurrentClue(this.props.G, this.props.ctx);
    if (clue) {
      if (isNewlyAllowedMove('submitWager')) {
        if (clue.isWagered) {
          await speak('Daily Double. What would you like to wager?');
        }
        this.listenForWager();
      }
      if (isNewlyAllowedMove('acceptBuzzes')) {
        if (!clue.responses) {
          await speak(clue.prompt);
        }
        this.props.moves.acceptBuzzes();

        this.timers.setTimeout('clue', () => {
          this.props.moves.expireClue();
        }, this.timeouts.clue);
      }
      if (isNewlyAllowedMove('submitResponse')) {
        this.timers.clearTimeout('clue');

        if (clue.isWagered) {
          await speak(clue.prompt);
        }
        this.listenForResponse();
      }
      if (isNewlyAllowedMove('scoreResponse')) {
        let wasCorrect;
        if (clue.responses && clue.responses.length) {
          const { response, isCorrect } = clue.responses[clue.responses.length - 1];
          await speak(`"${response}" is ${isCorrect ? '' : 'in'}correct`);
          wasCorrect = isCorrect;
        }
        this.props.moves.scoreResponse({
          isCorrect: wasCorrect,
          playerID: this.props.G.screenPlayerID,
        });
      }
    }

    if (prevProps.G.roundIndex !== this.props.G.roundIndex) {
      this.handleRoundStart();
    }
    if ((hasNoCluesRemaining || this.state.roundHasExpired) && this.props.ctx.allowedMoves.includes('endRound')) {
      this.handleRoundEnd();
    }
  }
  async componentDidMount() {
    this.timers.setInterval(() => {
      const timerValues = { ...this.state.timerValues };
      Object.entries(this.timeouts).forEach(([timer, timeout]) => {
        const timeLeft = this.timers.getTimeoutTimeLeft(timer);
        timerValues[timer] = (timeLeft / timeout * 100) || 0;
      });

      this.setState({ timerValues });
    }, 16);
  }
  componentWillUnmount() {
    this.timers.clearAll();
  }

  render() {
    return (
      <Grid container direction="column" style={{height: '100vh', overflow: 'hidden'}}>
        <HUD
          {...this.props}
          timerValue={this.state.timerValues.round}
          isPaused={this.state.isPaused}
          onPauseToggle={this.handlePauseToggle.bind(this)}
        />
        {this.props.G.roundIndex >= 0 ? (
          <Clues
            {...this.props}
            timerValue={this.state.timerValues.clue}
            style={{flex: 1}}
          />
        ) : (
          <button onClick={this.startGame.bind(this)} style={{flex: 1}}>Start</button>
        )}
        <Lecturns
          {...this.props}
          timerValue={this.state.timerValues.wager || this.state.timerValues.respond}
        />
      </Grid>
    );
  }
}

export default Client({
  game,
  board: Screen,
  // multiplayer: { server: 'localhost:3030' },
  // debug: false,
});
