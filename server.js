//  Modified server.js (format borrowed from MiniChat) designed to produce a functional prototype for Plunder

// Create a web server using Express.

var express = require('express');
var app = express();
var server = require('http').createServer(app);

//  Variable for player handling:
var playerNum = 1;

// Add WebSocket support to the web server, using socket.io.

var io = require('socket.io')(server);

// Serve static files on the root path.

app.use('/', express.static('static'));

// Tells socket.io to listen to a built-in event 'connection'. This event is
// triggered when a client connects to the server. At that time, the callback
// function (the 2nd argument) will be called with an object (named as 'conn')
// representing the connection.

io.sockets.on('connection', function (conn) {
    //  Handle player connections
    var playerData = {
        id: "player" + playerNum.toString(),
        idNum: playerNum
    }
    playerNum++;
    console.log("> " + playerData.id + " connected");
    
    io.emit('loadPlayer', playerData);
    var loadMsg = {
        content: "Player " + playerData.idNum.toString() + " has entered the game"
    };
    io.emit('dispMsg', loadMsg);

    conn.on('dispMsg', function(msg) {
        if (msg && msg.content) {
            var globalMsg = {
                content: msg.content
            };
            io.emit('dispMsg', globalMsg);
        }
        //  Invalid messages are ignored
    });

    conn.on('shipSelect', function(msg) {
        if (msg && msg.name && msg.id) {
            io.emit('shipSelect', msg);
            io.emit("dispMsg", {content: msg.id + " has selected The " + msg.name});
            console.log("Select received and re-sent");
        }
    });
    
    conn.on('action', function(actData) {
        if (actData.action == "attack") {
            io.emit('attack', actData);
        } else if (actData.action == "repres") {
            io.emit('repres', actData);
        } else if (actData.action == "reposition") {
            io.emit('reposition', actData);
        } else if (actData.action == "plunder") {
            io.emit('plunder', actData);
        } else if (actData.action == "special") {
            io.emit('special', actData);
        } else {
            console.log("Action failure")
        }
        console.log(actData.action + " received and re-sent");
    });

    conn.on('disconnect', function(data) {
        if (playerNum == 2 && playerData.idNum == 1) {
            playerNum = 1;
        } else if (playerNum == 3 && playerData.idNum == 1) {
            playerNum = 1;
        } else if (playerNum == 3 && playerData.idNum == 2) {
            playerNum = 2;
        } else {
            console.log("disconnect failure");
        }
        console.log("> " + playerData.id + " disconnected");
    });
    
});
numPlayers = 0;

// Listen on a high port.

var port = 12848;
server.listen(port, function () {
    console.log("Listening on port " + port);
});

