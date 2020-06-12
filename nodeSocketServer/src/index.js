const express = require('express')
const app = express();
const path = require('path');

const http = require('http');
const server = http.Server(app);

const socketIO = require('socket.io');
const io = socketIO(server);

const fs = require('fs');

const port = process.env.PORT || 3000;

//list of users id
var usersId = [];
var socketList = [];
var userToSocket = new Map();
//key : user id current -> user id selected
var usersVoted = new Map();
//count id 
var id = 1;
var actualIndexOfUsersId;
var wordsToPlay;
var nombreTours;
var comptNombreTours = 1;
var firstPlayer;

const enumRole = {
	CIVIL: 'CIVIL',
	ESCROC: 'ESCROC'
}

function User(name, id) {
	this.id = id;
	this.name = name;
	this.avatar = 'https://api.adorable.io/avatars/' + Math.floor(Math.random() * 1000) + 1;
	this.score = 0;
	this.messages = [];
	this.vote = 0;
	this.role;
	this.secretWord;
}

//TODO path in variable and real path
app.use(express.static(path.join('D:/Did/socketDid/dist/socketDid')));

//TODO path in variable and real path
/*app.get('/', function(req,res) {
	res.sendFile('D:/Did/socketDid/src/index.html');
})*/

//Listen on each connection on app
io.on('connection', (socket) => {
	console.log('---- user connected to socket. Socket id : ' + socket.id + " ----\n");
	socketList.push(socket);

	//current user
	var me = null;
	//Listen disconnection for each user connected
	socket.on('disconnect', () => {
		console.log('---- user disconnected to socket. Socket Id : ' + socket.id + " ----\n");
		//if current user is already loged
		if (me != null) {
			console.log('---- user was loged. user to remove : ' + JSON.stringify(me) + " ----\n");
			io.emit('removeusrs', me);
			//remove user
			userToSocket.delete(me);
			usersId.splice(usersId.indexOf(me.id), 1);
		}
		//remove socket in socketList
		socketList.splice(socketList.findIndex(itemSocket => itemSocket.id == socket.id), 1);
	});

	//Listen on user loged step
	socket.on('loged', (data) => {
		//set an unique id to user
		me = new User(data, id);
		id++;
		console.log("---- user loged -> " + JSON.stringify(me) + "/ socketId -> " + socket.id + "\n");

		for (let [user, sock] of userToSocket) {
			console.log('already loged ' + JSON.stringify(user) + " ----\n");
			//send all users in map to this socket
			socket.emit('newusrs', user);
		}
		//persist user to socket
		userToSocket.set(me, socket);
		//Persist id of each player
		usersId.push(me.id);

		//send this us to all client
		io.emit('newusrs', me);
		//send user only for this socket
		socket.emit('yourUser', me);
	});

	//Client clicked ready to play
	socket.on('playReadyFromClient', (data) => {
		nombreTours = data;
		console.log("---- turns number : " + nombreTours + "\n");

		//Get first player id (random) 
		firstPlayer = defineFirstPlayer();
		console.log("---- first player id -> " + firstPlayer + "\n")
		io.emit('playReadyFromServeur', firstPlayer);

		//Define 2 words to play
		wordsToPlay = define2RandomWords(chooseWordsFromList());

		//get escroc user (random)
		var socketEscroc = defineEscrocUserSocket();

		for (let [keyUser, sock] of userToSocket) {
			if (sock.id == socketEscroc.id) {
				console.log("---- escroc is -> " + keyUser.name + "\n")
				sock.emit('secretWord', wordsToPlay[1]);
				updateRoleAndWord(keyUser, wordsToPlay[1], enumRole.ESCROC)
			} else {
				sock.emit('secretWord', wordsToPlay[0]);
				updateRoleAndWord(keyUser, wordsToPlay[0], enumRole.CIVIL)
			}
		}
	});

	//Fired when a client send a message
	socket.on('clientMessage', (data) => {
		updateMessageList(data.actualId, data.messageFromPreviousClient);
		var userActual = findUserById(data.actualId);
		console.log("-- message : " + userActual.messages + " from " + userActual.name + "\n");
		var message = { messageFromPreviousClient: data.messageFromPreviousClient, actualId: data.actualId };
		io.emit('serveurMessage', message);

		var playerIdNextToPlay = nextPlayerToPlay();
		io.emit('serveurIdNextToPlay', playerIdNextToPlay);
		if (playerIdNextToPlay == firstPlayer) {
			if (comptNombreTours == nombreTours) {
				io.emit('endTurn', "");
				comptNombreTours = 1;
			} else {
				comptNombreTours++;
			}
		}
	});

	//Fired when a client click on player to vote against him
	socket.on('userJustVoted', (data) => {
		console.log("\n---- " + findUserById(data.idVoter).name + ' has voted against ' + data.userVoted.name);
		usersVoted.set(data.idVoter, data.userVoted.id);
		updateVotesByUsers();
		io.emit('userVoted', Array.from(userToSocket.keys()));

		for (let [keyUser, sock] of userToSocket) {
			console.log("- user " + keyUser.name + " has " + keyUser.vote + " on him")
		}
		if (usersVoted.size == usersId.length) {
			endVoteFunction(usersVoted);
		}
	});
});

