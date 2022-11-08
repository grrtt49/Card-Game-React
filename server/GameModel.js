const mongoose = require('mongoose');
const Cards = require('./Cards');
const Player = require('./Player');
const crypto = require("crypto");

class GameModel {
    constructor (socket) {
        this.socket = socket;

        mongoose.connect('mongodb://localhost:27017/test', {
            useUnifiedTopology: true,
            useNewUrlParser: true
        });

        const gameSchema = mongoose.Schema({
            gameID: String,
            cards: mongoose.Schema.Types.Mixed,
            currentTurn: Number,
            players: Array,
            numPlayers: Number,
            isReversed: Boolean,
            room: String,
        });

        gameSchema.virtual('id')
            .get(function() {
                return this._id.toHexString();
            });

        gameSchema.set('toJSON', {
            virtuals: true
        });

        this.Game = mongoose.model('Game', gameSchema);
    }

    async getGame(gameID) {
        try {
            let game = await this.Game.findOne({ gameID: gameID });
            return game;
        }
        catch (err) {
            console.log("Get game error: ", err);
            this.socket.emit('player error', "Server error, please try again.");
            return false;
        }
    }

    async remove(id) {
        try {
            const success = await this.Game.deleteOne({ requestID: id });
            return success;
        }
        catch (err) {
            console.log("Remove game error: ", err);
            this.socket.emit('player error', "Server error, please try again.");
            return false;
        }
    }

    async createGame(players, mongooseController, io) {
        try {
            console.log("Starting game for players: ", players);
            let cards = new Cards();
            let playersFromClass = await this.getMongoPlayers(players, mongooseController, io);
		    await cards.startGame(playersFromClass);

            let gameID = crypto.randomBytes(80).toString("hex");
            let game = new this.Game({
                gameID: gameID,
                cards: cards.getData(),
                currentTurn: 0,
                players: players,
                numPlayers: players.length,
                isReversed: false,
                room: 'game_room' + gameID, 
            });

            const insertedGame = await game.save();
            return insertedGame;
        }
        catch (err) {
            console.log("Create game error: ", err);
            this.socket.emit('player error', "Server error, please try again.");
            return false;
        }
    }

    async getMongoPlayers(players, mongooseController, io) {
        try {
            let ids = [];
            for (let i = 0; i < players.length; i++) {
                ids.push(mongoose.Types.ObjectId(players[i].id));
            }
            // console.log("ids: ", ids);
            const mongoPlayers = await mongooseController.User.find({ _id: {$in: ids} });
            // console.log("Mongo players: ", mongoPlayers);

            let playersFromClass = [];
            for (let i = 0; i < mongoPlayers.length; i++) {
                playersFromClass.push(new Player(mongoPlayers[i], io));
            }
            return playersFromClass;
        }
        catch (err) {
            console.log("Get mongo players error: ", err);
        }
    }
}

module.exports = GameModel;