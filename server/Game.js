const Cards = require('./Cards');
const Player = require('./Player');

class Game {
	game;

	/**
	 * 
	 * @param {*} game 
	 */
	constructor(game) {
		this.game = game;
		this.players = [];
	}

	async getGamePlayers(io, mongooseController) {
		this.players = [];
		// console.log("Adding players: ", this.game.players);
		for (let i = 0; i < this.game.players.length; i++) {
			let mongoPlayer = await mongooseController.getUserFromId(this.game.players[i].id);
			// console.log("Adding player: ", mongoPlayer.socket);
			this.players.push(new Player(mongoPlayer, io));
		}
	}

	async takeTurn(playerIndex, cardIndex, color) {
		if (playerIndex != this.game.currentTurn) {
			console.log("Not your turn");
			return {success: false, msg: "It is not your turn"};
		}

		let cards = new Cards(this.game.cards);

		let playedCard = cards.playCardFromPlayer(playerIndex, cardIndex, color);
		if (!playedCard.success) {
			return playedCard;
		}

		if(playedCard.playedCard.number == "skip") {
			this.nextTurn();
		}
		else if(playedCard.playedCard.number == "reverse") {
			this.game.isReversed = !this.game.isReversed;
		}

		if(playedCard.playedCard.drawAmount != null) {
			this.nextTurn();
			for (let i = 0; i < playedCard.playedCard.drawAmount; i++) {
				cards.drawCardForPlayer(this.game.currentTurn);
			}
		}

		this.nextTurn();

		// console.log("Setting cards: ", cards.getData());
		this.game.cards = cards.getData();
		this.game.markModified('cards');
		await this.saveGame();
		return playedCard;
	}

	async endTurnForPlayer(playerIndex) {
		if (playerIndex != this.game.currentTurn) {
			console.log("Not your turn");
			return false;
		}
		let cards = new Cards(this.game.cards);
		cards.drawCardForPlayer(playerIndex); 

		// console.log("Cards: ", cards);
		this.game.cards = cards.getData();
		this.game.markModified('cards');

		this.nextTurn();

		await this.saveGame();
	}

	nextTurn() {
		this.game.currentTurn = (this.game.currentTurn + (!this.game.isReversed ? 1 : (this.game.numPlayers - 1))) % this.game.numPlayers;
	}

	sendDataToPlayers(io, message = "game data") {
		let cards = new Cards(this.game.cards);
		let playerTurnData = [];
		for (let i = 0; i < this.players.length; i++) {
			const gamePlayerID = this.players[i].getGamePlayerID();
			playerTurnData.push({
				name: this.players[i].getNickname(),
				isCurrent: this.game.currentTurn == gamePlayerID,
				numCards: Object.keys(cards.hands[gamePlayerID]).length,
			}); 
		}

		console.log("Game players: ", this.game.players);
		for (let i = 0; i < this.players.length; i++) {
			const gamePlayerID = this.players[i].getGamePlayerID();
			let data = {
				playerCards: cards.hands[gamePlayerID],
				currentTurn: this.game.currentTurn,
				topCard: cards.getTopCard(),
				playerTurnData: playerTurnData,
				isTurn: this.game.currentTurn == gamePlayerID,
				isReversed: this.game.isReversed,
				isGameOver: this.isGameOver(),
				gameOverData: this.isGameOver() ? this.getGameOverDataForPlayer(this.players[i]) : null,
			};
			console.log("Sending game data (players): ", this.players[i].socket.id);
			io.to(this.players[i].socket.id).emit(message, data);
		}
	}

	isGameOver() {
		for(let i = 0; i < this.game.cards.hands.length; i++) {
			if(Object.keys(this.game.cards.hands[i]).length <= 0) {
				return true;
			}
		}
		return false;
	}

