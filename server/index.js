const Player = require('./Player.js');
const LobbyController = require('./LobbyController');

const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const path = require("path");
const cors = require("cors");

const app = express();

app.use(cors());

const httpserver = http.Server(app);
const io = socketio(httpserver, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
    },
}); 

const gamedirectory = path.join(__dirname, "public");

app.use(express.static(gamedirectory));

httpserver.listen(3001, function() {
    console.log("Listening on port 3001");
});

let lobby = new LobbyController();

io.on('connection', (socket) => {
	console.log("Player connected: ", socket.id);
	var player = new Player(socket);

	socket.on('get available requests', (callback) => {
		callback(lobby.getActiveRequests());
	});

	socket.on('set nickname', (name, callback) => {
		let success = true;
		if(name != "") {
			player.nickname = name;
		}
		else {
			io.to(player.socket.id).emit("player error", "Please enter a nickname");
			success = false;
		}
		if(success && name.length > 20) {
			io.to(player.socket.id).emit("player error", "Your nickname must be less than 20 characters");
			success = false;
		}
		if(success && !/^\w+$/.test(name)) {
			io.to(player.socket.id).emit("player error", "Your nickname can only include alphabet, number, and underscore characters");
			success = false;
		}
		console.log("set nickname success? ", (success ? "true" : "false"));
		callback(success);
	});

	socket.on('create request', (callback) => {
		let request = lobby.createRequestForPlayer(io, player);
		callback(request);
	});

	socket.on('get current request', () => {
		io.emit('updated request', lobby.getRequest(player.currentRequestID));
	});

	socket.on('join request', (requestID) => {
		lobby.joinRequestFromPlayer(io, player, requestID);
	});

	socket.on('remove current request', () => {
		lobby.removeCurrentRequest(io, player);
	});

	socket.on('start game', () => {
		lobby.startGame(io, player);
	});

	socket.on('get game data', () => {
		lobby.getGameData(io, player);
	});

	socket.on('try playing card', (cardID, color="") => {
		let success = lobby.tryPlayingCard(io, player, cardID, color);
	});

	socket.on('end turn', () => {
		lobby.endTurn(io, player);
	});

	socket.on('send message', (message) => {
		lobby.sendMessage(io, player, message);
	});

	socket.on('left current game', () => {
		if(player.currentRequestID != null) {
			lobby.removeCurrentRequest(io, player);
		}

		if(player.currentGameID != null) {
			lobby.removePlayerFromGame(io, player);
		}
	});

	socket.on('disconnect', function() {
		console.log('Player disconnected');

		if(player.currentRequestID != null) {
			lobby.removeCurrentRequest(io, player);
		}

		if(player.currentGameID != null) {
			lobby.removePlayerFromGame(io, player);
		}
	 });
});

