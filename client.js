'use strict';

var constraints = window.constraints = {
    audio: true, 
    video: false
};

var username = "";

var peer = new Peer(
    'id_' + (Date.now()+'').slice(6),
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
        ]},
        logFunction: function() {
            var copy = Array.prototype.slice.call(arguments).join(' ');
            $('.log').append(copy + '<br>');
        }
    }
);

$('#status').text("Retrieving ID");

var connectedPeers = {};

peer.on('open', function(id) {        
    $('#peerId').val(id);
    username = id;
});

peer.on('connection', connect);

peer.on('error', function(err) {
    $('#errorMsg').text(err);
    console.log(err);
})


function connect(c) {
    if(c.label === 'chat') {
        $('#status').text("Connected");
        var connection = $('<li></li>').addClass('connection').addClass('active').attr('id', c.peer).html(c.peer);        
        var header = $('<div></div>').html('Chat with <strong>' + c.peer + '</strong>');
        var connStatus = $('<div><em>Peer connected.</em></div>');
        $('#connections').append(connection);
        $('#messages').append(connStatus);
        $('#messages').append(header);
        
        c.on('data', function(data) {
            console.log(c);
            $('#messages').append('<div><span class="peer">' + c.peer + '</span>: ' + data + '</div>');
        });
        c.on('close', function() {
            $('#messages').append(c.peer + ' has left the chat.');
            $('.connection:contains(' + c.peer + ')').remove();
            delete connectedPeers[c.peer];
        })
    }
    connectedPeers[c.peer] = 1;
}

$('#connect').click(function () {
    $('#status').text("Connecting");
    var requestedPeer = $('#otherId').val();
    if(!connectedPeers[requestedPeer]){
        var c = peer.connect(requestedPeer, {
            label: 'chat',
            serialization: 'none',
            metadata: {user: username}
        });
    }
    c.on('open', function() {
        connect(c);
    });
    c.on('error', function(err) {$('#errorMsg').text(err); });
    var otherId = $('#otherId').val();
});

$('#disconnect').click(function() {
    eachActiveConnection(function(c) {
        c.close();
    });
    $('#connections').empty();
});

$('#send').click(function(e) {
    e.preventDefault();

    var msg = $('#text').val();
    eachActiveConnection(function(c, $c) {
        if (c.label === 'chat'){
            c.send(msg);
            $('#messages').append('<div><span class="you">You: </span>' + msg + '</div>');
        }
    });
    $('#text').val('');
    $('#text').focus();
})

function eachActiveConnection(fn) {
    var actives = $('.active');
    var checkedIds = {};
    actives.each(function() {
        var peerId = $(this).attr('id');

        if(!checkedIds[peerId]) {
            var conns = peer.connections[peerId];
            for (var i = 0, ii = conns.length; i < ii; i += 1) {
                var conn = conns[i];
                fn(conn, $(this));
            }
        }

        checkedIds[peerId] = 1;
    })
}

window.onunload = window.onbeforeunnload = function(e) {
    if(!!peer && !peer.destroyed) {
        peer.destroy();
    }
};

$("#copy").click(function() {
    var target = document.getElementById('peerId');
    target.focus();
    target.setSelectionRange(0, target.value.length);
    document.execCommand("copy");
})

$("#confirm").click(function() {
    username = $('#alias').val();
    $('#alias').attr("placeholder", username);
})
