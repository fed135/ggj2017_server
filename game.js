/**
 * Game
 */

'use strict';

/* Requires ------------------------------------------------------------------*/

const crypto = require('crypto');

const MatchStore = require('./MatchStore');

/* Local variables -----------------------------------------------------------*/

/* Methods -------------------------------------------------------------------*/

function move(req) {
	req.client.server.connections.forEach((connection) => {
		if (connection.match === req.body.match && req.session.role === 'spectate') {
			connection.write('player.move', req.body);
		}
	});
}

function punch(req) {
	req.client.server.connections.forEach((connection) => {
		if (connection.match === req.body.match && req.session.role === 'spectate') {
			connection.write('player.punch', req.body);
		}
	});
}

function spawn(req) {
	req.session.player = req.body.player || crypto.randomBytes(20).toString('hex');
	req.body.player = req.session.player;

	req.client.server.connections.forEach((connection) => {
		if (connection.match === req.body.match && req.session.role === 'spectate') {
			connection.write('player.spawn', req.body);
		}
	});
}

function vibrate(req) {
	req.client.server.connections.forEach((connection) => {
		if (connection.match === req.body.match && connection.color === packet.color) {
			connection.write('player.vibrate', req.body);
		}
	});
}

/* Exports -------------------------------------------------------------------*/

module.exports = { spawn, punch, move, vibrate };