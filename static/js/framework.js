/*
    Handles both global variables and event handlers for the buttons.  Anything that involves the user interface framework should go in here.
*/

/*  TODO


        - Create a default background VERY QUICKLY

        - make more feedback for ship selection
*/

//  ================  GLOBAL VARIABLES  ================

socket = io();

//  ================  HELPER FUNCTIONS  ================

function getOtherId(localId) {
    if (clientID == "player1") {
        return "player2";
    } else {
        return "player1";
    }
}

function disableShips() {
    $(".shipButton").prop('disabled', true);
}

function disableActions() {
    console.log("Actions disabled");
    $(".actButton").prop('disabled', true);
    $(".actHover").prop('hidden', false);
}

function enableActions() {
    console.log("Actions enabled");
    $("#atk_button").prop('disabled', false);
    $("#repres_button").prop('disabled', false);
    $("#repo_button").prop('disabled', false);
    $("#pldr_button").prop('disabled', false);
    if (specialActive == true) {
        $("#spec_button").prop('disabled', false);
    }

    $("#atkHover").prop('hidden', true);
    $("#represHover").prop('hidden', true);
    $("#repoHover").prop('hidden', true);
    $("#pldrHover").prop('hidden', true);
    if (specialActive == true) {
        $("#specHover").prop('hidden', true);
    }
}

function hideShips() {
    $(".shipButton").prop('hidden', true);
}

function showActions() {
    $(".actButton").prop('hidden', false);
    $(".oppBar").prop('hidden', false);
    $(".ownBar").prop('hidden', false);
    $("#display").prop('hidden', false);
    $("#moveDesc").prop('hidden', false);
    $("#altFeedback").prop('hidden', false);
}

//  ================  PROBABILITY FUNCTIONS  ================

function atkProb() {
    if (clientID == "player1") {
        var target = player2.man - player1.acc;
        var prob = (21 - target) * 5;
        return prob;
    } else if (clientID == "player2") {
        var target = player1.man - player2.acc;
        var prob = (21 - target) * 5;
        return prob;
    }
}

function plunProb() {
    if (clientID == "player1") {
        var target = (10 + player2.fer) - (player1.fer - (player2.hp / 2));
        var prob = (21 - target) * 5;
        return prob;
    } else if (clientID == "player2") {
        var target = (10 + player1.man) - (player2.fer - (player1.hp / 2));
        var prob = (21 - target) * 5;
        return prob;
    }
}

//  ================  BUTTON CLICK HANDLERS  ================

//  When a button is pressed, take the appropriate data and send it to the server's shipSelect function.

//  TODO -- possibly move the actual ship data server-side

$('#anj_button').click(function() {
    var anjData = {
        id: clientID,
        name: "The Anjelita",
        acc: 5,
        hp: 45,
        pow: 2,
        man: 13,
        fer: 3,
        atkCharge: 15,
        represCharge: 35,
        repoCharge: 20,
        buttonName: "#anj_button"
    };
    socket.emit('shipSelect', anjData);
    console.log(">  " + clientID + " has selected The Anjelita");
});

$('#har_button').click(function() {
    var harData = {
        id: clientID,
        name: "The Hartley",
        acc: 6,
        hp: 30,
        pow: 3,
        man: 15,
        fer: 2,
        atkCharge: 35,
        represCharge: 20,
        repoCharge: 15,
        buttonName: "#har_button"
    };
    socket.emit('shipSelect', harData);
    console.log(">  " + clientID + " has selected The Hartley");
});

$('#ber_button').click(function() {
    var berData = {
        id: clientID,
        name: "The Bernkastel",
        acc: 2,
        hp: 30,
        pow: 5,
        man: 13,
        fer: 6,
        atkCharge: 15,
        represCharge: 20,
        repoCharge: 35,
        buttonName: "#ber_button"
    };
    socket.emit('shipSelect', berData);
    console.log(">  " + clientID + " has selected The Bernkastel");
});

$('#ver_button').click(function() {
    var verData = {
        id: clientID,
        name: "La Verónica",
        acc: 5,
        hp: 30,
        pow: 6,
        man: 11,
        fer: 3,
        atkCharge: 35,
        represCharge: 15,
        repoCharge: 20,
        buttonName: "#ver_button"
    };
    socket.emit('shipSelect', verData);
    console.log(">  " + clientID + " has selected La Verónica ");
});

//  When an action is clicked, call the appropriate function

