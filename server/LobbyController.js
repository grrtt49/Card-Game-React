const Game = require('./Game');
const FixedList = require('./FixedList');
const Request = require('./Request');

class LobbyController {

	games;
	requests;
	maxPlayersInGame;

	constructor() {
		this.games = new FixedList(50);
		this.requests = new FixedList(50);
		this.maxPlayersInGame = 8;
	}

	createRequest(player) {
		let request = new Request(player);
		let id = this.requests.create(request);
		request.id = id;
		return id;
	}

	getRequest(i) {
		if (i == null) {
			return null;
		}
		return this.requests.get(i);
	}

	/**
	 * Returns the game at index i
	 * @returns {Game}
	 */
	getGame(i) {
		if (i == null) {
			return null;
		}
		return this.games.get(i);
	}

	getActiveRequests() {
		return this.requests.getActive();
	}

	removeRequestById(id) {
		this.requests.remove(id);
	}

	createRequestForPlayer(io, player) {
		if (player.currentRequestID != null) {
			console.log("Player is in a request already");
			return false;
		}

		player.currentRequestID = this.createRequest(player);
		let request = this.getRequest(player.currentRequestID);

		if (player.currentRequestID == null) {
			console.log("Could not create request");
			return false;
		}
			
		player.socket.join("room" + player.currentRequestID);
		io.emit('new available request', request.toJSON());
		console.log("Created request: " + (player.currentRequestID == null ? "false" : player.currentRequestID));
		return request.toJSON();		
	}

	joinRequestFromPlayer(io, player, requestID) {
		if (player.currentRequestID != null) {
			io.to(player.socket.id).emit('unsuccessful join');
			return;
		}

		let request = this.getRequest(requestID);

		if (request == null) {
			io.to(player.socket.id).emit('unsuccessful join');
			return;
		}

		player.currentRequestID = requestID;
		request.players.push(player);
		player.socket.join("room" + requestID);

		io.to(player.socket.id).emit('successful join', request.toJSON());
		if (request.players.length >= this.maxPlayersInGame) {
			// TODO: add ability to readd it if a player leaves
			io.emit('remove available request', request);
		}
		else {
			io.to('room' + requestID).emit('updated request', request.toJSON());
		}
	}

	removeCurrentRequest(io, player) {
		if (player.currentRequestID == null) {
			console.log("No current game to cancel");
			return;
		}

		let request = this.getRequest(player.currentRequestID);

		if(request == null) {
			console.log("Request already cancelled");
			io.to(player.socket.id).emit('creator cancelled request', player.currentRequestID);
		}

		player.socket.leave("room" + player.currentRequestID);
		if (request.creator.id == player.id) {
			this.removeRequestById(player.currentRequestID);
			io.emit('remove available request', request);
			io.to('room' + player.currentRequestID).emit('creator cancelled request', player.currentRequestID);
			console.log("Cancelled created game");
		}
		else {
			request.removePlayer(player.id);
			io.emit('updated request', request.toJSON());
		}
		player.currentRequestID = null;
	}

	startGame(io, player) {
		let request = this.getRequest(player.currentRequestID);

		if (request == null) {
			console.log("No game to start");
			return;
		}

		if (player.id != request.creator.id) {
			console.log("Not the creator");
			return;
		}

		this.removeRequestById(request.id);
		io.emit('remove available game', request);
		console.log("Starting game: " + request.id);

		let newGame = new Game(request.players);
		let gameId = this.games.create(newGame);
		newGame.id = gameId;
		newGame.room = "game_room" + gameId;

		request.movePlayersToGame(gameId);

		newGame.sendDataToPlayers(io, "game started");
	}

	getGameData(io, player) {
		let game = this.getGame(player.currentGameID);
		io.to(player.socket.id).emit("game data", game.getPlayerGameData(player.gamePlayerID));
	}

	tryPlayingCard(io, player, cardID, color) {
		let game = this.getGame(player.currentGameID);

		if (game == null) {
			console.log("No game to play card");
			return false;
		}

		let success = game.takeTurn(player.gamePlayerID, cardID, color);
		if (success.success) {
			game.sendDataToPlayers(io);
		}
		else {
			console.log("Sending error message: ", success);
			io.to(player.socket.id).emit("player error", success.msg);
		}
		return success;
	}

	endTurn(io, player) {
		let game = this.getGame(player.currentGameID);

		if (game == null) {
			console.log("No game to end turn");
			return false;
		}

		game.endTurnForPlayer(player.gamePlayerID);

		game.sendDataToPlayers(io);
	}

	sendMessage(io, player, message) {
		let game = this.getGame(player.currentGameID);

		if (game == null) {
			console.log("No game to send message");
			return false;
		}
		
		game.sendMessageToPlayers(io, player, message);
	}
}

module.exports = LobbyController;