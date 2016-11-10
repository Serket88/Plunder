//  Modified server.js (format borrowed from MiniChat) designed to produce a functional prototype for Plunder

// Create a web server using Express.

var express = require('express');
var app = express();
var server = require('http').createServer(app);

//  Variable for player handling:
var playerNum = 1;
var select1 = false;
var select2 = false;

// Add WebSocket support to the web server, using socket.io.

var io = require('socket.io')(server);

// Serve static files on the root path.

app.use('/', express.static('static'));

//  ================  HELPER FUNCTIONS  ================

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

            if (msg.id == "player1") {
                select1 = true;
            } else if (msg.id == "player2") {
                select2 = true;
            }

            if (select1 && select2) {
                io.emit('gameStart', msg);
            }
            console.log("Select received and re-sent");
        }
    });
    
    conn.on('action', function(actData) {
        var flipData = {
            actor: "placeholder",
            action: actData.action
        };

        if (actData.action == "attack") {
            flipData.actor = actData.id1;
            io.emit('attack', actData);
            io.emit('turnFlip', flipData);
        } else if (actData.action == "repres") {
            flipData.actor = actData.id;
            io.emit('repres', actData);
            io.emit('turnFlip', flipData);
        } else if (actData.action == "reposition") {
            flipData.actor = actData.id;
            io.emit('reposition', actData);
            io.emit('turnFlip', flipData);
        } else if (actData.action == "plunder") {
            flipData.actor = actData.id1;
            io.emit('plunder', actData);
            io.emit('turnFlip', flipData);
        } else if (actData.action == "special") {
            flipData.actor = actData.id1;
            io.emit('special', actData);
            io.emit('turnFlip', flipData);
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

var port = 12888;
server.listen(port, function () {
    console.log("Listening on port " + port);
});

