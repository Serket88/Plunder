/*
    Handles both global variables and event handlers for the buttons.  Anything that involves the user interface framework should go in here.
*/

//  ================  GLOBAL VARIABLES  ================

var clientID;
var initialized = false;

var specialActive = false;
var specialUsed = false;
var specialFull = false;

var gameIsOver = false;

var player1 = new Ship();
var player2 = new Ship();

//  ================  HELPER FUNCTIONS  ================

function printOnce(printData) {
    if (printData.id == clientID) {
        var printMsg = {content: printData.content};
        socket.emit('dispMsg', printMsg);
    }
}

function dice(max) {
    return Math.floor(Math.random() * (max - 2)) + 1;
}

function repoFlip() {
    if (player1.repo == 1) {
        player1.repo = 2;
    } else if (player1.repo == 2) {
        player1.acc -= 2;
        player1.man -= 2;
        player1.repo = 0;
        player1.status = "Normal";
    }

    if (player2.repo == 1) {
        player2.repo = 2;
    } else if (player2.repo == 2) {
        player2.acc -= 2;
        player2.man -= 2;
        player2.repo = 0;
        player2.status = "Normal";
    }
}

function isDead(playerID) {
    if (playerID == "player1") {
        //  Check to see if Player 1 is dead
        if (player1.hp <= 0) {
            //  Player 1 is dead
            console.log("Player 1 died");

            var retVal = {
                confirmed: true,
                id: playerID
            };

            //  Possibly disable all buttons here
            return retVal;

        } else {
            var retVal = {
                confirmed: false,
                id: playerID
            };

            return retVal;
        }
    } else if (playerID == "player2") {
        //  Check to see if Player 2 is dead
        if (player2.hp <= 0) {
            //  Player 2 is dead
            console.log("Player 2 died");

            var retVal = {
                confirmed: true,
                id: playerID
            };

            //  Possibly disable all buttons here
            return retVal;
        } else {
            var retVal = {
                confirmed: false,
                id: playerID
            };

            return retVal;
        }
    }
}

function statusUpdate() {
    if (clientID == "player1") {
        $('#ownHP').text(player1.hp + " / " + player1.maxHp);
        $('#ownStatus').text(player1.status);
        $('#ownSpecial').text(player1.charge + "%");
        $('#ownAmmo').text(player1.ammo + " / 3");

        $('#oppHP').text(player2.hp + " / " + player2.maxHp);
        $('#oppStatus').text(player2.status);
    } else if (clientID == "player2") {
        $('#ownHP').text(player2.hp + " / " + player2.maxHp);
        $('#ownStatus').text(player2.status);
        $('#ownSpecial').text(player2.charge + "%");
        $('#ownAmmo').text(player2.ammo + " / 3");

        $('#oppHP').text(player1.hp + " / " + player1.maxHp);
        $('#oppStatus').text(player1.status);
    }
}

//  ================  PROGRAM CONTROL  ================

socket.on('loadPlayer', function(msg) {
    if (!initialized) {
        clientID = msg.id;
        initialized = true;
        console.log(">  Initialized with the ID " + clientID);
        disableActions();
    }
});

socket.on('shipSelect', function(data) {
    if (data.id != clientID) {
        $(data.buttonName).prop('disabled', true);
    } else {
        disableShips();
    }

    if (data.id == "player1") {
        player1.select(data);
    } else if (data.id == "player2") {
        player2.select(data);
    } else {
        console.log("shipSelect failure");
    }

    if (clientID == "player1") {
        $("#ownName").text("The " + player1.name);
        $("#oppName").text("The " + player2.name);
    } else if (clientID == "player2") {
        $("#ownName").text("The " + player2.name);
        $("#oppName").text("The " + player1.name);
    }
});

socket.on('gameStart', function(data) {
    if (clientID == "player1") {
        enableActions();
    }
    statusUpdate();
});

socket.on('action', function(data) {
    player1 = data.p1;
    player2 = data.p2;

    if (data.actor == clientID) {
        //  If charge >= 100, enable special
        if (clientID == "player1") {
            if (player1.charge >= 100 && !specialUsed) {
                specialActive = true;
            }
        } else if (clientID == "player2") {
            if (player2.charge >= 100 && !specialUsed) {
                specialActive = true;
            }
        }

    } else if (data.actor != clientID) {
        //  If the person who just took a turn is not this
        //  client, then un-disable the buttons
        if (!gameIsOver) {
            enableActions();
        }
    }
    statusUpdate();
});

socket.on('gameOver', function(data) {
    console.log("Gameover");
    gameIsOver = true;
    disableActions();
});
