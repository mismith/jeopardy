import { Server }  from 'boardgame.io/server';
import game from'./Game';

const PORT = process.env.PORT || 3030;
const server = Server({
  games: [game],
});
server.run(PORT, () => console.log(`running on ${PORT}`));
