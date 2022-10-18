const { v4: uuidv4 } = require('uuid');

class Player {
	id;
	socket;
	nickname;
	currentGameID;
	currentRequestID;
	gamePlayerID;

	constructor(socket) {
		this.id = uuidv4();
		this.socket = socket;
		this.currentGameID = null;
		this.currentRequestID = null;
		this.gamePlayerID = null;
	}

	toJSON() {
		return {
			"id": this.id,
			"nickname": this.nickname
		}
	}
}

module.exports = Player;