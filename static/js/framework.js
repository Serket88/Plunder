/*
    Handles both global variables and event handlers for the buttons.  Anything that involves the user interface framework should go in here.
*/

/*  TODO
        - Create a function that disables a specific ship button
        - Create a function that disables all ship buttons
        - Create a function that disables/enables the special button
        - Create a function that disables/enables all action buttons

        - add a function to add special charge based on the ship and action
        - add special charging functionality
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
    $("#anj_button").prop('disabled', true);
    $("#har_button").prop('disabled', true);
    $("#ber_button").prop('disabled', true);
    $("#ver_button").prop('disabled', true);
}

//  ================  BUTTON CLICK HANDLERS  ================

//  When a button is pressed, take the appropriate data and send it to the server's shipSelect function.

//  TODO -- possibly move the actual ship data server-side

$('#anj_button').click(function() {
    var anjData = {
        id: clientID,
        name: "Anjelita",
        acc: 5,
        hp: 45,
        pow: 2,
        man: 13,
        fer: 3,
        buttonName: "#anj_button"
    };
    socket.emit('shipSelect', anjData);
    console.log(">  " + clientID + " has selected The Anjelita");
});

$('#har_button').click(function() {
    var harData = {
        id: clientID,
        name: "Hartley",
        acc: 6,
        hp: 30,
        pow: 3,
        man: 15,
        fer: 2,
        buttonName: "#har_button"
    };
    socket.emit('shipSelect', harData);
    console.log(">  " + clientID + " has selected The Hartley");
});

$('#ber_button').click(function() {
    var berData = {
        id: clientID,
        name: "Bernkastel",
        acc: 2,
        hp: 30,
        pow: 5,
        man: 13,
        fer: 6,
        buttonName: "#ber_button"
    };
    socket.emit('shipSelect', berData);
    console.log(">  " + clientID + " has selected The Bernkastel");
});

$('#ver_button').click(function() {
    var verData = {
        id: clientID,
        name: "Veronica",
        acc: 5,
        hp: 30,
        pow: 6,
        man: 11,
        fer: 3,
        buttonName: "#ver_button"
    };
    socket.emit('shipSelect', verData);
    console.log(">  " + clientID + " has selected La Veronica");
});

//  When an action is clicked, call the appropriate function

$('#atk_button').click(function() {
    var actData = {
        id1: clientID,
        id2: getOtherId(clientID),
        action: "attack"
    };
    socket.emit('action', actData);
});

$('#repres_button').click(function() {
    var actData = {
        id: clientID,
        action: "repres"
    };
    socket.emit('action', actData);
});

$('#repo_button').click(function() {
    var actData = {
        id: clientID,
        action: "reposition"
    };
    socket.emit('action', actData);
});

$('#pldr_button').click(function() {
    var actData = {
        id1: clientID,
        id2: getOtherId(clientID),
        action: "plunder"
    };
    socket.emit('action', actData);
});

$('#spec_button').click(function() {
    var actData = {
        id1: clientID,
        id2: getOtherId(clientID),
        action: "special"
    };
    socket.emit('action', actData);
});

//  ================  UPDATE HANDLERS  ================

//  DISPLAY MESSAGES
socket.on('dispMsg', function(msg) {
    $('#display').append(msg.content + '\n');
});
