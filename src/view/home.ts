import { Chessground } from 'chessground';
import { h } from 'snabbdom';
import { Ctrl } from '../ctrl';
import { Game, Renderer } from '../interfaces';
import OngoingGames from '../ongoingGames';
import { href } from '../routing';
import { io } from 'socket.io-client';


export const renderHome: Renderer = ctrl => (ctrl.auth.me ? userHome(ctrl) : anonHome());

const userHome = (ctrl: Ctrl) => [
  h('div', [
    h('div.btn-group.mt-5', [
      h(
        'button.btn.btn-outline-primary.btn-lg',
        {
          attrs: { type: 'button' },
          on: { click: ctrl.playAi },
        },
        'Play the Lichess AI'
      ),
      h(
        'button.btn.btn-outline-primary.btn-lg',
        {
          attrs: { type: 'button' },
          on: { click: () => ctrl.playMaia(10, 0) },
        },
        'Play a casual 10+0 game with the maia1 BOT'
      ),
      h(
        'button.btn.btn-outline-primary.btn-lg',
        {
          attrs: { type: 'button' },
          on: { click: () => ctrl.playPool(10, 0) },
        },
        'Play a rated 10+0 game with a random opponent'
      ),
      // New button to connect to Socket.IO
      h(
        'button.btn.btn-outline-success.btn-lg',
        {
          attrs: { type: 'button' },
          on: {
            click: () => {
              const socket = io('http://169.254.117.80:5000'); // Replace with the correct server address

              socket.on('connect', () => {
                console.log('Connected to Socket.IO server');
              });

              socket.on('disconnect', () => {
                console.log('Disconnected from Socket.IO server');
              });

              socket.on('connect_error', (error: Error) => {
                console.error('Connection error:', error.message);
              });

              // Example of handling a custom event
                socket.on('some_event', (data: any) => {
                console.log('Received some_event:', data);
                });
            },
          },
        },
        'Connect to Socket.IO'
      ),
    ]),
    h('h2.mt-5', 'Games in progress'),
    h('div.games', renderGames(ctrl.games)),
  ]),
];
const renderGames = (ongoing: OngoingGames) =>
  ongoing.games.length ? ongoing.games.map(renderGameWidget) : [h('p', 'No ongoing games at the moment')];

const renderGameWidget = (game: Game) =>
  h(
    `a.game-widget.text-decoration-none.game-widget--${game.id}`,
    {
      attrs: href(`/game/${game.gameId}`),
    },
    [
      h('span.game-widget__opponent', [
        h('span.game-widget__opponent__name', game.opponent.username || 'Anon'),
        game.opponent.rating && h('span.game-widget__opponent__rating', game.opponent.rating),
      ]),
      h(
        'span.game-widget__board.cg-wrap',
        {
          hook: {
            insert(vnode) {
              const el = vnode.elm as HTMLElement;
              Chessground(el, {
                fen: game.fen,
                orientation: game.color,
                lastMove: game.lastMove.match(/.{1,2}/g),
                viewOnly: true,
                movable: { free: false },
                drawable: { visible: false },
                coordinates: false,
              });
            },
          },
        },
        'board'
      ),
    ]
  );

const anonHome = () => [
  h('div.login.text-center', [
    h('div.big', [h('p', 'Please log in to continue.')]),
    h(
      'a.btn.btn-primary.btn-lg.mt-5',
      {
        attrs: href('/login'),
      },
      'Login with Lichess'
    ),
  ]),
];
