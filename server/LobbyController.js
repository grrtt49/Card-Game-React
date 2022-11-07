const Game = require('./Game');
const Request = require('./Request');
const Player = require('./Player');
const GameModel = require('./GameModel');
const RequestModel = require('./RequestModel');
const MongooseController = require('./MongooseController');
const { request } = require('express');

class LobbyController {

	maxPlayersInGame;
	mongooseController;
	gameModel;
	requestModel;

	/**
	 * 
	 * @param {MongooseController} mongooseController 
	 * @param {GameModel} gameModel 
	 * @param {RequestModel} requestModel 
	 */
	constructor(mongooseController, gameModel, requestModel) {
		this.maxPlayersInGame = 10;
		this.mongooseController = mongooseController;
		this.gameModel = gameModel;
		this.requestModel = requestModel;
	}

	async createRequest(player) {
		const requestData = await this.requestModel.createRequest(player);
		let request = new Request(requestData);
		console.log("Got request: ", requestData.requestID);
		return requestData.requestID;
	}

	/**
	 * 
	 * @param {*} i 
	 * @returns {Request}
	 */
	async getRequest(id) {
		if (id == null) {
			return null;
		}
		const request = new Request(await this.requestModel.getRequest(id));
		console.log("Got request! :", request);
		return request;
	}

	/**
	 * Returns the game at index i
	 * @returns {Game}
	 */
	async getGame(id) {
		if (id == null) {
			return null;
		}
		return await this.gameModel.getGame(id);
	}

	async removeGameById(id) {
		await this.gameModel.remove(id);
	}

	async getActiveRequests() {
		return await this.requestModel.getActive();
	}

	async removeRequestById(id) {
		await this.requestModel.remove(id);
	}

	async createRequestForPlayer(io, player) {
		if (player.getCurrentRequestID() == null) {
			const newRequestID = await this.createRequest(player);
			await this.mongooseController.updateUser(player.user, "currentRequestID", newRequestID);
		}
		else {
			console.log("Using current request: ", player.getCurrentRequestID());
		}
		
		let request = await this.getRequest(player.getCurrentRequestID());

		if (player.getCurrentRequestID() == null || !request) {
			console.log("Could not create request", request, player.getCurrentRequestID());
			return false;
		}
			
		player.socket.join("room" + player.getCurrentRequestID());
		io.emit('new available request', request.toJSON());
		// console.log("Created request: " + (player.getCurrentRequestID() == null ? "false" : player.getCurrentRequestID()));
		return request.toJSON();		
	}

	async joinRequestFromPlayer(io, player, requestID) {
		if (player.getCurrentRequestID() != null) {
			io.to(player.socket.id).emit('unsuccessful join');
			return;
		}

		let request = await this.getRequest(requestID);

		if (request == null) {
			io.to(player.socket.id).emit('unsuccessful join');
			return;
		}

		await this.mongooseController.updateUser(player.user, "currentRequestID", requestID);
		request.request.players.push(player);
		await request.saveRequest();
		player.socket.join("room" + requestID);

		io.to(player.socket.id).emit('successful join', request.toJSON());
		if (request.request.players.length >= this.maxPlayersInGame) {
			// TODO: add ability to readd it if a player leaves
			io.emit('remove available request', request);
		}
		else {
			io.to('room' + requestID).emit('updated request', request.toJSON());
		}
	}

	async removeCurrentRequest(io, player) {
		if (player.getCurrentRequestID() == null) {
			console.log("No current game to cancel");
			return;
		}

		let request = this.getRequest(player.getCurrentRequestID());

		if(request == null) {
			console.log("Request already cancelled");
			io.to(player.socket.id).emit('creator cancelled request', player.getCurrentRequestID());
			io.to(player.socket.id).emit('player error', "The creator cancelled this game.");
		}

		player.socket.leave("room" + player.getCurrentRequestID());
		if (request.request.creator != null && request.request.creator.id == player.id()) {
			this.removeRequestById(player.getCurrentRequestID());
			io.emit('remove available request', request);
			io.to('room' + player.getCurrentRequestID()).emit('creator cancelled request', player.getCurrentRequestID());
			io.to('room' + player.getCurrentRequestID()).emit('player error', "The creator cancelled this game.");
			console.log("Cancelled created game");
		}
		else {
			await request.removePlayer(player.id());
			io.emit('updated request', request.toJSON());
		}
		//TODO
		await this.mongooseController.updateUser(player.user, "currentRequestID", null);
	}

	/**
	 * 
	 * @param {*} io 
	 * @param {Player} player 
	 */
	async removePlayerFromGame(io, player) {
		let game = this.getGame(player.getCurrentGameID());
		
		if(game === false) {
			console.log("No game to leave");
			return;
		}

		io.to(game.game.room).emit("player error", player.getNickname() + " left the game.");

		await game.removePlayer(player);
		game.sendDataToPlayers(io);

		player.currentGameID = null;
	}

	async startGame(io, player) {
		let request = await this.getRequest(player.getCurrentRequestID());

		if (request == null) {
			console.log("No game to start");
			return;
		}

		if (player.id() != request.request.creator.id) {
			console.log("Not the creator");
			return;
		}

		this.removeRequestById(request.request.requestID);
		io.emit('remove available game', request);
		console.log("Starting game: " + request.request.requestID);

		let gameData = await this.gameModel.createGame(request.request.players);
		let newGame = new Game(gameData);
		const gameID = newGame.game.gameID;
		newGame.room = "game_room" + gameID;

		await request.movePlayersToGame(gameID, this.mongooseController);

		await newGame.resetPlayersRequestId();
		newGame.sendDataToPlayers(io, "game started");
	}

	getGameData(io, player) {
		let game = this.getGame(player.getCurrentGameID());
		if(game == null) {
			console.log("No game to get");
			return;
		}
		io.to(player.socket.id).emit("game data", game.getPlayerGameData(player.getGamePlayerID()));
	}

	async tryPlayingCard(io, player, cardID, color) {
		let game = this.getGame(player.getCurrentGameID());

		if (game == null) {
			console.log("No game to play card");
			return false;
		}

		let success = game.takeTurn(player.getGamePlayerID(), cardID, color);
		if (success.success) {
			game.sendDataToPlayers(io);
		}
		else {
			console.log("Sending error message: ", success);
			io.to(player.socket.id).emit("player error", success.msg);
		}

		if(game.isGameOver()) {
			console.log("Game is over");
			game.sendGameOverToPlayers(io);
			await game.removeAllPlayers();
		}

		return success;
	}

	endTurn(io, player) {
		let game = this.getGame(player.getCurrentGameID());

		if (game == null) {
			console.log("No game to end turn");
			return false;
		}

		game.endTurnForPlayer(player.getGamePlayerID());

		game.sendDataToPlayers(io);
	}

	sendMessage(io, player, message) {
		let game = this.getGame(player.getCurrentGameID());

		if (game == null) {
			console.log("No game to send message");
			return false;
		}
		
		game.sendMessageToPlayers(io, player, message);
	}
}

module.exports = LobbyController;