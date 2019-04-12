import React from 'react';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

const gameIDPattern = /^[0-9]{6}$/;
const playerNamePattern = /^.{2}$/;

export default class Lobby extends React.Component {
  state = {
    gameID: '',
    gameIDError: false,
    gameIDErrorMessage: '',
    playerName: '',
    playerNameError: false,
    playerNameErrorMessage: '',
  };

  async validateGameID(shouldShowMessage = false) {
    const gameID = `${this.state.gameID || ''}`.trim();
    let gameIDError = false;
    let gameIDErrorMessage;
    if (!gameID) {
      gameIDError = true;
      gameIDErrorMessage = 'Required; please enter the six digit number on your main screen.';
    } else if (!gameIDPattern.test(gameID)) {
      gameIDError = true;
      gameIDErrorMessage = 'Invalid; should match format "123456".';
    }
    await this.setState({
      gameIDError,
      gameIDErrorMessage: shouldShowMessage && gameIDErrorMessage,
    });
  }
  async handleGameIDInput({ target: { value } }) {
    await this.setState({ gameID: value });
    await this.validateGameID();
  }
  async validatePlayerName(shouldShowMessage = false) {
    const playerName = `${this.state.playerName || ''}`.trim();
    let playerNameError = false;
    let playerNameErrorMessage;
    if (!playerName) {
      playerNameError = true;
      playerNameErrorMessage = 'Required; please enter a name for yourself.';
    } else if (!playerNamePattern.test(playerName)) {
      playerNameError = true;
      playerNameErrorMessage = 'Invalid; must be at least two characters long.';
    }
    await this.setState({
      playerNameError,
      playerNameErrorMessage: shouldShowMessage && playerNameErrorMessage,
    });
  }
  async handlePlayerNameInput({ target: { value } }) {
    await this.setState({ playerName: value });
    await this.validatePlayerName();
  }
  async handleJoinGame(event) {
    event.preventDefault();

    await this.validateGameID(true);
    await this.validatePlayerName(true);
    if (this.state.gameIDError || this.state.playerNameError) return;

    const res = await window.fetch('//localhost:3030/games/jeopardy');
    const { gameInstances } = await res.json();
    const gameInstance = gameInstances.find(({ gameID }) => gameID === this.state.gameID);
    console.log(gameInstances, gameInstance);
    if (gameInstance) {

    }
    // const res = await window.fetch(`//localhost:3030/games/jeopardy/${this.state.gameID}/join`, {
    //   method: 'POST',
    // });
    // @TODO: check if game with gameID exists
    // @TODO: check whether game is accepting new players
    // @TODO: add player to game, thereby determining player ID
    // this.props.history.push(`/games/${this.state.gameID}/players/:playerID`);
  }

  async handleHostGame() {
    const res = await window.fetch('//localhost:3030/games/jeopardy/create', {
      method: 'POST',
    });
    const { gameID } = await res.json();
    console.log(gameID);

    // const gameID = Date.now();
    // this.props.history.push(`/games/${gameID}`);
  }

  render() {
    return (
      <form onSubmit={this.handleJoinGame.bind(this)}>
        <Grid container justify="center" alignItems="center" style={{padding: 16}}>
          <Paper style={{maxWidth: 400, padding: 16}}>
            <Grid container spacing={16}>
              <Grid item xs={12}>
                <Typography variant="h2" component="h1" gutterBottom style={{textAlign: 'center'}}>
                  Jeopardy
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Game Code"
                  variant="outlined"
                  fullWidth
                  required
                  pattern={gameIDPattern}
                  error={!!this.state.gameIDError}
                  helperText={this.state.gameIDErrorMessage}
                  value={this.state.gameID}
                  onInput={this.handleGameIDInput.bind(this)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Player Name"
                  variant="outlined"
                  fullWidth
                  required
                  pattern={playerNamePattern}
                  error={!!this.state.playerNameError}
                  helperText={this.state.playerNameErrorMessage}
                  value={this.state.playerName}
                  onInput={this.handlePlayerNameInput.bind(this)}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                >
                  Join Game
                </Button>
              </Grid>
              <Grid item container xs={12} justify="center" style={{padding: 16, opacity: 0.5}}>
                <small>&mdash; or &mdash;</small>
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  fullWidth
                  onClick={this.handleHostGame.bind(this)}
                >
                  Host Game
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </form>
    );
  }
}
