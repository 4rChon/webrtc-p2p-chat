'use strict';

var errorElement = document.querySelector('#errorMsg');
var status = document.querySelector('#status');
var peerId = document.querySelector('#peerId');

var constraints = window.constraints = {
    audio: true, 
    video: false
};

var peer = new Peer(
    'testId_' + Date.now(),
    {
        debug: 3,
        host: 'localhost',
        port: 9000,
        config: {'iceServers': [
            {url:'stun:stun.l.google.com:19302'},
            {
                url: 'turn:numb.viagenie.ca',
                credential: 'muazkh',
                username: 'webrtc@live.com'
            }
        ]}
    }
);

status.innerHTML = "Retrieving id";
peerId.innerHTML = peer.id;

peer.on('open', function(id) {        
    peerId.innerHTML = id;
    console.log('My peer ID is: ' + id);
});

var connections = peer.connections;

peer.on('connection', function (data) {
    status.innerHTML = "Connected";
});

document.getElementById('connect').addEventListener('click', function () {
    status.innerHTML = "Connecting";
    var otherId = document.getElementById('otherId').value;
    peer.connect(otherId);
});

document.getElementById('send').addEventListener('click', function () {
    status.innerHTML = "Sending";
    var yourMessage = document.getElementById('yourMessage').value;
    for(var conn in peer.connections){
        console.log(connections[conn][0]);
        connections[conn][0].send(yourMessage);
        connections[conn][0].on('open', function() {
            console.log('Open Connection');
            connections[conn][0].on('data', function(data) {
                console.log('Received Data');
                status.innerHTML = "Receiving Data";
                document.getElementById('messages').textContent += data + '\n';
            });
        });
    }
});

function handleError(error) {
    if (error.name === 'ConstraintNotSatisfiedError') {
        errorMsg('The resolution ' + constraints.video.width.exact + 'x' +
            constraints.video.width.exact + ' px is not supported by your device.');
    } else if (error.name === 'PerissionDeniedError') {
        errorMsg('Permissions have not been granted to use your camera and ' +
            'microphone, you need to allow the page access to your devices in ' +
            'order for the connection to work.');
    }
    errorMsg('getUserMedia error: ' + error.name, error);
}

function errorMsg(msg, error) {
    errorElement.innerHTML = msg;
    if(typeof error !== 'undefined') {
        console.error("ERROR: " + error);
    }
}
