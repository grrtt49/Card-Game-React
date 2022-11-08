const Player = require('./Player.js');
const LobbyController = require('./LobbyController');
const MongooseController = require('./MongooseController');

const http = require("http");
const crypto = require("crypto");
const express = require("express");
const socketio = require("socket.io");
const path = require("path");
const cors = require("cors");
const GameModel = require('./GameModel.js');
const RequestModel = require('./RequestModel.js');

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

const mongooseController = new MongooseController(io);
const gameModel = new GameModel(io);
const requestModel = new RequestModel(io);

let lobby = new LobbyController(mongooseController, gameModel, requestModel);

io.on('connection', (socket) => {
	console.log("Player connected: ", socket.id);
	var player = null;

	socket.on('get available requests', async (callback) => {
		try {
			callback(await lobby.getActiveRequests());
		}
		catch (err) {
			handleError(err, player);
		}
	});


	// let success = true;
	// if(name != "") {
	// 	player.nickname = name;
	// }
	// else {
	// 	io.to(player.socket.id).emit("player error", "Please enter a nickname");
	// 	success = false;
	// }
	// if(success && name.length > 20) {
	// 	io.to(player.socket.id).emit("player error", "Your nickname must be less than 20 characters");
	// 	success = false;
	// }
	// if(success && !/^\w+$/.test(name)) {
	// 	io.to(player.socket.id).emit("player error", "Your nickname can only include alphabet, number, and underscore characters");
	// 	success = false;
	// }

	socket.on('create request', async (userInfo) => {
		try {
			let authUser = await authenticate(userInfo, player, socket, io);
			if(authUser !== true && authUser.user === undefined) {
				console.log("Not authorized: ", authUser.user);
				return;
			}
			else if (authUser !== true){
				player = authUser;
			}
			// console.log("Validated user: ", authUser);
			let request = await lobby.createRequestForPlayer(io, player);
			io.to(player.socket.id).emit("created request", request);
		}
		catch (err) {
			handleError(err, player);
		}
	});

	socket.on('get current request', async (userInfo) => {
		try {
			let authUser = await authenticate(userInfo, player, socket, io);
			if(authUser !== true && authUser.user === undefined) {
				console.log("Not authorized: ", authUser.user);
				return;
			}
			else if (authUser !== true){
				player = authUser;
			}
			const request = await lobby.getRequest(player.getCurrentRequestID());
			// console.log("CURRENT REQUEST: ", request);
			io.emit('updated request', request);
		}
		catch (err) {
			handleError(err, player);
		}
	});

	socket.on('join request', async (requestID, userInfo) => {
		try {
			let authUser = await authenticate(userInfo, player, socket, io);
			if(authUser !== true && authUser.user === undefined) {
				console.log("Not authorized: ", authUser.user);
				return;
			}
			else if (authUser !== true){
				player = authUser;
			}
			await lobby.joinRequestFromPlayer(io, player, requestID);
		}
		catch (err) {
			handleError(err, player);
		}
	});

	socket.on('remove current request', async () => {
		try {
			await lobby.removeCurrentRequest(io, player);
		}
		catch (err) {
			handleError(err, player);
		}
	});

	socket.on('start game', async () => {
		try {
			await lobby.startGame(io, player);
		}
		catch (err) {
			handleError(err, player);
		}
	});

	socket.on('get game data', async (userInfo) => {
		try {
			let authUser = await authenticate(userInfo, player, socket, io);
			if(authUser !== true && authUser.user === undefined) {
				console.log("Not authorized: ", authUser.user);
				return;
			}
			else if (authUser !== true){
				player = authUser;
			}
			await lobby.getGameData(io, player);
		}
		catch (err) {
			handleError(err, player);
		}
	});

	socket.on('try playing card', (cardID, color="") => {
		try {
			lobby.tryPlayingCard(io, player, cardID, color);
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

	socket.on('left current game', async () => {
		try {
			if(player.currentRequestID != null) {
				await lobby.removeCurrentRequest(io, player);
			}

			if(player.currentGameID != null) {
				await lobby.removePlayerFromGame(io, player);
			}
		}
		catch (err) {
			handleError(err, player);
		}
	});

	socket.on('disconnect', async () => {
		try {
			if(player && player.getCurrentRequestID()) {
				await lobby.removeCurrentRequest(io, player);
			}
		}
		catch (err) {
			handleError(err, player);
		}

		try {
			if(player && player.getCurrentGameID()) {
				await lobby.removePlayerFromGame(io, player);
			}
		}
		catch (err) {
			handleError(err, player);
		}
	});

	socket.on('get users', async () => {
		console.log("Getting users");
		try {
			const users = await mongooseController.getUsers();
			io.to(player.socket.id).emit('users', users);
		}
		catch(err) {
			handleError(err, player);
		}
	});

	socket.on('sign up', async (nickname, password) => {
		console.log("Signing up");
		try {
			const success = await mongooseController.signUp(nickname, password, socket);
			player = new Player(success.user, io);
			io.to(player.socket.id).emit('signed up', success.client);
		}
		catch(err) {
			handleError(err, player);
		}
	});

	socket.on('sign in', async (nickname, password) => {
		console.log("Signing in");
		try {
			let user = await mongooseController.signIn(nickname, password);
			user.socket = socket.id;
			await mongooseController.saveUser(user);
			player = new Player(user, io);
			// set socket
			io.to(player.socket.id).emit('signed in', user);
		}
		catch(err) {
			handleError(err, player);
		}
	});
});

function handleError(err, player) {
	console.error("Handling error: ", err);
	try {
		io.to(player.socket.id).emit("player error", "An unknown server error occurred.");
	}
	catch (err2) {
		console.error("Couldn't send error message: ", err2);
	}
}

async function authenticate (userInfo, player, socket, io) {
	//TODO: need to update every time? :(
	// if(player && player.user) return true;

	let user = await mongooseController.getUserFromToken(userInfo);
	user.socket = socket.id;
	await mongooseController.saveUser(user);
	let newPlayer = new Player(user, io);
	// console.log("Authenticated: ", newPlayer.user);
	return newPlayer;
}
