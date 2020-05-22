const express = require('express')
const app = express();
const path = require('path');

const http = require('http');
const server = http.Server(app);

const socketIO = require('socket.io');
const io = socketIO(server);

const port = process.env.PORT || 3000;
var users = [];
var id = 1;
var usersId = [];
var actualIndex;

//TODO path in variable and real path
app.use(express.static(path.join('D:/Did/socketDid/dist/socketDid')));

//TODO path in variable and real path
app.get('/*', function(req,res) {
	res.sendFile('D:/Did/socketDid/src/index.html');
})

//Listen on each connection on app
io.on('connection', (socket) => {
	//current user
	var me = null;
    console.log('user connected to socket');
    //Listen disconnection for each user connected
    socket.on('disconnect',() => {
    	console.log('user disconnected to socket is : '+JSON.stringify(me));
    	//if current user is already loged
    	if(me != null) {
    	io.emit('removeusrs', me);
    	//remove user by id
    	users.splice(users.findIndex(item => item.id == me.id),1);
    	usersId.splice(usersId.indexOf(me.id),1);
    }
    });

    //Listen on user loged step
    socket.on('loged', (data) => {
    	//set an unique id to user
    	data.id = id;
    	id++;
    	console.log('user just loged : '+ JSON.stringify(data));

    	//set variable me to current user
    	me = data;
    	//For each user connected, send newusrs event to display users in sidebar
    	for(const k in users) {
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
    	console.log('server : playReadyFromClient');
    	io.emit('playReadyFromServeur', defineFirstPlayer());	
    });
    
    socket.on('clientMessageNextPlayer', (data) => {
    	console.log('server : clientNextPlayer message : ' + data.messageFromPreviousClient+' and actualId :'+data.actualId);
    	var objectMessageAndId = {messageFromPreviousClient: data.messageFromPreviousClient, nextPlayerId: nextPlayerToPlay(), actualId: data.actualId};
    	io.emit('serveurMessageNextPlayer', objectMessageAndId);	
    });

});

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

server.listen(port, () => {
    console.log(`started on port: ${port}`);
});

