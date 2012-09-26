// AngularJS
function FormController($scope) {
	$scope.valide = false;

	$scope.submit = function(e) {
		this.valide = true;
		return false;
	}

	$scope.userType = '';
	$scope.emailType = '';
	$scope.passType = '';
}



var localVideo = document.getElementById('video-local');
var remoteVideo = document.getElementById('video-remote');

    var localStream, pc, ws;

    // functions for getUserMedia...
    ////////////////////////////////////
    function getUserMedia(){
      navigator.webkitGetUserMedia({video: true, audio: true, toString: function(){return "video,audio"}}, onGUMSuccess, onGUMError);
    }

    function onGUMSuccess(stream){
      logger("GetUserMedia() Succeed");
      var url = webkitURL.createObjectURL(stream);
     	localVideo.src = url;
      localStream = stream;

        createPeerConnection();
    }
    function onGUMError(e) {
      console.log("GetUserMedia Error"+e);
    }

    function createPeerConnection() {
      logger("attempt to create peerConnection");
      // pc = new webkitPeerConnection("STUN stun.l.google.com:19302", onSignalingMessage);
      pc = new webkitDeprecatedPeerConnection("STUN stun.l.google.com:19302", onSignalingMessage);

      pc.addStream(localStream);

      // set handlers for peerconnection events
      pc.onconnecting = onSessionConnecting;
      pc.onopen = onSessionOpened;
      pc.onaddstream = onRemoteStreamAdded;
      pc.onremovestream = onRemoteStreamRemoved;
    }

    function onSignalingMessage(mesg) {
      logger("receive signaling message");

      // send SDP message to session server.
      //////////////////////////////////////

      sendMessage(mesg);
    }

    function sendMessage(data) {
      logger("=====================================");
      logger("C=>S");
      logger("---");
      logger(data);
      logger("=====================================");

      ws.send(data);
    }

    // Handlers for peerconnection events.
    ///////////////////////////////////////
    function onSessionConnecting(e) {
      logger("onSessionConnecting...");
    }

    function onSessionOpened(e) {
      logger("onSessionOpened...");
    }

    function onRemoteStreamAdded(e) {
      logger("onRemoteStreamAdded...");

      var url = webkitURL.createObjectURL(event.stream);
      remoteVideo.src = url;
    }

    function onRemoteStreamRemoved(e) {
      logger("onRemoteStreamRemoved...");
    }



    // WebSocket
    ////////////////////////////////

    function startWebSocketConnection() {
      ws = new WebSocket("ws://192.168.1.24:3000");

      ws.onopen = function(e){
        console.log("websocket connection created");

        getUserMedia();
      }

      ws.onmessage = function(e){
        logger("=====================================");
        logger("S=>C");
        logger("---");
        logger(e.data);
        logger("=====================================");


        if(!!pc === false) {
          createPeerConnection();
        }

        pc.processSignalingMessage(e.data);
      }
    }


    // utility
    function logger(str){
     console.log(str+"\n");
    }

    function initMedia(){
      startWebSocketConnection();
    }


/*
// UserMedia
window.URL = window.URL || window.webkitURL;
navigator.getUserMedia  = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

// PeerConnection window.webkitPeerConnection00?
window.peerConnection = window.webkitPeerConnection00 || window.webkitPeerConnection;

var localVideo = document.getElementById('video-local');
var remoteVideo = document.getElementById('video-remote');

var socket;

function onMessage(evt) {
    console.log("RECEIVED: "+evt.data);

    console.log('Processing signaling message...');
    peerConn.processSignalingMessage(evt.data);
}

var peerConn;
var localStream;

function fallback(e) {
	console.log('ERROR:', e);
}

function success(stream) {
		// remote video
		peerConn = new peerConnection("NONE", onSignal);

		peerConn.onstatechange = function (evt) {
            console.debug("__on_state_change");
        }
        peerConn.onopen = function (evt) {
            console.debug("__on_open");
        }
        peerConn.onaddstream = function (evt) {
            console.debug("__on_add_stream");
        }
        peerConn.onremovestream = function (evt) {
            console.debug("__on_remove_stream");
        }
        peerConn.addEventListener("addstream", onRemoteStreamAdded, false);
    	//peerConn.addEventListener("removestream", onRemoteStreamRemoved, false)

	localVideo.src = window.URL.createObjectURL(stream);
	localStream = stream;
}

function onSignal(message) {
	peerConn.addStream = localStream;
	//console.log('onSignal', arguments);
	socket = new WebSocket('ws://192.168.1.24:3000/');
	socket.onopen = function () {
		socket.addEventListener("message", onMessage, false);
		socket.send(message);
	}
}
function onRemoteStreamAdded(event) {
	//console.log('onRemoteStreamAdded', arguments);
	remoteVideo.src = window.URL.createObjectURL(event.stream);
}

function initMedia() {
	if (!navigator.getUserMedia) {
		fallback();
	} else {

		navigator.getUserMedia({video: true, audio: true}, success, fallback);		
		//peerConn.onaddstream = onRemoteStreamAdded;

	}
}*/