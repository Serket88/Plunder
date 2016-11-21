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
    
    //io.emit('contextSwitch', playerData);

    io.emit('loadPlayer', playerData);

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

            if (msg.id == "player1") {
                select1 = true;
            } else if (msg.id == "player2") {
                select2 = true;
            }

            if (select1 && select2) {
                io.emit('gameStart', msg);
                io.emit('contextSwitch', msg);
            }
            console.log("Select received and re-sent");
        }
    });
    
    conn.on('action', function(actData) {
        io.emit('action', actData);
    });

    conn.on('disconnect', function(data) {
        select1 = false;
        select2 = false;
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
    
    conn.on('gameOver', function(data) {
        io.emit('gameOver', data);
    });

});
numPlayers = 0;

// Listen on a high port.

var port = 12188;
server.listen(port, function () {
    console.log("Listening on port " + port);
});

