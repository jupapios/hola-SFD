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



// UserMedia
window.URL = window.URL || window.webkitURL;
navigator.getUserMedia  = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

var video = document.querySelector('video');

function fallback(e) {
	console.log('ERROR:', e);
}

function success(stream) {
	video.src = window.URL.createObjectURL(stream);
}


function initMedia() {
	if (!navigator.getUserMedia) {
		fallback();
	} else {
		navigator.getUserMedia({video: true, audio: true}, success, fallback);
	}
}