//Return an user if found
function findUserById(id) {
	for (let [keyUser, sock] of userToSocket) {
		if (keyUser.id == id) {
			return keyUser;
		}
	}
}

//Update vote on users by userVoted map
function updateVotesByUsers() {
	//Init all votes of user by 0
	for (let [keyUser, sock] of userToSocket) {
		keyUser.vote = 0;
	}
	//loop on map userVoted and users map and incremente vote of user when idVoted = user.id
	for (let [idVoter, idVoted] of usersVoted) {
		for (let [keyUser, sock] of userToSocket) {
			if (keyUser.id == idVoted) {
				keyUser.vote++;
			}
		}
	}
}

function updateScore(userSacrificied) {
	//Civils win
	if (userSacrificied.role == enumRole.ESCROC) {
		for (let [keyUser, sock] of userToSocket) {
			if (keyUser.role == enumRole.CIVIL) {
				keyUser.score = keyUser.score + 100;
			}
		}
	}
	else {
		for (let [keyUser, sock] of userToSocket) {
			if (keyUser.role == enumRole.ESCROC) {
				keyUser.score = keyUser.score + 300;
			}
		}
	}
	io.emit('updateScores', Array.from(userToSocket.keys()));
}

function endVoteFunction(usersVoted) {
	let userSacrificied = findUserSacricified(usersVoted);
	var dataObject = { userSacrificied: userSacrificied, words: wordsToPlay };
	console.log("-- user sacricified -> " + userSacrificied.name + " with " + userSacrificied.vote + " votes")
	io.emit("endVoteStep", dataObject)
	updateScore(userSacrificied);
	usersVoted.clear();
}

function updateMessageList(idUser, message) {
	var userUpdate = findUserById(idUser);
	userUpdate.messages.push(message);
}
function updateRoleAndWord(user, secretWord, role) {
	user.role = role;
	user.secretWord = secretWord;
}

function findUserSacricified() {
	let userTemp = userToSocket.keys().next().value;
	for (let [keyUser, sock] of userToSocket) {
		if (keyUser.vote > userTemp.vote) {
			userTemp = keyUser;
		}
	}
	return userTemp;
}

function define2RandomWords(words) {
	var wordsToPlay = [];
	var indexWordCivil = Math.floor(Math.random() * words.length);
	var indexWordUc = Math.floor(Math.random() * words.length);
	console.log("---- gettings words -> " + words + "\n")
	if (indexWordUc == indexWordCivil) {
		if (indexWordUc == words.length) {
			indexWordUc--;
		} else {
			indexWordUc++;
		}
	}
	wordsToPlay.push(words[indexWordCivil])
	wordsToPlay.push(words[indexWordUc])
	console.log("---- wordsToPlay -> " + wordsToPlay + "\n");
	return wordsToPlay;

}

function defineEscrocUserSocket() {
	let items = Array.from(userToSocket.values());
	return items[Math.floor(Math.random() * items.length)];
}

/**
 * Get random id on usersId list and persist index random (actualIndexOfUsersId)
 */
function defineFirstPlayer() {
	actualIndexOfUsersId = Math.floor(Math.random() * usersId.length);
	return usersId[actualIndexOfUsersId];
}

function nextPlayerToPlay() {
	//if end of list, then return value of index = 0
	if (usersId[actualIndexOfUsersId] == usersId[usersId.length - 1]) {
		actualIndexOfUsersId = 0;
		return usersId[0];
	} else {
		actualIndexOfUsersId++;
		return usersId[actualIndexOfUsersId];
	}
}

function readCloseWordFile() {
	var elem = [];
	var data = fs.readFileSync('D:/Did/socketDid/nodeSocketServer/src/closeWord.txt');
	var array = data.toString().split("\n");
	var comptIndex = 0;
	for (i in array) {
		elem[comptIndex] = array[i].toString().split(",");
		comptIndex++;
	}
	return elem;
}

function chooseWordsFromList() {
	var arrayWord2Dim = readCloseWordFile();
	var randInt = Math.floor(Math.random() * arrayWord2Dim.length);
	return arrayWord2Dim[randInt];
}

server.listen(port, () => {
	console.log(`started on port: ${port}\n`);
});

