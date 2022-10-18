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
	console.log("Player connected");
	var player = new Player(socket);

	socket.on('joined lobby', () => {
		io.to(player.socket.id).emit('available requests', lobby.getActiveRequests());
	});

	socket.on('set nickname', (name) => {
		player.nickname = name;
	});

	socket.on('create request', () => {
		lobby.createRequestForPlayer(io, player);
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

	socket.on('try playing card', (cardID, callback) => {
		let data = lobby.tryPlayingCard(io, player, cardID);
		callback({
			success: data.success,
			gameData: data.gameData,
		});
	});
});

