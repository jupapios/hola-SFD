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


var socket;

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
	console.log('C->S: ' + msgString);
	socket.send(msgString);
}

function waitForRemoteVideo() {
	if (remoteVideo.currentTime > 0) {
		console.log('LISTO!');
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
		sendMessage({type: 'candidate', label: candidate.label, candidate: candidate.toSdp(),  peer: otherId});
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
	sendMessage({type: 'offer', sdp: offer.toSdp(), peer: otherId, caller: myId});
	pc.startIce();
}

function doAnswer() {
	console.log("Send answer to peer");
	var offer = pc.remoteDescription;
	var answer = pc.createAnswer(offer.toSdp(), {audio:true,video:true});
	pc.setLocalDescription(pc.SDP_ANSWER, answer);
	sendMessage({type: 'answer', sdp: answer.toSdp(), peer: otherId});
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
	socket = new WebSocket('ws://192.168.1.24:3000/');

	socket.onopen = function () {
		localVideo = document.getElementById('video-local');
		remoteVideo = document.getElementById('video-remote');
		getUserMedia();

		otherId = document.getElementById('peerId').dataset.id;
		if(otherId) {
			initiator = 1;
		}
	}

	socket.onmessage = function (message) {
		var data = JSON.parse(message.data);
		var type = data.type;

		if(type == 'id') {
			myId = data.id;
			console.log(data.id);
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