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
		if(name != "") {
			player.nickname = name;
		}
		console.log("set nickname success? ", (name != "" ? "true" : "false"));
		callback(name != "");
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

	socket.on('try playing card', (cardID) => {
		let success = lobby.tryPlayingCard(io, player, cardID);
	});

	socket.on('end turn', () => {
		lobby.endTurn(io, player);
	});
});

