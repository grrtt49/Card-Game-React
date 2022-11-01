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
		try {
			callback(lobby.getActiveRequests());
		}
		catch (err) {
			handleError(err, player);
		}
	});

	socket.on('set nickname', (name, callback) => {
		try {
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
		}
		catch (err) {
			handleError(err, player);
		}
	});

	socket.on('create request', (callback) => {
		try {
			let request = lobby.createRequestForPlayer(io, player);
			callback(request);
		}
		catch (err) {
			handleError(err, player);
		}
	});

	socket.on('get current request', () => {
		try {
			io.emit('updated request', lobby.getRequest(player.currentRequestID));
		}
		catch (err) {
			handleError(err, player);
		}
	});

	socket.on('join request', (requestID) => {
		try {
			lobby.joinRequestFromPlayer(io, player, requestID);
		}
		catch (err) {
			handleError(err, player);
		}
	});

	socket.on('remove current request', () => {
		try {
			lobby.removeCurrentRequest(io, player);
		}
		catch (err) {
			handleError(err, player);
		}
	});

	socket.on('start game', () => {
		try {
			lobby.startGame(io, player);
		}
		catch (err) {
			handleError(err, player);
		}
	});

	socket.on('get game data', () => {
		try {
			lobby.getGameData(io, player);
		}
		catch (err) {
			handleError(err, player);
		}
	});

	socket.on('try playing card', (cardID, color="") => {
		try {
			let success = lobby.tryPlayingCard(io, player, cardID, color);
		}
		catch (err) {
			handleError(err, player);
		}
	});

	socket.on('end turn', () => {
		try {
			lobby.endTurn(io, player);
		}
		catch (err) {
			handleError(err, player);
		}
	});

	socket.on('send message', (message) => {
		try {
			lobby.sendMessage(io, player, message);
		}
		catch (err) {
			handleError(err, player);
		}
	});

	socket.on('left current game', () => {
		try {
			if(player.currentRequestID != null) {
				lobby.removeCurrentRequest(io, player);
			}

			if(player.currentGameID != null) {
				lobby.removePlayerFromGame(io, player);
			}
		}
		catch (err) {
			handleError(err, player);
		}
	});

	socket.on('disconnect', function() {
		try {
			socket.emit("error", "test");

			if(player.currentRequestID != null) {
				lobby.removeCurrentRequest(io, player);
			}

			if(player.currentGameID != null) {
				lobby.removePlayerFromGame(io, player);
			}
		}
		catch (err) {
			handleError(err, player);
		}
	});
});

function handleError(err, player) {
	console.log("Handling error: ", err);
	try {
		io.to(player.socket.id).emit("player error", "An unknown server error occurred.");
	}
	catch (err2) {
		console.log("Couldn't send error message: ", err2);
	}
}

