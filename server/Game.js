const Cards = require('./Cards');
const Player = require('./Player');

class Game {
	cards;
	currentTurn;
	players;
	numPlayers;

	/**
	 * 
	 * @param {[Player]} players 
	 */
	constructor(players) {
		this.cards = new Cards();
		this.cards.startGame(players);
		this.players = players;
		this.numPlayers = players.length;
		this.currentTurn = 0;
		this.isReversed = false;
	}

	takeTurn(playerIndex, cardIndex, color) {
		if (playerIndex != this.currentTurn) {
			console.log("Not your turn");
			return {success: false, msg: "It is not your turn"};
		}

		let playedCard = this.cards.playCardFromPlayer(playerIndex, cardIndex, color);
		if (!playedCard.success) {
			return playedCard;
		}

		if(playedCard.playedCard.number == "skip") {
			this.nextTurn();
		}
		else if(playedCard.playedCard.number == "reverse") {
			this.isReversed = !this.isReversed;
		}

		if(playedCard.playedCard.drawAmount != null) {
			this.nextTurn();
			for (let i = 0; i < playedCard.playedCard.drawAmount; i++) {
				this.cards.drawCardForPlayer(this.currentTurn);
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
		this.cards.drawCardForPlayer(playerIndex);
		this.nextTurn();
	}

	nextTurn() {
		this.currentTurn = (this.currentTurn + (!this.isReversed ? 1 : (this.numPlayers - 1))) % this.numPlayers;
	}

	sendDataToPlayers(io, message = "game data") {
		let playerTurnData = [];
		for (let i = 0; i < this.players.length; i++) {
			playerTurnData.push({
				name: this.players[i].nickname,
				isCurrent: this.currentTurn == i,
				numCards: Object.keys(this.cards.hands[i]).length,
			}); 
		}

		for (let i = 0; i < this.players.length; i++) {
			let data = {
				playerCards: this.cards.hands[i],
				currentTurn: this.currentTurn,
				topCard: this.cards.getTopCard(),
				playerTurnData: playerTurnData,
				isTurn: this.currentTurn == i,
				isReversed: this.isReversed,
			};
			io.to(this.players[i].socket.id).emit(message, data);
		}
	}

	isGameOver() {
		for(let i = 0; i < this.cards.hands.length; i++) {
			if(Object.keys(this.cards.hands[i]).length <= 0) {
				return true;
			}
		}
		return false;
	}

	sendGameOverToPlayers(io) {
		let playerTurnData = [];
		for (let i = 0; i < this.players.length; i++) {
			playerTurnData.push({
				name: this.players[i].nickname,
				numCards: Object.keys(this.cards.hands[i]).length,
			});
		}

		for (let i = 0; i < this.players.length; i++) {
			let data = {
				won: Object.keys(this.cards.hands[i]).length == 0,
				players: playerTurnData,
			};

			io.to(this.players[i].socket.id).emit("game over", data);
		}
	}

	resetPlayersRequestId() {
		for (let i = 0; i < this.players.length; i++) {
			this.players[i].currentRequestID = null;
		}
	}

	getPlayerGameData(playerID) {
		let playerTurnData = [];
		for (let i = 0; i < this.players.length; i++) {
			playerTurnData.push({
				name: this.players[i].nickname,
				isCurrent: this.currentTurn == i,
				numCards: Object.keys(this.cards.hands[i]).length,
			});
		}

		return {
			playerCards: this.cards.hands[playerID],
			currentTurn: this.currentTurn,
			topCard: this.cards.getTopCard(),
			playerTurnData: playerTurnData,
			isTurn: this.currentTurn == playerID,
			isReversed: this.isReversed,
		};
	}

	sendMessageToPlayers(io, player, text) {
		for (let i = 0; i < this.players.length; i++) {
			let fromSelf = false;
			if(this.players[i].id == player.id) {
				fromSelf = true;
			}

			let message = {
				text: text,
				from: player.nickname,
				fromSelf: fromSelf,
			};
			io.to(this.players[i].socket.id).emit("new message", message);
			console.log("Sent message: ", message);
		}
	}

	/**
	 * 
	 * @param {Player} player 
	 */
	removePlayer(player) {
		for (let i = 0; i < this.players.length; i++) {
			if(player.id == this.players[i].id) {
				this.players[i].currentGameID = null;
				this.players.splice(i, 1);
				break;
			}
		}
	}

	removeAllPlayers() {
		for (let i = 0; i < this.players.length; i++) {
			this.players[i].currentGameID = null;
		}
		this.players = [];
	}
}

module.exports = Game;