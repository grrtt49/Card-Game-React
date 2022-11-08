const { v4: uuidv4 } = require('uuid');

class Player {
	socket;
	user;

	constructor(user, io) {
		this.user = user;
		this.socket = io.sockets.sockets.get(user.socket);
	}

	getNickname() {
		return this.user ? this.user.nickname : null;
	}

	getCurrentGameID() {
		return this.user ? this.user.currentGameID : null;
	}

	getCurrentRequestID() {
		return this.user ? this.user.currentRequestID : null;
	}

	getGamePlayerID() {
		return this.user ? this.user.gamePlayerID : null;
	}

	getSettings() {
		return this.user ? this.user.settings : null;
	}

	id() {
		return this.user ? this.user.id : null;	
	}

	toJSON() {
		return {
			"id": this.id(),
			"nickname": this.getNickname(),
			"settings": this.user.settings,
			"socketID": this.socket.id,
		}
	}
}

module.exports = Player;