$('#atk_button').click(function() {
    console.log("> " + clientID + "has attacked");

    if (clientID == "player1") {
        //  Player 1 is attacking Player 2
        if (!specialFull) {
            player1.charge += player1.atkCharge;
            if (player1.charge >= 100) {
                specialFull = true;
                player1.charge = 100;
            }
        }

        if (player1.ammo == 0) {
            //  Out of ammo; refund turn
            var atkResult = {
                id: clientID,
                content: "Player 1 attempted to attack, but doesn't have enough ammo.  Perhaps now is a good time to Repair & Restock?"
            };
            printOnce(atkResult);
            return;
        }

        //  Check for reposition flipping
        repoFlip();

        //  Perform attack roll
        var atkRoll = dice(20) + player1.acc;
        player1.ammo--;

        //  Proceed if a hit occurs
        if (atkRoll >= player2.man) {

            //  Roll damage
            var dmgRoll = dice(8) + player1.pow;
            player2.hp -= dmgRoll;

            //  send to server
            var atkResult = {
                id: clientID,
                content: "Player 1 attacked and successfully hit Player 2, dealing " + dmgRoll + " damage!"
            };
            printOnce(atkResult);

            //  check if player2 is dead
            if (isDead("player2").confirmed == true) {
                var deadResult = {
                    id: clientID,
                    content: "Player 1's ship has been completely destroyed!  GAME OVER"
                };
                printOnce(deadResult);
                socket.emit('gameOver', deadResult);
            };

        } else {
            //  send to server
            var atkResult = {
                id: clientID,
                content: "Player 1 attacked Player 2 and missed, dealing no damage"
            };
            printOnce(atkResult);
        }
    } else if (clientID == "player2") {
        //  Player 2 is attacking Player 1
        if (!specialFull) {
            player2.charge += player2.atkCharge;
            if (player2.charge >= 100) {
                specialFull = true;
                player2.charge = 100;
            }
        }

        if (player2.ammo == 0) {
            var atkResult = {
                id: clientID,
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
                id: clientID,
                content: "Player 2 attacked and successfully hit Player 1, dealing " + dmgRoll + " damage!"
            };
            printOnce(atkResult);

            //  check if player1 is dead
            if (isDead("player1").confirmed == true) {
                var deadResult = {
                    id: clientID,
                    content: "Player 2's ship has been completely destroyed!  GAME OVER"
                };
                printOnce(deadResult);
                socket.emit('gameOver', deadResult);
            };
        } else {
            //  send to server
            var atkResult = {
                id: clientID,
                content: "Player 2 attacked Player 1 and missed, dealing no damage"
            };
            printOnce(atkResult);
        }
    }
    disableActions();

    var actData = {
        actor: clientID,
        p1: player1,
        p2: player2,
        action: "attack"
    }

    socket.emit('action', actData);
});

$('#repres_button').click(function() {
    //  Check for reposition flipping
    repoFlip();

    if (clientID == "player1") {
        //  Player 1 is taking the repres action
        if (!specialFull) {
            player1.charge += player1.represCharge;
            if (player1.charge >= 100) {
                specialFull = true;
                player1.charge = 100;
            }
        }

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
            id: clientID,
            content: "Player 1 repaired and restocked their ship, gaining " + repVal + " hit points"
        };
        printOnce(represResult);

    } else if (clientID == "player2") {
        //  Player 2 is taking the repres action
        if (!specialFull) {
            player2.charge += player2.represCharge;
            if (player2.charge >= 100) {
                specialFull = true;
                player2.charge = 100;
            }
        }

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
            repVal = repRoll;
            player2.hp += repRoll;
        }

        var represResult = {
            id: clientID,
            content: "Player 2 repaired and restocked their ship, gaining " + repVal + " hit points"
        };
        printOnce(represResult);

    }
    disableActions();

    var actData = {
        actor: clientID,
        p1: player1,
        p2: player2,
        action: "repres"
    };
    socket.emit('action', actData);
});

