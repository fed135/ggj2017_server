/**
 * Lobby
 */

'use strict';

/* Requires ------------------------------------------------------------------*/

const MatchStore = require('./MatchStore');

/* Local variables -----------------------------------------------------------*/

const MAX_PLAYERS = 8;

/* Methods -------------------------------------------------------------------*/

function join(packet, reply, channel) {
	MatchStore.get_or_make(packet.match)
		.then((match) => {
			if (packet.role === 'spectate') {
				channel._client.match = packet.match;
				reply({
					state: match.state, 
					players: match.players.length,
					name: packet.match
				});
			}
			else {
				if (match.state === 'lobby' && match.players.length < MAX_PLAYERS) {
					match.players.push(channel._client);
					channel._client.match = packet.match;
					channel._client.on('disconnect', () => {
						// Remove me from lobby
						let i = match.players.indexOf(channel._client);
						if (i > -1) match.players.splice(i, 1);
						setTimeout(() => {
							console.log('publishing disconnect');
							publish_update(this, match);
						}, 10);
					})
					reply({
						state: match.state, 
						players: match.players.length,
						name: packet.match
					});
					console.log('publishing connect');
					publish_update(this, match);
				}
				else {
					reply('nope');
				}
			}
		}, reply);
}

function publish_update(server, match) {
	server.connections.forEach((connection) => {
		console.log(connection.match, match)
		if (connection.match === match.name && connection.socket) {
			console.log('sending!');
			connection.send('lobby.update', {
				state: match.state, 
				players: match.players.length 
			});
		}
	});
}

/* Exports -------------------------------------------------------------------*/

module.exports = { join };