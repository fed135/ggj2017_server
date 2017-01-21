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
	MatchStore.get(packet.match)
		.then((match) => {
			if (match.state === 'lobby' && match.players.length < MAX_PLAYERS) {
				match.players.push(channel._client);
				channel._client.match = packet.match;
				channel._client.on('disconnect', () => {
					// Remove me from lobby
					let i = match.players.indexOf(channel._client);
					if (i > -1) match.players.splice(i, 1);
					this.broadcast('lobby.update', { 
						state: match.state, 
						players: match.players.length 
					});
				})
				reply('ok');
				this.broadcast('lobby.update', { 
					state: match.state, 
					players: match.players.length 
				});
			}
			else {
				reply('nope');
			}
		})
}

/* Exports -------------------------------------------------------------------*/

module.exports = { join };