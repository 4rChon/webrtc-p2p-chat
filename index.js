'use strict';

var errorElement = document.querySelector('#errorMsg');
var status = document.querySelector('#status');

var constraints = window.constraints = {
    audio: false, 
    video: true
};

function handleSuccess(stream) {
    var Peer = require('simple-peer');
    var peer = new Peer({
        initiator: location.hash === '#init',
        trickle: false,
        stream: stream
    });

    peer.on('signal', function (data) {
        status.innerHTML = "Status: signalling";
        document.getElementById('yourId').value = JSON.stringify(data);
    });

    document.getElementById('connect').addEventListener('click', function () {
        status.innerHTML = "Status: connecting";
        var otherId = JSON.parse(document.getElementById('otherId').value);
        peer.signal(otherId);
    });

    document.getElementById('send').addEventListener('click', function () {
        status.innerHTML = "Status: sending";
        var yourMessage = document.getElementById('yourMessage').value;
        peer.send(yourMessage);
    });

    peer.on('data', function (data) {
        status.innerHTML = "Status: receiving data";
        document.getElementById('messages').textContent += data + '\n';
    });

    peer.on('stream', function (stream) {
        status.innerHTML = "Status: receiving stream";
        var videoTracks = stream.getVideoTracks();
        var videoContainer = document.getElementById('videoContainer');
        var video = document.createElement('video');
        videoContainer.appendChild(video);

        console.log('Got stream with constraints: ', constraints);
        console.log('Using video device: ' + videoTracks[0].label);

        window.stream = stream;
        video.src = window.URL.createObjectURL(stream)
        video.play()
    });
} 

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
    errorElement.innerHTML += '<p>' + msg + '</p>';
    if(typeof error !== 'undefined') {
        console.error("Error: " + error);
    }
}

var p = navigator.mediaDevices.getUserMedia(constraints)
    .then(handleSuccess).catch(handleError);    
