/*
    Handles both global variables and event handlers for the buttons.  Anything that involves the user interface framework should go in here.
*/

//  ================  GLOBAL VARIABLES  ================

var clientID;
var initialized = false;

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
    }

    if (player2.repo == 1) {
        player2.repo = 2;
    } else if (player2.repo == 2) {
        player2.acc -= 2;
        player2.man -= 2;
        player2.repo = 0;
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

//  ================  PROGRAM CONTROL  ================

socket.on('loadPlayer', function(msg) {
    if (!initialized) {
        clientID = msg.id;
        initialized = true;
        console.log(">  Initialized with the ID " + clientID);
    }
});

socket.on('shipSelect', function(data) {
    if (data.id == "player1") {
        player1.select(data);
    } else if (data.id == "player2") {
        player2.select(data);
    } else {
        console.log("shipSelect failure");
    }
});

socket.on('attack', function(atkData) {
    console.log("> " + atkData.id1 + "has attacked");
    if (atkData.id1 == "player1") {
        //  Player 1 is attacking Player 2
        if (player1.ammo == 0) {
            var atkResult = {
                id: atkData.id1,
                content: "Player 1 attempted to attack, but doesn't have enough ammo.  Perhaps now is a good time to Repair & Restock?"
            };
            printOnce(atkResult);
            return;
        }

        //  Check for reposition flipping
        repoFlip();

        var atkRoll = dice(20) + player1.acc;
        player1.ammo--;

        if (atkRoll >= player2.man) {
            //  Player 1 hits
            var dmgRoll = dice(8) + player1.pow;
            player2.hp -= dmgRoll;

            //  send to server
            var atkResult = {
                id: atkData.id1,
                content: "Player 1 attacked and successfully hit Player 2, dealing " + dmgRoll + " damage!"
            };
            printOnce(atkResult);

            //  check if player2 is dead
            if (isDead("player2").confirmed == true) {
                var deadResult = {
                    id: atkData.id1,
                    content: "Player 1's ship has been completely destroyed!  GAME OVER"
                };
                printOnce(deadResult);
            };

        } else {
            //  send to server
            var atkResult = {
                id: atkData.id1,
                content: "Player 1 attacked Player 2 and missed, dealing no damage"
            };
            printOnce(atkResult);
        }

    } else if (atkData.id1 == "player2") {
        //  Player 2 is attacking Player 1
        if (player2.ammo == 0) {
            var atkResult = {
                id: atkData.id1,
                content: "Player 2 attempted to attack, but doesn't have enough ammo.  Perhaps now is a good time to Repair & Restock?"
            };
            printOnce(atkResult);
            return;
        }

        //  Check for reposition flipping
        repoFlip();

        var atkRoll = dice(20) + player2.acc;
        player2.ammo--;

        if (atkRoll >= player1.man) {
            //  Player 2 hits
            var dmgRoll = dice(8) + player2.pow;
            player1.hp -= dmgRoll;

            //  send to server
            var atkResult = {
                id: atkData.id1,
                content: "Player 2 attacked and successfully hit Player 1, dealing " + dmgRoll + " damage!"
            };
            printOnce(atkResult);

            //  check if player1 is dead
            if (isDead("player1").confirmed == true) {
                var deadResult = {
                    id: atkData.id1,
                    content: "Player 2's ship has been completely destroyed!  GAME OVER"
                };
                printOnce(deadResult);
            };
        } else {
            //  send to server
            var atkResult = {
                id: atkData.id1,
                content: "Player 2 attacked Player 1 and missed, dealing no damage"
            };
            printOnce(atkResult);
        }
    }
});

socket.on('repres', function(resData) {
    //  Check for reposition flipping
    repoFlip();

    if (resData.id == "player1") {
        //  Player 1 is taking the repres action
        if (player1.ammo <= 1) {
            player1.ammo += 2;
        } else {
            player1.ammo = 3;
        }

        var repRoll = dice(6) + dice(6);
        var repVal;
        if (player1.hp + repRoll >= player1.maxHp) {
            repVal = player1.maxHp - player1.hp;
            player1.hp = player1.maxHp;
        } else {
            repVal = repRoll;
            player1.hp += repRoll;
        }

        var represResult = {
            id: resData.id,
            content: "Player 1 repaired and restocked their ship, gaining " + repVal + " hit points"
        };
        printOnce(represResult);

    } else if (resData.id == "player2") {
        //  Player 2 is taking the repres action
        if (player2.ammo <= 1) {
            player2.ammo += 2;
        } else {
            player2.ammo = 3;
        }

        var repRoll = dice(6) + dice(6);
        var repVal;
        if (player2.hp + repRoll >= player2.maxHp) {
            repVal = player2.maxHp - player2.hp;
            player2.hp = player2.maxHp;
        } else {
            player2.hp += repRoll;
        }

        var represResult = {
            id: resData.id,
            content: "Player 2 repaired and restocked their ship, gaining " + repVal + " hit points"
        };
        printOnce(represResult);

    }
});

socket.on('reposition', function(repoData) {
    if (repoData.id == "player1") {
        //  Player 1 is taking the reposition action

        player1.acc += 2;
        player1.man += 2;
        player1.repo = 1;

        var repoResult = {
            id: repoData.id,
            content: "Player 1 repositioned their ship, gaining a bonus to accuracy and maneuverability for the next turn"
        };
        printOnce(repoResult);

    } else if (repoData.id == "player2") {
        //  Player 2 is taking the reposition action

        player2.acc += 2;
        player2.man += 2;
        player2.repo = 1;

        var repoResult = {
            id: repoData.id,
            content: "Player 2 repositioned their ship, gaining a bonus to accuracy and maneuverability for the next turn"
        };
        printOnce(repoResult);
    }
});

socket.on('plunder', function(plunData) {
    //  Check for reposition flipping
    repoFlip();

    if (plunData.id1 == "player1") {
        //  Player 1 is attempting to plunder Player 2
        var plunRoll = dice(20) + player1.fer - (player2.hp / 2);

        if (plunRoll >= (10 + player2.fer)) {
            //  PLAYER 1 WINS
            var plunResult = {
                id: plunData.id1,
                content: "PLAYER 1 WINS THE GAME!!!  They successfully plundered Player 2!"
            };
            printOnce(plunResult);
        } else {
            //  Player 1 failed to plunder
            var plunResult = {
                id: plunData.id1,
                content: "Player 1 attempted to plunder Player 2, but failed to succeed!"
            };
            printOnce(plunResult);
        }
    } else if (plunData.id1 == "player2") {
        //  Player 2 is attempting to plunder Player 1
        var plunRoll = dice(20) + player2.fer - (player1.hp / 2);

        if (plunRoll >= (10 + player1.fer)) {
            //  PLAYER 2 WINS
            var plunResult = {
                id: plunData.id1,
                content: "PLAYER 2 WINS THE GAME!!!  They successfully plundered Player 1!"
            };
            printOnce(plunResult);
        } else {
            //  Player 2 failed to plunder
            var plunResult = {
                id: plunData.id1,
                content: "Player 2 attempted to plunder Player 1, but failed to succeed!"
            };
            printOnce(plunResult);
        }
    }

});

socket.on('special', function(specData) {
    console.log("> " + specData.id1 + "has taken the special action");
    if (specData.id1 == "player1") {
        //  Player 1 is using the special

        if (player1.name == "Anjelita") {
            //  activate anjelita special
            var resto = (player1.maxHp - player1.hp) * 0.75;
            player1.hp += resto;

            var specResult = {
                id: specData.id1,
                content: "Player 1 activated their special RESTORATION ability, repairing " + resto + " hit points"
            };
            printOnce(specResult);

        } else if (player1.name == "Hartley") {
            //  activate the hartley special
            var atkRoll = dice(20) + player1.acc;

            if (atkRoll >= player2.man) {
                var dmgRoll = dice(8) + player1.pow + 4;
                player2.hp -= dmgRoll;

                var atkResult = {
                    id: specData.id1,
                    content: "Player 1 activated their special IMPERIAL DISCIPLINE power, dealing " + dmgRoll + " damage to Player 2 and restocking all ammunition"
                };
                printOnce(atkResult);

                //  Check to see if player2 is dead
                if (isDead("player2").confirmed == true) {
                    var deadResult = {
                        id: atkData.id1,
                        content: "Player 1's ship has been completely destroyed!  GAME OVER"
                    };
                    printOnce(deadResult);
                };
            } else {
                var atkResult = {
                    id: specData.id1,
                    content: "Player 1 activated their special IMPERIAL DISCIPLINE power, restoring all ammunition but missing their attack."
                };
                printOnce(specResult);
            }
            player1.ammo = 3;

        } else if (player1.name == "Bernkastel") {
            //  activate the bernkastel special

            var ferBoost = (player2.hp / 4) + 5;
            player1.fer += ferBoost;

            var surgeResult = {
                id: specData.id1,
                content: "Player 1 activated their special HOOKSURGE ability, gaining a massive increase to their chance to plunder Player 2!"
            };
            printOnce(surgeResult);

        } else if (player1.name == "Veronica") {
            //  activate the veronica special

            //  This damage might need to be nerfed.  Tested out higher values of random damage, but players were more receptive to lower variances.
            var dmgRoll = dice(8) + 8
            player2.hp -= dmgRoll;

            var hellResult = {
                id: specData.id1,
                content: "Player 1 activated their special HELLFIRE BARRAGE ability, dealing a whopping " + dmgRoll + " damage to Player 2"
            };
            printOnce(hellResult);

            //  Check to see if player2 is dead
            if (isDead("player2").confirmed == true) {
                var deadResult = {
                    id: specData.id1,
                    content: "Player 1's ship has been completely destroyed!  GAME OVER"
                };
                printOnce(deadResult);
            };
        }
    } else if (specData.id1 == "player2") {
        //  Player 2 is using the special

        if (player2.name == "Anjelita") {
            //  activate anjelita special
            var resto = (player2.maxHp - player2.hp) * 0.75;
            player2.hp += resto;

            var specResult = {
                id: specData.id1,
                content: "Player 2 activated their special RESTORATION ability, repairing " + resto + " hit points"
            };
            printOnce(specResult);

        } else if (player2.name == "Hartley") {
            //  activate the hartley special
            var atkRoll = dice(20) + player2.acc;

            if (atkRoll >= player1.man) {
                var dmgRoll = dice(8) + player2.pow + 4;
                player1.hp -= dmgRoll;

                var atkResult = {
                    id: specData.id1,
                    content: "Player 2 activated their special IMPERIAL DISCIPLINE power, dealing " + dmgRoll + " damage to Player 1 and restocking all ammunition"
                };
                printOnce(atkResult);

                //  Check to see if player1 is dead
                if (isDead("player1").confirmed == true) {
                    var deadResult = {
                        id: specData.id1,
                        content: "Player 2's ship has been completely destroyed!  GAME OVER"
                    };
                    printOnce(deadResult);
                };
            } else {
                var atkResult = {
                    id: specData.id1,
                    content: "Player 2 activated their special IMPERIAL DISCIPLINE power, restoring all ammunition but missing their attack."
                };
                printOnce(specResult);
            }
            player2.ammo = 3;

        } else if (player2.name == "Bernkastel") {
            //  activate the bernkastel special

            var ferBoost = (player1.hp / 4) + 5;
            player2.fer += ferBoost;

            var surgeResult = {
                id: specData.id1,
                content: "Player 2 activated their special HOOKSURGE ability, gaining a massive increase to their chance to plunder Player 1!"
            };
            printOnce(surgeResult);

        } else if (player2.name == "Veronica") {
            //  activate the veronica special

            //  This damage might need to be nerfed.  Tested out higher values of random damage, but players were more receptive to lower variances.
            var dmgRoll = dice(8) + 8
            player1.hp -= dmgRoll;

            var hellResult = {
                id: specData.id1,
                content: "Player 2 activated their special HELLFIRE BARRAGE ability, dealing a whopping " + dmgRoll + " damage to Player 1"
            };
            printOnce(hellResult);

            //  Check to see if player1 is dead
            if (isDead("player1").confirmed == true) {
                var deadResult = {
                    id: specData.id1,
                    content: "Player 2's ship has been completely destroyed!  GAME OVER"
                };
                printOnce(deadResult);
            };
        }
    }
});
