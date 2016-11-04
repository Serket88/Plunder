/*
    Handles both global variables and event handlers for the buttons.  Anything that involves the user interface framework should go in here.
*/

//  ================  GLOBAL VARIABLES  ================

socket = io();

//  ================  BUTTON HANDLERS  ================

//  TODO -- there has got to be a better way to do this.

//  When a ship button is clicked, call select with the appropriate ship passed

$('#anj_button').click({
    var shipType = 'anjelita';
    select(shipType);
});

/*
$('#har_button').click(select(hartley));

$('#ber_button').click(select(bernkastel));

$('#ver_button').click(select(veronica));
*/

//  When an action is clicked, call the appropriate function

$('#atk_button').click(msgTest);

/*
$('#repres_button').click(console.log("repres"));
$('#repo_button').click(reposition);
$('#pldr_button').click(plunder);
$('#spec_button').click(special(ship));
*/

//  ================  UPDATE HANDLERS  ================

function msgTest() {
    var content = 'test message';
    socket.emit('dispMsg', {
        content: content,
    });
    console.log("Message sent to server");
}

function output() {
    socket.on('dispMsg', function(msg) {
        console.log("Message received");
        $('#display').append(msg.content + '\n');
    });
}
