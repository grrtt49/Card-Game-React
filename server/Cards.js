const Card = require('./Card');

class Cards {
	currentDeck;
	discardPile;
	allCards;
	hands;

	constructor() {
		this.discardPile = [];
		this.allCards = [];
		this.currentDeck = [];
		this.generateAllCards();
	}

	generateAllCards() {
		this.allCards = [];
		for (let i = 0; i <= 9; i++) {
			this.allCards.push(new Card(i, "red"));
			this.allCards.push(new Card(i, "yellow"));
			this.allCards.push(new Card(i, "blue"));
			this.allCards.push(new Card(i, "green"));
		}
		for (let i = 1; i <= 9; i++) {
			this.allCards.push(new Card(i, "red"));
			this.allCards.push(new Card(i, "yellow"));
			this.allCards.push(new Card(i, "blue"));
			this.allCards.push(new Card(i, "green"));
		}
		for (let i = 0; i < 2; i++) {
			this.allCards.push(new Card("skip", "red"));
			this.allCards.push(new Card("skip", "yellow"));
			this.allCards.push(new Card("skip", "blue"));
			this.allCards.push(new Card("skip", "green"));
			this.allCards.push(new Card("reverse", "red"));
			this.allCards.push(new Card("reverse", "yellow"));
			this.allCards.push(new Card("reverse", "blue"));
			this.allCards.push(new Card("reverse", "green"));
			this.allCards.push(new Card("draw 2", "red", 2));
			this.allCards.push(new Card("draw 2", "yellow", 2));
			this.allCards.push(new Card("draw 2", "blue", 2));
			this.allCards.push(new Card("draw 2", "green", 2));
		}
		for (let i = 0; i < 4; i++) {
			this.allCards.push(new Card("wild", "black"));
		}
		for (let i = 0; i < 4; i++) {
			this.allCards.push(new Card("draw 4", "black", 4));
		}
	}

	startGame(players) {
		this.hands = [];
		for (let i = 0; i < players.length; i++) {
			players[i].gamePlayerID = i;
			this.hands.push([]);
		}
		this.resetDeck();
		this.dealCards();
		this.discardPile.push(this.getNextCard());
	}

	dealCards() {
		for (let i = 0; i < 7; i++) {
			for (let h = 0; h < this.hands.length; h++) {
				this.hands[h][i] = this.getNextCard();
			}
		}
	}

	resetDeck() {
		this.currentDeck = [...this.allCards];
		this.shuffle(this.currentDeck);
	}

	//change to pick up discard pile
	getNextCard() {
		if (this.currentDeck.length == 0) {
			this.resetDeck();
		}
		return this.currentDeck.pop();
	}

	playCardFromPlayer(handIndex, cardIndex) {
		if (handIndex >= this.hands.length || this.hands[handIndex][cardIndex] == null || this.hands[handIndex][cardIndex] == undefined) {
			console.log("Card / hand index not found");
			return false;
		}
		let playedCard = this.playCard(this.hands[handIndex][cardIndex]);
		if (playedCard) {
			delete this.hands[handIndex][cardIndex];
		}
		return playedCard;
	}

	playCard(card) {
		if (!this.canPlayCard(card)) {
			console.log("Card not playable");
			return false;
		}
		this.discardPile.push(card);
		return true;
	}

	getTopCard() {
		return this.discardPile[this.discardPile.length - 1];
	}

	canPlayCard(card) {
		let lastCard = this.getTopCard();
		if (card.color == "black" ||
			card.color == lastCard.color ||
			card.number == lastCard.number) {
			return true;
		}
		return false;
	}

	shuffle(array) {
		let currentIndex = array.length, randomIndex;

		// While there remain elements to shuffle.
		while (currentIndex != 0) {

			// Pick a remaining element.
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex--;

			// And swap it with the current element.
			[array[currentIndex], array[randomIndex]] = [
				array[randomIndex], array[currentIndex]];
		}

		return array;
	}
}

module.exports = Cards;