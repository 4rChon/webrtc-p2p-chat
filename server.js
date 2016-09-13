var PeerServer = require('peer').PeerServer;
var server = PeerServer({port: 9000});

server.on('connection', function(id) {
    console.log('Client ' + id + ' connected.');
})

server.on('disconnect', function(id) {
    console.log('Client ' + id + ' disconnected');
})

//console.log(server._clients);

server.on('error', function(err) {
    console.log('ERROR: ' + err);
})