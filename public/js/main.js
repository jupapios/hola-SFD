// AngularJS
function FormController($scope) {
	$scope.valide = false;

	$scope.submit = function(e) {
		this.valide = true;

		if($scope.invitationForm.$valid) {
			// do work!
		}
	}

	$scope.userType = '';
	$scope.emailType = '';
	$scope.passType = '';
}

function InvitationController($scope) {
	$scope.valide = false;

	$scope.submit = function(e) {
		if(socketReady) {
			this.valide = true;

			if($scope.invitationForm.$valid) {
				//socket
				otherId = $scope.userType;
				sendMessage({type: 'invitation', user: otherId, id: myId});
			}
		} else {
			// show waiting
		}
	}

	$scope.userType = '';
}


var socket;
var socketReady = false;

var localVideo;
var remoteVideo;

var localStream;

var pc;
var initiator = 0;


var peerId;

var otherId;
var myId;


function sendMessage(message) {
	var msgString = JSON.stringify(message);
	socket.send(msgString);
}

function waitForRemoteVideo() {
	if (remoteVideo.currentTime > 0) {
		//ok
	} else {
		setTimeout(waitForRemoteVideo, 100);
	}
}


// PC FUNCTINS
function initPeer() {
	//pc = new webkitPeerConnection00("STUN stun.l.google.com:19302", onIceCandidate);
	pc = new webkitPeerConnection00("NONE", onIceCandidate);

	pc.onconnecting = onSessionConnecting;
	pc.onopen = onSessionOpened;
	pc.onaddstream = onRemoteStreamAdded;
	pc.onremovestream = onRemoteStreamRemoved;


	pc.addStream(localStream);

	if(initiator) {
		doCall();
	}
}

function onIceCandidate(candidate, moreToFollow) {
	if (candidate) {
		sendMessage({type: 'candidate', label: candidate.label, candidate: candidate.toSdp(),  id: otherId});
	}	
	if (!moreToFollow) {
		console.log("End of candidates.");
	}
}

function onSessionConnecting(message) {
	console.log("Session connecting.");
}

function onSessionOpened(message) {
	console.log("Session opened.");
}

function onRemoteStreamAdded(message) {
	console.log("Stream added.");
	var url = webkitURL.createObjectURL(event.stream);
	remoteVideo.src = url;
	waitForRemoteVideo();
}

function onRemoteStreamRemoved(message) {
	
}

function processSignalingMessage(message) {

}

function doCall() {
	var offer = pc.createOffer({audio:true, video:true});
	pc.setLocalDescription(pc.SDP_OFFER, offer);
	console.log("Send offer to peer",'type: offer', 'sdp:', offer.toSdp(), 'peer:', otherId, 'caller' ,myId);
	sendMessage({type: 'offer', sdp: offer.toSdp(), id: otherId, caller: myId});
	pc.startIce();
}

function doAnswer() {
	console.log("Send answer to peer");
	var offer = pc.remoteDescription;
	var answer = pc.createAnswer(offer.toSdp(), {audio:true,video:true});
	pc.setLocalDescription(pc.SDP_ANSWER, answer);
	sendMessage({type: 'answer', sdp: answer.toSdp(), id: otherId});
	pc.startIce();
}



// User media FUNCTIONS
function getUserMedia() {
	navigator.webkitGetUserMedia({audio:true, video:true}, onUserMediaSuccess, onUserMediaError);
}

function onUserMediaSuccess(stream) {
	var url = webkitURL.createObjectURL(stream);
	localVideo.src = url;
	localStream = stream;

	//init Peer's Magic :_)
	if(initiator) {
		initPeer();	
	}
}

function onUserMediaError(message) {
	console.log(message);
}

function init() {
	socket = new WebSocket('ws://hola.jit.su/');
	//socket = new WebSocket('ws://192.168.1.130:3000/');

	socket.onopen = function () {
		socketReady = true;

		localVideo = document.getElementById('video-local');
		remoteVideo = document.getElementById('video-remote');
		getUserMedia();

		myId = document.getElementById('peerId').dataset.id;
		
		if(myId) {
			sendMessage({type: 'join', id: myId});
		}

		// link cuando se es invitado
		var invitationElement = document.getElementById('invitation');

		invitationElement.querySelector('a').addEventListener('click', function() {
			invitationElement.className = 'hidden';
			sendMessage({type: 'accept', id: otherId});
			initiator = 1;
			initPeer();
		});

	}

	socket.onmessage = function (message) {
		var data = JSON.parse(message.data);
		var type = data.type;

		if(type == 'invitation') {

			var invitationElement = document.getElementById('invitation');
			invitationElement.querySelector('#user').innerText = data.id;
			invitationElement.className = '';

			otherId = data.id;

		} else if(type == 'accept') {
			initPeer();
		} else if(type == 'error') {

			var inputElement = document.querySelector('input[type="text"]');
			inputElement.className = '';
			inputElement.className = 'error';

		} else if(type == 'offer') {
			otherId = data.caller;
			console.log('Socker Rec: offer '+otherId);
			initPeer();

			pc.setRemoteDescription(pc.SDP_OFFER, new SessionDescription(data.sdp));
			doAnswer();
		} else if(type == 'answer') {
			console.log('Socket Rec: answer');
			pc.setRemoteDescription(pc.SDP_ANSWER, new SessionDescription(data.sdp));
		} else if(type == 'candidate') {
			var candidate = new IceCandidate(data.label, data.candidate);
			pc.processIceMessage(candidate);
		}
	}

}