$('#repo_button').click(function() {
    if (clientID == "player1") {
        //  Player 1 is taking the reposition action
        if (!specialFull) {
            player1.charge += player1.repoCharge;
            if (player1.charge >= 100) {
                specialFull = true;
                player1.charge = 100;
            }
        }

        player1.acc += 2;
        player1.man += 2;
        player1.repo = 1;
        player1.status = "Advantageous";

        var repoResult = {
            id: clientID,
            content: "Player 1 repositioned their ship, gaining a bonus to accuracy and maneuverability for the next turn"
        };
        printOnce(repoResult);

    } else if (clientID == "player2") {
        //  Player 2 is taking the reposition action
        if (!specialFull) {
            player2.charge += player2.repoCharge;
            if (player2.charge >= 100) {
                specialFull = true;
                player2.charge = 100;
            }
        }

        player2.acc += 2;
        player2.man += 2;
        player2.repo = 1;
        player2.status = "Advantageous";

        var repoResult = {
            id: clientID,
            content: "Player 2 repositioned their ship, gaining a bonus to accuracy and maneuverability for the next turn"
        };
        printOnce(repoResult);
    }
    disableActions();

    var actData = {
        actor: clientID,
        p1: player1,
        p2: player2,
        action: "reposition"
    };
    socket.emit('action', actData);
});

$('#pldr_button').click(function() {
    //  Check for reposition flipping
    repoFlip();

    if (clientID == "player1") {
        //  Player 1 is attempting to plunder Player 2
        var plunRoll = dice(20) + player1.fer - (player2.hp / 2);

        if (plunRoll >= (10 + player2.fer)) {
            //  PLAYER 1 WINS
            var plunResult = {
                id: clientID,
                content: "PLAYER 1 WINS THE GAME!!!  They successfully plundered Player 2!"
            };
            printOnce(plunResult);
            socket.emit('gameOver', plunResult);
        } else {
            //  Player 1 failed to plunder
            var plunResult = {
                id: clientID,
                content: "Player 1 attempted to plunder Player 2, but failed to succeed!"
            };
            printOnce(plunResult);
        }
    } else if (clientID == "player2") {
        //  Player 2 is attempting to plunder Player 1
        var plunRoll = dice(20) + player2.fer - (player1.hp / 2);

        if (plunRoll >= (10 + player1.fer)) {
            //  PLAYER 2 WINS
            var plunResult = {
                id: clientID,
                content: "PLAYER 2 WINS THE GAME!!!  They successfully plundered Player 1!"
            };
            printOnce(plunResult);
            socket.emit('gameOver', plunResult);
        } else {
            //  Player 2 failed to plunder
            var plunResult = {
                id: clientID,
                content: "Player 2 attempted to plunder Player 1, but failed to succeed!"
            };
            printOnce(plunResult);
        }
    }
    disableActions();

    var actData = {
        actor: clientID,
        p1: player1,
        p2: player2,
        action: "plunder"
    };
    socket.emit('action', actData);
});