	async updatePlayerStats() {
		for (let i = 0; i < this.players.length; i++) {
			let handIndex = this.players[i].getGamePlayerID();
			if(Object.keys(this.game.cards.hands[handIndex]).length == 0) {
				this.players[i].user.wins++;
			}
			else {
				this.players[i].user.losses++;
			}
			await this.saveUser(this.players[i].user);
		}
	}

	async resetPlayersRequestId() {
		for (let i = 0; i < this.players.length; i++) {
			this.players[i].user.currentRequestID = null;
			await this.saveUser(this.players[i].user);
		}
	}

	getPlayerGameData(player) {
		let playerID = player.getGamePlayerID();
		let cards = new Cards(this.game.cards);
		let playerTurnData = [];
		for (let i = 0; i < this.players.length; i++) {
			playerTurnData.push({
				name: this.players[i].getNickname(),
				isCurrent: this.game.currentTurn == this.players[i].getGamePlayerID(),
				numCards: Object.keys(cards.hands[i]).length,
			});
		}

		return {
			playerCards: cards.hands[playerID],
			currentTurn: this.game.currentTurn,
			topCard: cards.getTopCard(),
			playerTurnData: playerTurnData,
			isTurn: this.game.currentTurn == playerID,
			isReversed: this.game.isReversed,
			isGameOver: this.isGameOver(),
			gameOverData: this.isGameOver() ? this.getGameOverDataForPlayer(player) : null,
		};
	}

	getGameOverDataForPlayer(player) {
		let playerID = player.getGamePlayerID();
		let playerTurnData = [];

		for (let i = 0; i < this.players.length; i++) {
			let handIndex = this.players[i].getGamePlayerID();
			playerTurnData.push({
				name: this.players[i].getNickname(),
				numCards: Object.keys(this.game.cards.hands[handIndex]).length,
				playAgain: this.game.playersPlayAgain[this.players[i].id()],
			});
		}

		let data = {
			won: Object.keys(this.game.cards.hands[playerID]).length == 0,
			players: playerTurnData,
			playingAgain: this.game.playersPlayAgain[player.id()],
		};

		return data;
	}

	sendMessageToPlayers(io, player, text) {
		for (let i = 0; i < this.game.players.length; i++) {
			let fromSelf = false;
			if(this.game.players[i].id == player.id()) {
				fromSelf = true;
			}

			let message = {
				text: text,
				from: player.getNickname(),
				fromSelf: fromSelf,
			};
			io.to(this.game.players[i].socket.id).emit("new message", message);
			console.log("Sent message: ", message);
		}
	}

	/**
	 * 
	 * @param {Player} player 
	 */
	async removePlayer(player) {
		for (let i = 0; i < this.players.length; i++) {
			if(player.id() == this.players[i].id()) {
				this.players[i].user.currentGameID = null;
				await this.saveUser(this.players[i].user);
				this.players.splice(i, 1);
				await this.saveGame();
				break;
			}
		}
	}

	async removeAllPlayers() {
		for (let i = 0; i < this.players.length; i++) {
			this.players[i].user.currentGameID = null;
			await this.saveUser(this.players[i].user);
		}
		this.players = [];
		await this.saveGame();
	}

	async setPlayerPlayAgain(player, isPlayingAgain) {
		this.game.playersPlayAgain[player.id()] = isPlayingAgain;
		this.game.markModified('playersPlayAgain');
		await this.saveGame();

		return await this.checkPlayAgain();
	}

	async checkPlayAgain() {
		let playAgain = true;
		Object.keys(this.game.playersPlayAgain).forEach(((playerID) => {
			let playerPlayAgain = this.game.playersPlayAgain[playerID];
			playAgain = playAgain && playerPlayAgain;
		}));

		return playAgain;
	}

	async saveUser(user) {
		try {
			await user.save();
		}
		catch (err) {
			console.log("Save user error: ", err);
		}
	}

	async saveGame() {
		try {
			await this.game.save();
			return true;
		}
		catch (err) {
			console.log("Update game error: ", err);
			// this.socket.emit('player error', "Server error, please try again.");
			return false;
		}
	}
}

module.exports = Game;