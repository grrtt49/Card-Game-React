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

	socket.on('get available requests', async (userInfo, callback) => {
		try {
			let authUser = await authenticate(userInfo, player, socket, io);
			if(authUser !== true && authUser.user === undefined) {
				console.log("Not authorized: ", authUser.user);
				return;
			}
			else if (authUser !== true){
				player = authUser;
			}
			callback(await lobby.getActiveRequests());
		}
		catch (err) {
			handleError(err, socket);
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
			handleError(err, socket);
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
			console.log("Getting request: ", player.getCurrentRequestID());
			const request = await lobby.getRequest(player.getCurrentRequestID());
			let clientRequest = {
				players: [],
				isCreator: false,
				isError: true,
			};
			if(request && request.request) {
				clientRequest = {
					players: request.request.players,
					isCreator: request.request.creator.id == player.id(),
					isError: false,
				}
			}
			io.to(player.socket.id).emit('updated request', clientRequest);
		}
		catch (err) {
			handleError(err, socket);
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
			console.log("Joining request: ", player.id(), requestID);
			await lobby.joinRequestFromPlayer(io, player, requestID);
		}
		catch (err) {
			handleError(err, socket);
		}
	});

	socket.on('remove current request', async (userInfo) => {
		try {
			let authUser = await authenticate(userInfo, player, socket, io);
			if(authUser !== true && authUser.user === undefined) {
				console.log("Not authorized: ", authUser.user);
				return;
			}
			else if (authUser !== true){
				player = authUser;
			}
			await lobby.removeCurrentRequest(io, player);
		}
		catch (err) {
			handleError(err, socket);
		}
	});

	socket.on('start game', async (userInfo) => {
		try {
			let authUser = await authenticate(userInfo, player, socket, io);
			if(authUser !== true && authUser.user === undefined) {
				console.log("Not authorized: ", authUser.user);
				return;
			}
			else if (authUser !== true){
				player = authUser;
			}
			await lobby.startGame(io, player);
		}
		catch (err) {
			handleError(err, socket);
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
			handleError(err, socket);
		}
	});

	socket.on('try playing card', async (userInfo, cardID, color="") => {
		try {
			let authUser = await authenticate(userInfo, player, socket, io);
			if(authUser !== true && authUser.user === undefined) {
				console.log("Not authorized: ", authUser.user);
				return;
			}
			else if (authUser !== true){
				player = authUser;
			}
			await lobby.tryPlayingCard(io, player, cardID, color);
		}
		catch (err) {
			handleError(err, socket);
		}
	});

	socket.on('end turn', async (userInfo) => {
		try {
			let authUser = await authenticate(userInfo, player, socket, io);
			if(authUser !== true && authUser.user === undefined) {
				console.log("Not authorized: ", authUser.user);
				return;
			}
			else if (authUser !== true){
				player = authUser;
			}
			await lobby.endTurn(io, player);
		}
		catch (err) {
			handleError(err, socket);
		}
	});

	socket.on('send message', async (userInfo, message) => {
		try {
			let authUser = await authenticate(userInfo, player, socket, io);
			if(authUser !== true && authUser.user === undefined) {
				console.log("Not authorized: ", authUser.user);
				return;
			}
			else if (authUser !== true){
				player = authUser;
			}
			lobby.sendMessage(io, player, message);
		}
		catch (err) {
			handleError(err, socket);
		}
	});

	socket.on('left current game', async (userInfo) => {
		try {
			let authUser = await authenticate(userInfo, player, socket, io);
			if(authUser !== true && authUser.user === undefined) {
				console.log("Not authorized: ", authUser.user);
				return;
			}
			else if (authUser !== true){
				player = authUser;
			}

			await lobby.removePlayerFromGame(io, player);
		}
		catch (err) {
			handleError(err, socket);
		}
	});

	socket.on('set settings', async (userInfo, settings) => {
		console.log("Set settings");
		try {
			let authUser = await authenticate(userInfo, player, socket, io);
			if(authUser !== true && authUser.user === undefined) {
				console.log("Not authorized: ", authUser.user);
				return;
			}
			else if (authUser !== true){
				player = authUser;
			}

			player.user.settings.colorblindMode = settings.colorblindMode === true;
			await mongooseController.saveUser(player.user);
			io.to(player.socket.id).emit('users', users);
		}
		catch(err) {
			handleError(err, socket);
		}
	});

	socket.on('sign up', async (nickname, password) => {
		console.log("Signing up");
		try {
			const success = await mongooseController.signUp(nickname, password, socket);
			if(success !== false) {
				player = new Player(success.user, io);
				io.to(player.socket.id).emit('signed up', success.client);
			}
		}
		catch(err) {
			handleError(err, socket);
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
			io.to(player.socket.id).emit('signed in', {nickname: user.nickname, token: user.token});
		}
		catch(err) {
			handleError(err, socket);
		}
	});

	socket.on('sign in token', async (userInfo) => {
		console.log("Signing in with token");
		try {
			let sendNotification = (!player || socket.id != player.socket.id);

			let authUser = await authenticate(userInfo, player, socket, io);
			if(authUser !== true && authUser.user === undefined) {
				console.log("Not authorized: ", authUser.user);
				return;
			}
			else if (authUser !== true){
				player = authUser;
			}
			// Only send notification if user wasn't signed in before
			if(sendNotification) {
				io.to(player.socket.id).emit('signed in token', {nickname: player.user.nickname, token: player.user.token});
			}
		}
		catch(err) {
			handleError(err, socket);
		}
	});

	socket.on('get current state', async (userInfo) => {
		console.log("Getting state");
		try {
			let authUser = await authenticate(userInfo, player, socket, io);
			if(authUser !== true && authUser.user === undefined) {
				console.log("Not authorized: ", authUser.user);
				return;
			}
			else if (authUser !== true){
				player = authUser;
			}

			let playerState = "lobby";
			if(player.getCurrentRequestID()) {
				playerState = "request";
				player.socket.join('room' + player.getCurrentRequestID());
			}
			if(player.getCurrentGameID()) {
				playerState = "game";
				player.socket.join('game_room' + player.getCurrentGameID());
				console.log("Current game: ", player.getCurrentGameID());
			}

			console.log("Player in state: ", player.id(), playerState);
			io.to(player.socket.id).emit('current state', playerState);
		}
		catch(err) {
			handleError(err, socket);
		}
	});

	socket.on('play again', async (userInfo, isPlayingAgain) => {
		console.log("Play again");
		try {
			let authUser = await authenticate(userInfo, player, socket, io);
			if(authUser !== true && authUser.user === undefined) {
				console.log("Not authorized: ", authUser.user);
				return;
			}
			else if (authUser !== true){
				player = authUser;
			}

			await lobby.setPlayerPlayAgain(io, player, isPlayingAgain);
		}
		catch(err) {
			handleError(err, socket);
		}
	});

	socket.on('disconnect', async () => {
		// try {
		// 	if(player && player.getCurrentRequestID()) {
		// 		await lobby.removeCurrentRequest(io, player);
		// 	}
		// }
		// catch (err) {
		// 	handleError(err, socket);
		// }

		// try {
		// 	if(player && player.getCurrentGameID()) {
		// 		await lobby.removePlayerFromGame(io, player);
		// 	}
		// }
		// catch (err) {
		// 	handleError(err, socket);
		// }
	});
});

function handleError(err, socket) {
	console.error("Handling error: ", err);
	try {
		io.to(socket.id).emit("player error", "An unknown server error occurred.");
	}
	catch (err2) {
		console.error("Couldn't send error message: ", err2);
	}
}

async function authenticate (userInfo, player, socket, io) {
	if(!userInfo || !userInfo.nickname || !userInfo.token) {
		io.to(socket.id).emit('player error', 'Please log in and try again.');
		return false;
	}
	let user = await mongooseController.getUserFromToken(userInfo);
	user.socket = socket.id;
	await mongooseController.saveUser(user);
	let newPlayer = new Player(user, io);
	// console.log("Authenticated: ", newPlayer.user);
	return newPlayer;
}
