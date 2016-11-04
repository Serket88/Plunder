function select(shipType) {
    socket.emit('dispMsg', {
        content: shipType,
    });
}

function action(actType) {
    socket.emit('dispMsg', {
        content: actType,
    });
}