$('#spec_button').click(function() {
    console.log("> " + clientID + "has taken the special action");

    if (clientID == "player1") {
        //  Player 1 is using the special
        player1.charge = 0;

        if (player1.name == "The Anjelita") {
            //  activate anjelita special
            var resto = (player1.maxHp - player1.hp) * 0.75;
            player1.hp += resto;

            var specResult = {
                id: clientID,
                content: "Player 1 activated their special RESTORATION ability, repairing " + resto + " hit points"
            };
            printOnce(specResult);

        } else if (player1.name == "The Hartley") {
            //  activate the hartley special
            var atkRoll = dice(20) + player1.acc;

            if (atkRoll >= player2.man) {
                var dmgRoll = dice(8) + player1.pow + 4;
                player2.hp -= dmgRoll;

                var atkResult = {
                    id: clientID,
                    content: "Player 1 activated their special IMPERIAL DISCIPLINE power, dealing " + dmgRoll + " damage to Player 2 and restocking all ammunition"
                };
                printOnce(atkResult);

                //  Check to see if player2 is dead
                if (isDead("player2").confirmed == true) {
                    var deadResult = {
                        id: clientID,
                        content: "Player 1's ship has been completely destroyed!  GAME OVER"
                    };
                    printOnce(deadResult);
                    socket.emit('gameOver', deadResult);
                };
            } else {
                var atkResult = {
                    id: clientID,
                    content: "Player 1 activated their special IMPERIAL DISCIPLINE power, restoring all ammunition but missing their attack."
                };
                printOnce(specResult);
            }
            player1.ammo = 3;

        } else if (player1.name == "The Bernkastel") {
            //  activate the bernkastel special

            var ferBoost = (player2.hp / 4) + 5;
            player1.fer += ferBoost;
            player2.status = "Vulnerable";

            var surgeResult = {
                id: clientID,
                content: "Player 1 activated their special HOOKSURGE ability, gaining a massive increase to their chance to plunder Player 2!"
            };
            printOnce(surgeResult);

        } else if (player1.name == "La Verónica") {
            //  activate the veronica special

            //  This damage might need to be nerfed.  Tested out higher values of random damage, but players were more receptive to lower variances.
            var dmgRoll = dice(8) + 8
            player2.hp -= dmgRoll;

            var hellResult = {
                id: clientID,
                content: "Player 1 activated their special HELLFIRE BARRAGE ability, dealing a whopping " + dmgRoll + " damage to Player 2"
            };
            printOnce(hellResult);

            //  Check to see if player2 is dead
            if (isDead("player2").confirmed == true) {
                var deadResult = {
                    id: clientID,
                    content: "Player 1's ship has been completely destroyed!  GAME OVER"
                };
                printOnce(deadResult);
                socket.emit('gameOver', deadResult);
            };
        }
    } else if (clientID == "player2") {
        //  Player 2 is using the special
        player2.charge = 0;

        if (player2.name == "The Anjelita") {
            //  activate anjelita special
            var resto = (player2.maxHp - player2.hp) * 0.75;
            player2.hp += resto;

            var specResult = {
                id: clientID,
                content: "Player 2 activated their special RESTORATION ability, repairing " + resto + " hit points"
            };
            printOnce(specResult);

        } else if (player2.name == "The Hartley") {
            //  activate the hartley special
            var atkRoll = dice(20) + player2.acc;

            if (atkRoll >= player1.man) {
                var dmgRoll = dice(8) + player2.pow + 4;
                player1.hp -= dmgRoll;

                var atkResult = {
                    id: clientID,
                    content: "Player 2 activated their special IMPERIAL DISCIPLINE power, dealing " + dmgRoll + " damage to Player 1 and restocking all ammunition"
                };
                printOnce(atkResult);

                //  Check to see if player1 is dead
                if (isDead("player1").confirmed == true) {
                    var deadResult = {
                        id: clientID,
                        content: "Player 2's ship has been completely destroyed!  GAME OVER"
                    };
                    printOnce(deadResult);
                    socket.emit('gameOver', deadResult);
                };
            } else {
                var atkResult = {
                    id: clientID,
                    content: "Player 2 activated their special IMPERIAL DISCIPLINE power, restoring all ammunition but missing their attack."
                };
                printOnce(specResult);
            }
            player2.ammo = 3;

        } else if (player2.name == "The Bernkastel") {
            //  activate the bernkastel special

            var ferBoost = (player1.hp / 4) + 5;
            player2.fer += ferBoost;
            player1.status = "Vulnerable";

            var surgeResult = {
                id: clientID,
                content: "Player 2 activated their special HOOKSURGE ability, gaining a massive increase to their chance to plunder Player 1!"
            };
            printOnce(surgeResult);

        } else if (player2.name == "La Verónica") {
            //  activate the veronica special

            //  This damage might need to be nerfed.  Tested out higher values of random damage, but players were more receptive to lower variances.
            var dmgRoll = dice(8) + 8
            player1.hp -= dmgRoll;

            var hellResult = {
                id: clientID,
                content: "Player 2 activated their special HELLFIRE BARRAGE ability, dealing a whopping " + dmgRoll + " damage to Player 1"
            };
            printOnce(hellResult);

            //  Check to see if player1 is dead
            if (isDead("player1").confirmed == true) {
                var deadResult = {
                    id: clientID,
                    content: "Player 2's ship has been completely destroyed!  GAME OVER"
                };
                printOnce(deadResult);
                socket.emit('gameOver', deadResult);
            };
        }
    }
    specialActive = false;
    specialUsed = true;
    disableActions();

    var actData = {
        actor: clientID,
        p1: player1,
        p2: player2,
        action: "special"
    };
    socket.emit('action', actData);
});

//  ================  SHIP HOVER HANDLERS  ================

//  Change to actual stat backgrounds

$('#anj_button').hover(function() {
    document.body.style.backgroundImage = "url(../img/anjelita_title.jpg)";
}, function() {
    document.body.style.backgroundImage = "url(../img/default_title.jpg)";
});

$('#har_button').hover(function() {
    document.body.style.backgroundImage = "url(../img/hartley_title.jpg)";
}, function() {
    document.body.style.backgroundImage = "url(../img/default_title.jpg)";
});

