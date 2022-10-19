const Cards = require('./Cards');

class Game {
	cards;
	currentTurn;
	players;
	numPlayers;

	constructor(players) {
		this.cards = new Cards();
		this.cards.startGame(players);
		this.players = players;
		this.numPlayers = players.length;
		this.currentTurn = 0;
	}

	takeTurn(playerIndex, cardIndex) {
		if (playerIndex != this.currentTurn) {
			console.log("Not your turn");
			return false;
		}

		let success = this.cards.playCardFromPlayer(playerIndex, cardIndex);
		if (!success) {
			return false;
		}
		this.nextTurn();
		return success;
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
		this.currentTurn = (this.currentTurn + 1) % this.numPlayers;
	}

	sendDataToPlayers(io, message = "game data") {
		let numberOfCards = {};
		for (let i = 0; i < this.players.length; i++) {
			numberOfCards[i] = this.cards.hands[i].length;
		}

		for (let i = 0; i < this.players.length; i++) {
			let data = {
				playerCards: this.cards.hands[i],
				numberOfCards: numberOfCards,
				currentTurn: this.currentTurn,
				topCard: this.cards.getTopCard(),
			};
			io.to(this.players[i].socket.id).emit(message, data);
		}
	}

	getPlayerGameData(playerID) {
		let numberOfCards = {};
		for (let i = 0; i < this.players.length; i++) {
			numberOfCards[i] = this.cards.hands[i].length;
		}

		return {
			playerCards: this.cards.hands[playerID],
			numberOfCards: numberOfCards,
			currentTurn: this.currentTurn,
			topCard: this.cards.getTopCard(),
		};
	}
}

module.exports = Game;