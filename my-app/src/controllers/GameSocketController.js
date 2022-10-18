class GameSocketController {
	socket;

	constructor(socket) {
		this.socket = socket;
		this.initSocket();
	}

	initSocket() {
		this.socket.on('card failed', function() {
			console.log("Card failed");
		}.bind(this));

		// this.socket.on('game data', function(gameData) {
		// 	console.log("New game data: ", gameData);
		// }.bind(this));
	}

	async tryPlayingCard(id) {
		console.log("Sending card data");
		let newData = await new Promise(resolve => this.socket.emit('try playing card', id, data => resolve(data)));
		console.log("success? ", newData.success);
		console.log("newData ", newData.gameData);
		if (newData.success) {
			//do something?
		}
		return newData;
	}

}