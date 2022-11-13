const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
const crypto = require("crypto");

class MongooseController {
    socket;

    constructor (socket) {
        this.socket = socket;

        mongoose.connect('mongodb://localhost:27017/test', {
            useUnifiedTopology: true,
            useNewUrlParser: true
        });

        const userSchema = mongoose.Schema({
            nickname: String,
            password: String,
            wins: Number, 
            losses: Number,
            token: String,
            tokenExpire: Date,
            currentGameID: String,
            currentRequestID: String,
            gamePlayerID: String,
            online: Boolean,
            socket: String,
            settings: {
                colorblindMode: Boolean,
            },
        });

        userSchema.virtual('id')
            .get(function() {
                return this._id.toHexString();
            });

        userSchema.set('toJSON', {
            virtuals: true
        });

        this.User = mongoose.model('User', userSchema);
    }

    async getUsers () {
        try {
            return await this.User.find();
        }
        catch (err) {
            console.log("get users error: ", err);
            return false;
        }
    }

    async signUp (nickname, password, socket) {
        try {
            const alreadyUser = await this.User.findOne({ nickname: nickname });
            if(alreadyUser) {
                this.socket.emit('player error', "Nickname is already taken");
                return false;
            }

            const salt = await bcrypt.genSalt();
            let hash = await bcrypt.hash(password, salt);

            const token = crypto.randomBytes(80).toString('hex');
            let user = new this.User({
                nickname: nickname,
                password: hash,
                wins: 0, 
                losses: 0,
                token: token,
                currentGameID: null,
                currentRequestID: null,
                gamePlayerID: null,
                online: true,
                socket: socket.id,
                settings: {
                    colorblindMode: false,
                },
            });

            const insertedUser = await user.save();

            return {client: {nickname:nickname, token:token}, user: insertedUser};
        }
        catch (err) {
            console.log("sign up error: ", err);
            this.socket.emit('player error', "Error signing up, please try again.");
            return false;
        }
    }

    async signIn (nickname, password, playerSocket) {
        try {
            let user = await this.User.findOne({ nickname: nickname });
            if(user) {
                const isValid = await bcrypt.compare(password, user.password);
                if(isValid) {
                    return user;
                }
                console.log("Password is not valid: ", password, user.password);
            }
            console.log("Nickname is not valid");
            this.socket.to(playerSocket.id).emit('player error', "Username or password is incorrect");
            return false;
        }
        catch (err) {
            console.log("Sign in error: ", err);
            this.socket.to(playerSocket.id).emit('player error', "Error signing in, please try again.");
            return false;
        }
    }

    async setNewTokenForUser(user) {
        try {
            if(user) {
                const token = crypto.randomBytes(80).toString('hex');;
                user.token = token;
                user.online = true;
                user.save();
                return token;
            }
            this.socket.emit('player error', "Authorization error, please try again.");
            return false;
        }
        catch (err) {
            console.log("Set token error: ", err);
            this.socket.emit('player error', "Authorization error, please try again.");
            return false;
        }
    }

    async getUserFromToken(userInfo) {
        try {
            const nickname = userInfo.nickname;
            const token = userInfo.token;
            const user = await this.User.findOne({ nickname: nickname, token: token });
            if(user) {
                return user;
            }
            this.socket.emit('player error', "Authorization error, please try again.");
            return false;
        }
        catch (err) {
            console.log("Set token error: ", err);
            this.socket.emit('player error', "Authorization error, please try again.");
            return false;
        }
    }

    async getUserFromId(id) {
        try {
            const user = await this.User.findById(id);
            if(user) {
                return user;
            }
            this.socket.emit('player error', "Authorization error, please try again.");
            return false;
        }
        catch (err) {
            console.log("Set token error: ", err);
            this.socket.emit('player error', "Authorization error, please try again.");
            return false;
        }
    }

    async updateUser(user, key, value) {
        try {
            // console.log(user);
            user[key] = value;
            await user.save();
            return true;
        }
        catch (err) {
            console.log("Change user error: ", err);
            this.socket.emit('player error', "Server error, please try again.");
            return false;
        }
    }

    async saveUser(user) {
        try {
            await user.save();
            return true;
        }
        catch (err) {
            console.log("Save user error: ", err);
            this.socket.emit('player error', "Server error, please try again.");
            return false;
        }
    }
}

module.exports = MongooseController;