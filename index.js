/**
 * Server router
 */

'use strict';

/* Requires ------------------------------------------------------------------*/

const Kalm = require('kalm');
const WS = require('kalm-websocket');
const Express = require('express');
const MatchStore = require('./MatchStore');

const lobbyController = require('./lobby');
const gameController = require('./game');

/* Init ----------------------------------------------------------------------*/

Kalm.adapters.register('ws', WS);

const socketApp = new Kalm.Server({
	socketTimeout: 5 * 60 * 1000,
	adapter: 'ws',
	port: 9000
});

const webApp = Express();
webApp.disable('x-powered-by');

/* Game ----------------------------------------------------------------------*/

// LOBBY
socketApp.subscribe('lobby.join', lobbyController.join.bind(socketApp), {
	delay: 0,
});

// GAME
socketApp.subscribe('player.move', gameController.move.bind(socketApp), {
	delay: 1000/60,
});

socketApp.subscribe('player.spawn', gameController.spawn.bind(socketApp), {
	delay: 0,
});

// Others
socketApp.catch((payload, client) => {
	// TODO: ONLY accept during DEV! Make sure this is turned off in prod  
	console.log('Unexpected payload:', payload);
	console.log(client);
	client.send('errors', 'Unexpected payload');
});

webApp.post('/', (req, res) => {
	MatchStore.add(req.body.name)
		.then(() => res.json('ok'))
		.catch((err) => res.json(err))
});

webApp.listen(3000, () => {});