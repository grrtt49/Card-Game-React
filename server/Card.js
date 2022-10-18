class Card {
	number;
	color;
	drawAmount;

	constructor(number, color, drawAmount = null) {
		this.number = number;
		this.color = color;
		this.drawAmount = drawAmount;
	}

}

module.exports = Card;