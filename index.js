/**
 * Server router
 */

'use strict';

/* Requires ------------------------------------------------------------------*/

const Kalm = require('kalm');
const wss = require('kalm-secure-websocket');
const fs = require('fs');
const MatchStore = require('./MatchStore');

const lobbyController = require('./lobby');
const gameController = require('./game');

/* Init ----------------------------------------------------------------------*/

const socketApp = Kalm.listen({
	socketTimeout: 5 * 60 * 1000,
	transport: wss,
	port: 9000,
	profile: { tick: 5 },
	ssl: {
		key: fs.readFileSync('./ssl/test_key.pem'),
		cert: fs.readFileSync('./ssl/test_cert.pem'),
	}
});

/* Game ----------------------------------------------------------------------*/

// LOBBY
socketApp.on('connection', (client) => { 
	client.subscribe('lobby.join', lobbyController.join);

	client.subscribe('lobby.update', lobbyController.start);

	// GAME
	client.subscribe('player.move', gameController.move);

	client.subscribe('player.punch', gameController.punch);

	client.subscribe('player.spawn', gameController.spawn);

	client.subscribe('player.vibrate', gameController.vibrate);
});