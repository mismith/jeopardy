import { store } from './store';

const pre = document.getElementsByTagName('pre')[0];
const ul = document.getElementsByTagName('ul')[0];

const refresh = () => {
  const state = store.getState();
  console.log(state);
  pre.innerHTML = JSON.stringify(state, null, 2);

  ul.innerHTML = Object.entries(state.actions).map(([k, v]) => {
    return `<li>${v ? `<a href="#" onclick="handleAction('${k}')">${k}</a>` : k}</li>`;
  }).join('');
};

const dispatch = (type, payload) => {
  store.dispatch({ type, payload });
  refresh();
};

refresh();
window.handleAction = (type) => {
  let payload;
  switch (type) {
    case 'LOAD_ROUNDS': {
      payload = { rounds: [{}, {}, {}] };
      break;
    }
    case 'ADD_PLAYER': {
      payload = { name: `Player ${+new Date()}` };
      break;
    }
  }
  dispatch(type, payload);
};

