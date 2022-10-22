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

	takeTurn(playerIndex, cardIndex, color) {
		if (playerIndex != this.currentTurn) {
			console.log("Not your turn");
			return {success: false, msg: "It is not your turn"};
		}

		let playedCard = this.cards.playCardFromPlayer(playerIndex, cardIndex, color);
		if (!playedCard.success) {
			return playedCard;
		}
		if(playedCard.playedCard.drawAmount != null) {
			this.nextTurn();
			for (let i = 0; i < playedCard.playedCard.drawAmount; i++) {
				this.cards.drawCardForPlayer(this.currentTurn);
			}
		}
		if(playedCard.playedCard.number == "skip") {
			this.nextTurn();
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
		this.currentTurn = (this.currentTurn + 1) % this.numPlayers;
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
			};
			io.to(this.players[i].socket.id).emit(message, data);
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
}

module.exports = Game;