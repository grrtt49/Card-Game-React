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
	}

	takeTurn(playerIndex, cardIndex, color) {
		if (playerIndex != this.game.currentTurn) {
			console.log("Not your turn");
			return {success: false, msg: "It is not your turn"};
		}

		let playedCard = this.game.cards.playCardFromPlayer(playerIndex, cardIndex, color);
		if (!playedCard.success) {
			return playedCard;
		}

		if(playedCard.playedCard.number == "skip") {
			this.game.nextTurn();
		}
		else if(playedCard.playedCard.number == "reverse") {
			this.game.isReversed = !this.game.isReversed;
		}

		if(playedCard.playedCard.drawAmount != null) {
			this.nextTurn();
			for (let i = 0; i < playedCard.playedCard.drawAmount; i++) {
				this.game.cards.drawCardForPlayer(this.game.currentTurn);
			}
		}

		this.nextTurn();
		return playedCard;
	}

	endTurnForPlayer(playerIndex) {
		if (playerIndex != this.currentTurn) {
			console.log("Not your turn");
			return false;
		}
		this.game.cards.drawCardForPlayer(playerIndex);
		this.nextTurn();
	}

	async nextTurn() {
		this.game.currentTurn = (this.game.currentTurn + (!this.game.isReversed ? 1 : (this.game.numPlayers - 1))) % this.game.numPlayers;
		await this.saveGame();
	}

	sendDataToPlayers(io, message = "game data") {
		let playerTurnData = [];
		for (let i = 0; i < this.game.players.length; i++) {
			playerTurnData.push({
				name: this.game.players[i].getNickname(),
				isCurrent: this.game.currentTurn == i,
				numCards: Object.keys(this.game.cards.hands[i]).length,
			}); 
		}

		for (let i = 0; i < this.game.players.length; i++) {
			let data = {
				playerCards: this.game.cards.hands[i],
				currentTurn: this.game.currentTurn,
				topCard: this.game.cards.getTopCard(),
				playerTurnData: playerTurnData,
				isTurn: this.game.currentTurn == i,
				isReversed: this.game.isReversed,
			};
			io.to(this.game.players[i].socket.id).emit(message, data);
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

	sendGameOverToPlayers(io) {
		let playerTurnData = [];
		for (let i = 0; i < this.game.players.length; i++) {
			playerTurnData.push({
				name: this.game.players[i].getNickname(),
				numCards: Object.keys(this.game.cards.hands[i]).length,
			});
		}

		for (let i = 0; i < this.game.players.length; i++) {
			let data = {
				won: Object.keys(this.game.cards.hands[i]).length == 0,
				players: playerTurnData,
			};

			io.to(this.game.players[i].socket.id).emit("game over", data);
		}
	}

	async resetPlayersRequestId() {
		for (let i = 0; i < this.game.players.length; i++) {
			this.game.players[i].user.currentRequestID = null;
			await this.saveUser(this.game.players[i].user);
		}
	}

	getPlayerGameData(playerID) {
		let playerTurnData = [];
		for (let i = 0; i < this.game.players.length; i++) {
			playerTurnData.push({
				name: this.game.players[i].getNickname(),
				isCurrent: this.game.currentTurn == i,
				numCards: Object.keys(this.game.cards.hands[i]).length,
			});
		}

		return {
			playerCards: this.game.cards.hands[playerID],
			currentTurn: this.game.currentTurn,
			topCard: this.game.cards.getTopCard(),
			playerTurnData: playerTurnData,
			isTurn: this.game.currentTurn == playerID,
			isReversed: this.game.isReversed,
		};
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
		for (let i = 0; i < this.game.players.length; i++) {
			if(player.id() == this.game.players[i].id) {
				this.game.players[i].user.currentGameID = null;
				await this.saveUser(this.game.players[i].user);
				this.game.players.splice(i, 1);
				await this.saveGame();
				break;
			}
		}
	}

	async removeAllPlayers() {
		for (let i = 0; i < this.game.players.length; i++) {
				await this.mongooseController.updateUser(this.game.players[i].user, "currentGameID", null);
		}
		this.game.players = [];
		await this.saveGame();
	}

	async saveUser(user) {
		try {
			user.save();
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
			this.socket.emit('player error', "Server error, please try again.");
			return false;
		}
	}
}

module.exports = Game;