class FixedList {
	games;

	constructor(numGames) {
		this.initGames(numGames);
	}

	initGames(numGames) {
		this.games = new Array(numGames);
	}

	create(game) {
		for (var i = 0; i < this.games.length; i++) {
			if (this.games[i] == null) {
				this.games[i] = game;
				game.id = i;
				return i;
			}
		}
		return null;
	}

	remove(gameID) {
		this.games[gameID] = null;
	}

	get(gameID) {
		return this.games[gameID];
	}

	getActive() {
		var activeGames = [];
		for (let i = 0; i < this.games.length; i++) {
			if (this.games[i] != null) {
				activeGames.push(this.games[i]);
			}
		}
		return activeGames;
	}
}

module.exports = FixedList;