$('#ber_button').hover(function() {
    document.body.style.backgroundImage = "url(../img/bernkastel_title.jpg)";
}, function() {
    document.body.style.backgroundImage = "url(../img/default_title.jpg)";
});

$('#ver_button').hover(function() {
    document.body.style.backgroundImage = "url(../img/veronica_title.jpg)";
}, function() {
    document.body.style.backgroundImage = "url(../img/default_title.jpg)";
});

//  Move descriptions / probabilities

function hoverOff() {
    var defText = "Attack the enemy ship and plunder them for riches beyond your wildest dreams!\n\nThe lower your opponent's health, the better your chances will be for successfully plundering them.  Beware!  If you destroy your enemy completely, you will both lose the game.";
    $('#moveDesc').text(defText);
}

function attackHov() {
    var atkText = "Attack!\n\nFire your broadsides at the enemy.  If you hit, take out a portion of their health!  You currently have a " + atkProb() + "% chance of hitting the enemy.";
    $('#moveDesc').text(atkText);
}

function represHov() {
    var represText = "Repair & Restock!\n\nRepair 2-12 HP and gain 2 ammo.";
    $('#moveDesc').text(represText);
}

function repoHov() {
    var repoText = "Reposition!\n\nReposition your ship to gain a bonus to accuracy and maneuverability until the end of your next turn.";
    $('#moveDesc').text(repoText);
}

function pldrHov() {
    var pldrText = "Plunder!\n\nAttempt to board and pillage your opponent!  The more damaged they are, the better your chances.  You currently have a " + plunProb() + "% chance of plundering them and winning the game.";
    $('#moveDesc').text(pldrText);
}

function specHov() {
    var specText = {};
    if (clientID == "player1") {
        if (player1.name == "The Anjelita") {
            specText = "Restoration!\n\nActivate your special ability to restore 75% of the damage you have taken.  (Can only be used once)";
        } else if (player1.name == "The Hartley") {
            specText = "Imperial Discipline!\n\nActivate your special ability to instantly reload all cannons and let loose an attack.  (Can only be used once)";
        } else if (player1.name == "The Bernkastel") {
            specText = "Hooksurge!\n\nActivate your special ability to launch harpoons at your opponent and pull them closer, boosting your chances of being able to plunder them permanently.  (Can only be used once)";
        } else if (player1.name == "La Verónica") {
            specText = "Hellfire Barrage!\n\nActivate your special ability to unleash an inferno of cannonfire upon your opponent, dealing massive damage.  (Can only be used once)";
        }
    } else if (clientID == "player2") {
        if (player2.name == "The Anjelita") {
            specText = "Restoration!\n\nActivate your special ability to restore 75% of the damage you have taken.  (Can only be used once)";
        } else if (player2.name == "The Hartley") {
            specText = "Imperial Discipline!\n\nActivate your special ability to instantly reload all cannons and let loose an attack.  (Can only be used once)";
        } else if (player2.name == "The Bernkastel") {
            specText = "Hooksurge!\n\nActivate your special ability to launch harpoons at your opponent and pull them closer, boosting your chances of being able to plunder them permanently.  (Can only be used once)";
        } else if (player2.name == "La Verónica") {
            specText = "Hellfire Barrage!\n\nActivate your special ability to unleash an inferno of cannonfire upon your opponent, dealing massive damage.  (Can only be used once)";
        }
    }
    $('#moveDesc').text(specText);
}

$('#atkHover').hover(attackHov, hoverOff);
$('#atk_button').hover(attackHov, hoverOff);

$('#represHover').hover(represHov, hoverOff);
$('#repres_button').hover(represHov, hoverOff);

$('#repoHover').hover(repoHov, hoverOff);
$('#repo_button').hover(repoHov, hoverOff);

$('#pldrHover').hover(pldrHov, hoverOff);
$('#pldr_button').hover(pldrHov, hoverOff);

$('#specHover').hover(specHov, hoverOff);
$('#spec_button').hover(specHov, hoverOff);

//  ================  UPDATE HANDLERS  ================

//  DISPLAY MESSAGES
socket.on('dispMsg', function(msg) {
    $("#altFeedback").text(msg.content);
    //$('#display').append(msg.content + '\n');
});

socket.on('contextSwitch', function(data) {
    document.body.style.backgroundImage = "url(../img/core-screen_blank.jpg)";
    $("#core_commands").prop("disabled", false);
    hideShips();
    showActions();
});
