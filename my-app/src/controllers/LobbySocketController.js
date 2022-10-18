class LobbySocketController {
	socket;
	gameRequests;

	constructor() {
		this.socket = io.connect(window.location.origin);
		this.gameRequests = [];
		this.initSocket();
	}

	initSocket() {
		this.socket.emit('joined lobby');

		this.socket.on('available requests', function(games) {
			console.log("Requests: ", games);
			this.gameRequests = games;
			this.drawGameRequests();
		}.bind(this));

		this.socket.on('new available request', function(game) {
			console.log("New Game: ", game);
			this.addGame(game);
			this.drawGameRequests();
		}.bind(this));

		this.socket.on('successful create', function(game) {
			console.log("Game creation successful", game);
			this.updateJoinedPlayers(game.players);
			showCreateGame();
		}.bind(this));

		this.socket.on('unsuccessful create', function() {
			console.log("Game creation unsuccessful");
		}.bind(this));

		this.socket.on('successful join', function(game) {
			console.log("Joined successfully", game);
			this.updateJoinedPlayers(game.players);
			showCreateGame();
		}.bind(this));

		this.socket.on('unsuccessful join', function() {
			console.log("Joined unsuccessfully");
		}.bind(this));

		this.socket.on('remove available request', function(game) {
			console.log("Removing request", game);
			this.removeGame(game);
			this.drawGameRequests();
		}.bind(this));

		this.socket.on('updated request', function(game) {
			console.log("Updating request", game);
			this.updateGame(game);
			this.updateJoinedPlayers(game.players);
		}.bind(this));

		this.socket.on('creator cancelled request', function(game) {
			console.log("Game cancelled", game);
			backToLobbyButtons();
		}.bind(this));

		this.socket.on('game started', function(gameData) {
			console.log("Game started: ", gameData);
			showGame();
			drawCards(gameData.playerCards, gameData.topCard);
		}.bind(this));
	}

	addGame(game) {
		this.gameRequests.push(game);
	}

	removeGame(game) {
		for (let i = 0; i < this.gameRequests.length; i++) {
			if (this.gameRequests[i].id == game.id) {
				this.gameRequests.splice(i, 1);
				return;
			}
		}
	}

	updateGame(game) {
		for (let i = 0; i < this.gameRequests.length; i++) {
			if (this.gameRequests[i].id == game.id) {
				this.gameRequests[i] = game;
				return;
			}
		}
	}

	drawGameRequests() {
		var html = "";
		for (let i = 0; i < this.gameRequests.length; i++) {
			html += this.getGameHTML(this.gameRequests[i]);
		}
		$("#available-games-container").html(html);
	}

	getGameHTML(game) {
		return "<div class='game-request-container'>" + game.creator.nickname +
			"<p>" + game.num_players + " / 4 Players</p>" +
			"<div class='join-game-button' onclick='joinGame(" + game.id + ")'>Join</div>" +
			"</div>";
	}

	createGame() {
		this.socket.emit('create request');
	}

	joinGame(id) {
		this.socket.emit('join request', id);
	}

	removeCurrentRequest() {
		this.socket.emit('remove current request');
	}

	setNickname(name) {
		if (name == "") return false;
		this.socket.emit('set nickname', name);
		return true;
	}

	updateJoinedPlayers(players) {
		let str = "<div class='joined-players-container'>";
		str += "<p>Joined Players: </p>";
		for (let i = 0; i < players.length; i++) {
			str += this.joinedPlayerContainer(players[i]);
		}
		str += "</div>";

		$(".joined-players").html(str);
	}

	joinedPlayerContainer(player) {
		return "<div class='joined-player'>" + player.nickname + "</div>";
	}

	creatorStartGame() {
		this.socket.emit("start game");
	}
}

function showCreateGame() {
	$("#create-game-display").show();
	$("#join-game-display").hide();
	$("#lobby-buttons").hide();
}

function backToLobbyButtons() {
	$("#join-game-display").hide();
	$("#create-game-display").hide();
	$("#lobby-buttons").show();
}

function showGame() {
	$("#join-game-display").hide();
	$("#create-game-display").hide();
	$("#lobby-buttons").hide();
	$("#game-display").css('display', 'flex');
}