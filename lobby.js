/**
 * Lobby
 */

'use strict';

/* Requires ------------------------------------------------------------------*/

const MatchStore = require('./MatchStore');

/* Local variables -----------------------------------------------------------*/

const MAX_PLAYERS = 8;
const GAME_TIMER = 1000 * 60 * 2.5;

/* Methods -------------------------------------------------------------------*/

function join(req) {
	console.log(req);
	MatchStore.get_or_make(req.body.match)
		.then((match) => {
			if (match.state === 'lobby' && match.players.length < MAX_PLAYERS) {
				match.players.push(req.client);
				req.client.match = req.session.match;
				req.client.role = 'play';
				req.client.on('disconnect', () => {
					// Remove me from lobby
					let i = match.players.indexOf(req.client);
					if (i > -1) match.players.splice(i, 1);
					setTimeout(() => {
						publish_update(req.client.server, match);
					}, 10);
				});
				req.reply({state: 'lobby'});
				setTimeout(() => publish_update(req.client.server, match), 100);
			}
			else {
				req.reply('nope');
			}
		}, req.reply);
}

function start(req) {
	MatchStore.get(req.body.match)
		.then((match) => {
			match.state = req.body.state;
			publish_update(req.client.server, match);
			// Kill match after game time
			setTimeout(() => {
				MatchStore.clean(req.body.match);
				req.client.server.connections.forEach((connection, i) => {
					if (connection.session.match === match.name) {
						delete connection.session.match;
						delete connection.session.color;
						delete connection.session.role;
					}
				});
			}, GAME_TIMER);
		}, req.reply)
}

function publish_update(server, match) {
	let players = 0;
	server.connections.forEach((connection, i) => {
		if (connection.session.match === match.name && connection.socket) {
			connection.session.color = (connection.session.role === 'play')?players++:null;
			connection.write('lobby.update', {
				state: match.state, 
				players: match.players.length,
				name: match.name,
				color: connection.color
			});
		}
	});
}

/* Exports -------------------------------------------------------------------*/

module.exports = { join, start };