const Card = require('./Card');

class Cards {
	currentDeck;
	discardPile;
	allCards;
	hands;

	constructor(cardsData) {
		if(cardsData === undefined) {
			this.discardPile = [];
			this.allCards = [];
			this.currentDeck = [];
			this.generateAllCards();
		}
		else {
			this.discardPile = cardsData.discardPile;
			this.allCards = cardsData.allCards;
			this.currentDeck = cardsData.currentDeck;
			this.hands = cardsData.hands;
		}
	}

	getData() {
		return {
			discardPile: this.discardPile,
			allCards: this.allCards,
			currentDeck: this.currentDeck,
			hands: this.hands,
		}
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

	async startGame(players) {
		this.shuffle(players);
		this.hands = [];
		for (let i = 0; i < players.length; i++) {
			players[i].user.gamePlayerID = i;
			try {
				await players[i].user.save();
				console.log("Set user player id", players[i].user.nickname, players[i].user.gamePlayerID);
			}
			catch (err) {
				console.log("Start game error: ", err);
			}
			this.hands.push({});
		}
		this.resetDeck();
		this.dealCards();
		let failedCards = [];
		let nextCard = this.getNextCard();
		while(nextCard.color == "black") {
			failedCards.push(nextCard);
			nextCard = this.getNextCard();
			console.log("Skipped wild as start...");
		}
		this.currentDeck = [...failedCards, ...this.currentDeck];
		this.discardPile.push(nextCard);
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

	//change to pick up discard pile when empty
	getNextCard() {
		if (this.currentDeck.length == 0) {
			this.resetDeck();
		}
		return this.currentDeck.pop();
	}

	drawCardForPlayer(playerIndex) {
		let keys = Object.keys(this.hands[playerIndex]).sort().reverse();
		let index = 0;
		if(keys.length > 0) {
			if(!isNaN(parseInt(keys[0]))) {
				index = parseInt(keys[0]) + 1;
			}
			else {
				index = keys[0] + 1;
			}
		}
		this.hands[playerIndex][index] = this.getNextCard();
	}

	playCardFromPlayer(handIndex, cardIndex, color) {
		if (handIndex >= this.hands.length || this.hands[handIndex][cardIndex] == null || this.hands[handIndex][cardIndex] == undefined) {
			console.log("Card / hand index not found");
			return {success: false, msg: "Card not found"};
		}
		console.log("Trying to play card: ", handIndex, this.hands[handIndex][cardIndex]);
		let didPlayCard = this.playCard(this.hands[handIndex][cardIndex], color);
		if (didPlayCard.success) {
			let playedCard = this.hands[handIndex][cardIndex];
			delete this.hands[handIndex][cardIndex];
			didPlayCard.playedCard = playedCard;
		}
		return didPlayCard;
	}

	playCard(card, color="") {
		if (!this.canPlayCard(card)) {
			return {success:false, msg:"You cannot play that card right now"};
		}
		if(card.color == "black") {
			if(color == "") {
				console.log("Wild card has no new color assigned");
				return {success:false, msg:"Choose a color for the wild card"};
			}
			
			card.wildColor = color;
		}
		this.discardPile.push(card);
		return {success:true};
	}

	getTopCard() {
		return this.discardPile[this.discardPile.length - 1];
	}

	canPlayCard(card) {
		let lastCard = this.getTopCard();
		if (card.color == "black" ||
			card.color == lastCard.color ||
			(lastCard.hasOwnProperty("wildColor") && card.color == lastCard.wildColor) ||
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