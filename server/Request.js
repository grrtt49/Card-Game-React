const Player = require("./Player");

class Request {
	request;

	constructor(request) {
		this.request = request;
		this.players = [];
	}

	async getRequestPlayers(io, mongooseController) {
		this.players = [];
		for (let i = 0; i < this.request.players.length; i++) {
			let mongoPlayer = await mongooseController.getUserFromId(this.request.players[i].id);
			this.players.push(new Player(mongoPlayer, io));
		}
	}

	async removePlayer(id) {
		for (let i = 0; i < this.request.players.length; i++) {
			if (this.request.players[i].id == id) {
				this.request.players.splice(i, 1);
				await this.saveRequest();
			}
		}
		// TODO: this.getRequestPlayers();
	}

	async movePlayersToGame(gameID, mongooseController) {
		console.log("Moving players to game: ", gameID);
		let requestRoom = "room" + this.request.requestID;
		let gameRoom = "game_room" + gameID;
		for (let i = 0; i < this.players.length; i++) {
			const socket = this.players[i].socket;
			socket.leave(requestRoom);
			socket.join(gameRoom);
			await mongooseController.updateUser(this.players[i].user, "currentGameID", gameID);
		}
	}

	async saveRequest() {
		try {
			await this.request.save();
			return true;
		}
		catch (err) {
			console.log("Update request error: ", err);
			this.socket.emit('player error', "Server error, please try again.");
			return false;
		}
	}

	toJSON() {
		// let players_JSON = [];
		// for (let i = 0; i < this.request.players.length; i++) {
		// 	players_JSON.push(this.request.players[i]);
		// }
		return {
			"creator": this.request.creator,
			"num_players": this.request.players.length,
			"players": this.request.players,
			"id": this.request.requestID,
			"maxPlayers": 10,
		}
	}

}

module.exports = Request;