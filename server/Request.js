class Request {
	creator;
	players;
	id;

	constructor(player) {
		this.creator = player;
		this.players = [player];
		this.id = null;
	}

	removePlayer(id) {
		for (let i = 0; i < this.players.length; i++) {
			if (this.players[i].id == id) {
				this.players.splice(i, 1);
				return;
			}
		}
	}

	movePlayersToGame(gameID) {
		let requestRoom = "room" + this.id;
		let gameRoom = "game_room" + gameID;
		for (let i = 0; i < this.players.length; i++) {
			this.players[i].socket.leave(requestRoom);
			this.players[i].socket.join(gameRoom);
			this.players[i].currentGameID = gameID;
		}
	}

	toJSON() {
		let players_JSON = [];
		for (let i = 0; i < this.players.length; i++) {
			players_JSON.push(this.players[i].toJSON());
		}
		return {
			"creator": this.creator.toJSON(),
			"num_players": this.players.length,
			"players": players_JSON,
			"id": this.id,
			"maxPlayers": 10,
		}
	}

}

module.exports = Request;