const mongoose = require('mongoose');
const Player = require('./Player');
const crypto = require("crypto");

class RequestModel {

    constructor (socket) {
        this.socket = socket;

        mongoose.connect('mongodb://localhost:27017/test', {
            useUnifiedTopology: true,
            useNewUrlParser: true
        });

        const requestSchema = mongoose.Schema({
            creator: mongoose.Schema.Types.Mixed,
            players: Array,
            requestID: String,
        });

        requestSchema.virtual('id')
            .get(function() {
                return this._id.toHexString();
            });

        requestSchema.set('toJSON', {
            virtuals: true
        });

        this.Request = mongoose.model('Request', requestSchema);
    }

    async getRequest(requestID) {
        try {
            // console.log("Get request from ID: ", requestID);
            let request = await this.Request.findOne({ requestID: requestID });
            return request;
        }
        catch (err) {
            console.log("Get request error: ", err);
            this.socket.emit('player error', "Server error, please try again.");
            return false;
        }
    }

    async getActive() {
        try {
            const requests = await this.Request.find();
            return requests;
        }
        catch (err) {
            console.log("Get active request error: ", err);
            this.socket.emit('player error', "Server error, please try again.");
            return false;
        }
    }

    async remove(id) {
        try {
            const success = await this.Request.deleteOne({ requestID: id });
            return success;
        }
        catch (err) {
            console.log("Remove request error: ", err);
            this.socket.emit('player error', "Server error, please try again.");
            return false;
        }
    }

    async createRequest(player) {
        try {
            let request = new this.Request({
                creator: player.toJSON(),
                players: [player.toJSON()],
                requestID: crypto.randomBytes(80).toString("hex"),
            });

            const insertedRequest = await request.save();
            return insertedRequest;
        }
        catch (err) {
            console.log("Create request error: ", err);
            this.socket.emit('player error', "Server error, please try again.");
            return false;
        }
    }
}

module.exports = RequestModel;