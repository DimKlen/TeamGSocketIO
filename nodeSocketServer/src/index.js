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
//List of all sockets connected
var socketList = [];
var userToSocket = new Map();
//key : user id current -> user id voted
var usersVoted = new Map();
//technical id for an user
var id = 1;
//Actual index for player turn
var actualIndexOfUsersId;
//List of 2 words, one for CIVILS and one for ESCROC
var wordsToPlay;
//Turns number
var nombreTours;
//Count of turn number actual
var comptNombreTours = 1;
//Id of first player in this inning
var firstPlayer;
//List of all words
var wordsList;
//List temps of all words
var wordListTemp;

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

		io.emit('endTurn', false);

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
				io.emit('endTurn', true);
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
			if (!isDraw()) {
				endVoteFunction();
				newInning();
			}
			else {
				usersVoted.clear();
				for (let [keyUser, sock] of userToSocket) {
					keyUser.vote = 0;
				}
				io.emit('draw', Array.from(userToSocket.keys()));
			}
		}
	});

	//Fired when a client send a message
	socket.on('newWords', (data) => {
		console.log("-- new Words query \n");
		newInning();
	});
});

function newInning() {
	io.emit('endTurn', false);

	//Init users
	initUsersForNewInning();
	io.emit('newInning', Array.from(userToSocket.keys()));
	usersVoted.clear();

	firstPlayer = defineFirstPlayer();
	console.log("---- first player id -> " + firstPlayer + "\n")
	io.emit('playReadyFromServeur', firstPlayer);
	//Define 2 words to play
	wordsToPlay = getRandomWordsFromList(wordListTemp);

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
}

function neverSameWordsInInning() {

}

function isDraw() {
	let userTemp = userToSocket.keys().next().value;
	let isDraw = false;
	let count = 0;
	for (let [keyUser, sock] of userToSocket) {
		console.log("actual index " + keyUser.name + "\n")
		console.log("actual temp " + userTemp.name + "\n")
		count++;
		if (keyUser.vote > userTemp.vote) {
			console.log(keyUser.name + " is > " + userTemp.name + "\n")
			userTemp = keyUser;
			console.log("usertemp become " + userTemp.name + "\n")
			isDraw = false;
		} else if (keyUser.id != userTemp.id && keyUser.vote == userTemp.vote) {
			console.log(keyUser.name + " is == " + userTemp.name + "\n")
			isDraw = true;
		}
	}
	console.log("count " + count + "\n")
	return isDraw;
}

//Return an user if found
function findUserById(id) {
	for (let [keyUser, sock] of userToSocket) {
		if (keyUser.id == id)
			return keyUser;
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

function initUsersForNewInning() {
	for (let [keyUser, sock] of userToSocket) {
		keyUser.vote = 0;
		keyUser.messages = [];
		keyUser.secretWord = "";
		keyUser.role = ""
	}
}

/**
 * Take user who has most votes and send it to all sockets. update also score of all users and send it to all sockets
 */
function endVoteFunction() {
	let userSacrificied = findUserSacricified();
	var dataObject = { userSacrificied: userSacrificied, words: wordsToPlay };
	console.log("-- user sacricified -> " + userSacrificied.name + " with " + userSacrificied.vote + " votes")
	io.emit("endVoteStep", dataObject)
	updateScore(userSacrificied);
}
function updateScore(userSacrificied) {
	//Civils win
	if (userSacrificied.role == enumRole.ESCROC) {
		for (let [keyUser, sock] of userToSocket) {
			if (keyUser.role == enumRole.CIVIL)
				keyUser.score = keyUser.score + 100;
		}
	}
	else {
		for (let [keyUser, sock] of userToSocket) {
			if (keyUser.role == enumRole.ESCROC)
				keyUser.score = keyUser.score + 300;
		}
	}
	io.emit('updateScores', Array.from(userToSocket.keys()));
}


/**
 * Update user fields
 */
function updateMessageList(idUser, message) {
	var userUpdate = findUserById(idUser);
	userUpdate.messages.push(message);
}
function updateRoleAndWord(user, secretWord, role) {
	user.role = role;
	user.secretWord = secretWord;
}

/**
 * Return user who has most votes
 */
//TODO egalite
function findUserSacricified() {
	let userTemp = userToSocket.keys().next().value;
	for (let [keyUser, sock] of userToSocket) {
		if (keyUser.vote > userTemp.vote) {
			userTemp = keyUser;
		}
	}
	return userTemp;
}

/**
 * return random socket 
 */
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

/**
 * Take list of secret words (2 or greater) and return only 2 random words
 */
function define2RandomWords(words) {
	var wordsToPlay = [];
	var indexWordCivil = Math.floor(Math.random() * words.length);
	var indexWordUc = Math.floor(Math.random() * words.length);
	console.log("---- gettings words -> " + words + "\n")
	if (indexWordUc == indexWordCivil) {
		if (indexWordUc == words.length) {
			console.log("decrémente")
			indexWordUc--;
		} else {
			console.log("incremente")
			indexWordUc++;
		}
	}
	console.log("---- gettings civil word -> " + words[indexWordCivil] + " with index " + indexWordCivil + "\n")
	console.log("---- gettings uc word -> " + words[indexWordUc] + " with index " + indexWordUc + "\n")
	wordsToPlay.push(words[indexWordCivil])
	wordsToPlay.push(words[indexWordUc])
	console.log("---- wordsToPlay -> " + wordsToPlay + "\n");
	return wordsToPlay;
}

/**
 * Functions to read file containing secret words and give random secret words
 */
function chooseWordsFromList() {
	wordsList = readCloseWordFile();
	wordListTemp = wordsList;
	return getRandomWordsFromList(wordListTemp);
}
function getRandomWordsFromList(wordListTemp) {
	if (wordListTemp.length > 0) {
		return getWords(wordListTemp);
	} else {
		console.log("reset words list")
		wordListTemp = wordsList;
		return getWords(wordListTemp);
	}
}

function getWords(wordListTemp) {
	var randInt = Math.floor(Math.random() * wordListTemp.length);
	var wordsToPlay = wordListTemp[randInt];
	console.log("------------------- words choosen : " + wordsToPlay + "\n")
	wordListTemp.splice(wordListTemp.indexOf(randInt), 1);
	for (const element of wordListTemp) {
		console.log("--- " + element);
	}

	return wordsToPlay;
}

function readCloseWordFile() {
	var elem = [];
	//TODO path
	var data = fs.readFileSync('D:/Did/socketDid/nodeSocketServer/src/closeWord.txt');
	var array = data.toString().split("\n");
	var comptIndex = 0;
	for (i in array) {
		elem[comptIndex] = array[i].toString().split(",");
		console.log("----- elem " + comptIndex + " data : " + elem[comptIndex] + "\n")
		comptIndex++;
	}
	return elem;
}

//Server listen on port
server.listen(port, () => {
	console.log(`started on port: ${port}\n`);
});

