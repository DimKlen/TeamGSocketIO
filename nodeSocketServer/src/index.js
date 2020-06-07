const express = require('express')
const app = express();
const path = require('path');

const http = require('http');
const server = http.Server(app);

const socketIO = require('socket.io');
const io = socketIO(server);

const fs = require('fs');

const port = process.env.PORT || 3000;

// list of user object
var users = [];
//list of users id
var usersId = [];
//socket id -> socket object
var sockets = new Map();
//user -> socket
var usersSocketsId = new Map();
//key : user id current -> user id selected
var usersVoted = new Map();
//count id 
var id = 1;
var actualIndex;

var wordsToPlay;

var nombreTours;
var comptNombreTours = 1;
var firstPlayer;

//TODO path in variable and real path
app.use(express.static(path.join('D:/Did/socketDid/dist/socketDid')));

//TODO path in variable and real path
/*app.get('/', function(req,res) {
	res.sendFile('D:/Did/socketDid/src/index.html');
})*/

//Listen on each connection on app
io.on('connection', (socket) => {
	//current user
	var me = null;

	console.log('user connected to socket. New socket id : ' + socket.id);

	sockets.set(socket.id, socket);
	//Listen disconnection for each user connected
	socket.on('disconnect', () => {
		console.log('user disconnected to socket. Removing socket Id : ' + socket.id);
		//if current user is already loged
		if (me != null) {
			io.emit('removeusrs', me);
			//remove user by id
			users.splice(users.findIndex(item => item.id == me.id), 1);
			usersId.splice(usersId.indexOf(me.id), 1);
		}
		sockets.delete(socket.id);

	});

	//Listen on user loged step
	socket.on('loged', (data) => {
		//set an unique id to user
		data.id = id;
		id++;
		console.log('user just loged : ' + JSON.stringify(data));
		//persist user to socket
		usersSocketsId.set(data, socket.id);
		//set variable me to current user
		me = data;
		//For each user connected, send newusrs event to display users in sidebar
		for (const k in users) {
			socket.emit('newusrs', users[k]);
		}
		//push current user in users list
		users.push(data);
		usersId.push(data.id);
		//send newusrs event to display current user in current client
		io.emit('newusrs', data);
		socket.emit('yourUser', data);
	});

	//Listen on up undercover players from client
	socket.on('upUcFromClient', (data) => {
		console.log('server : upUcFromClient');
		//emit up uc to all clients
		io.emit('upUcFromServeur', "");
	});

	//Listen on down undercover players from client
	socket.on('downUcFromClient', (data) => {
		console.log('server : downUcFromClient');
		//emit down uc to all clients
		io.emit('downUcFromServeur', "");
	});

	socket.on('playReadyFromClient', (data) => {
		nombreTours = data;
		console.log("turns number : " + nombreTours);
		console.log('server : playReadyFromClient');
		firstPlayer = defineFirstPlayer();
		io.emit('playReadyFromServeur', firstPlayer);
		wordsToPlay = define2RandomWords(chooseWordsFromList());
		var indexUcUserSocket = defineUcUserSocket();
		console.log("user uc is : " + indexUcUserSocket)
		for (let [k, v] of sockets) {
			if (k == indexUcUserSocket) {
				v.emit('secretWord', wordsToPlay[1]);
				var user = findUserBySocketId(k);
				updateUserWithByUser(user, wordsToPlay[1], "ESCROC")
			} else {
				v.emit('secretWord', wordsToPlay[0]);
				var user = findUserBySocketId(k);
				updateUserWithByUser(user, wordsToPlay[0], "CIVIL")
			}
		}
	});

	socket.on('clientMessageNextPlayer', (data) => {
		console.log('server : clientNextPlayer message : ' + data.messageFromPreviousClient + ' and actualId :' + data.actualId);
		var idNextToPlay = nextPlayerToPlay();
		var objectMessageAndId = { messageFromPreviousClient: data.messageFromPreviousClient, nextPlayerId: idNextToPlay, actualId: data.actualId };
		io.emit('serveurMessageNextPlayer', objectMessageAndId);
		if (idNextToPlay == firstPlayer) {
			if (comptNombreTours == nombreTours) {
				io.emit('endTurn', "");
				comptNombreTours = 1;
			} else {
				comptNombreTours++;
			}
		}
	});

	socket.on('userJustVoted', (data) => {
		console.log('server : userJustVoted user just voted : ' + data.playerIdWhoSelected + ' and to vote :' + data.actualSelectPlayerId);
		usersVoted.set(data.playerIdWhoSelected, data.actualSelectPlayerId);
		io.emit('userVoted', data);
		endVoteStep(usersVoted);
	});

});

function endVoteStep(usersVoted) {
	if (usersVoted.size == usersId.length) {
		var dataObject = { userEliminated: findUserEliminated(usersVoted), words: wordsToPlay };
		console.log("data object : " + dataObject)
		io.emit("endVoteStep", dataObject)
		usersVoted.clear();
	}
}

function findUserBySocketId(socketId) {
	for (let [k, v] of usersSocketsId) {
		if (v == socketId) {
			console.log("user uc is -> " + k.name);
			return k;
		}
	}
	return null;
}

function updateUserWithByUser(user, secretWord, role) {
	for (var i in users) {
		if (users[i].id == user.id) {
			users[i].secretWord = secretWord;
			users[i].role = role;
			console.log("user -> " + users[i].name + " has updated his secret word -> " + users[i].secretWord + " and his role -> " + users[i].role)
			break; //Stop this loop, we found it!
		}
	}
}

function findUserEliminated(usersVoted) {
	let list = [];
	for (let [key, value] of usersVoted) {
		list.push(value);
	}
	console.log(list);

	var occurrences = {};
	for (var i = 0, j = list.length; i < j; i++) {
		occurrences[list[i]] = (occurrences[list[i]] || 0) + 1;
	}

	const map = new Map();
	Object.keys(occurrences).forEach(key => {
		map.set(key, occurrences[key]);
	});

	map[Symbol.iterator] = function* () {
		yield* [...this.entries()].sort((a, b) => a[1] - b[1]);
	}
	let userFound;
	users.forEach(item => {
		console.log("user : " + item.id + " et id most voted : " + map.keys().next().value);
		if (item.id == map.keys().next().value) {
			console.log("found")
			userFound = item;
		}
	})
	console.log(userFound);
	return userFound;
}

function define2RandomWords(words) {
	var wordsToPlay = [];
	var indexWordCivil = Math.floor(Math.random() * words.length);
	var indexWordUc = Math.floor(Math.random() * words.length);
	console.log("words -> " + words)
	if (indexWordUc == indexWordCivil) {
		if (indexWordUc == words.length) {
			indexWordUc--;
		} else {
			indexWordUc++;
		}
	} else {
		wordsToPlay.push(words[indexWordCivil])
		wordsToPlay.push(words[indexWordUc])
	}
	console.log("wordsToPlay : " + wordsToPlay);
	return wordsToPlay;

}

function defineUcUserSocket() {
	let items = Array.from(sockets.keys());
	return items[Math.floor(Math.random() * items.length)];
}

function defineFirstPlayer() {
	actualIndex = Math.floor(Math.random() * usersId.length);
	return usersId[actualIndex];
}

function nextPlayerToPlay() {
	if (usersId[actualIndex] == usersId[usersId.length - 1]) {
		actualIndex = 0;
		return usersId[0];
	} else {
		actualIndex++;
		return usersId[actualIndex];
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
	console.log(`started on port: ${port}`);
});

