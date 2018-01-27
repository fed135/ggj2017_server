/**
 * Match store
 */

'use strict';

/* Local variables -----------------------------------------------------------*/

const Matches = {};

/* Methods -------------------------------------------------------------------*/

function add(name) {
	return new Promise((resolve, reject) => {
		// Check if match exist
		if (!Matches.hasOwnProperty(name)) _push(name, resolve);
		else return reject('Match already exists with that name');
	});
}

function get(name) {
	return new Promise((resolve, reject) => {
		if (Matches.hasOwnProperty(name)) resolve(Matches[name]);
		else reject('No match with that name'); 
	});
}

function clean(name) {
	delete Matches[name];
	return Promise.resolve();
}

function _push(name, callback) {
	Matches[name] = {
		players: [],
		state: 'lobby',
		name
	};

	callback(Matches[name]);
}

function get_or_make(name) {
	return get(name)
		.then(null, () => add(name));
}

/* Exports -------------------------------------------------------------------*/

module.exports = { add, get, clean, get_or_make };