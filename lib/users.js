var cradle = require('cradle'),
	util   = require('util');

var c = new cradle.Connection('holasfd.iriscouch.com', 80, {
	auth: { username: 'test', password: 'test'}
});

var users = c.database('users');

exports.findOrCreateByTwitterData = function(twitterUserData, promise) {
	users.view('docs/twitterId', {key: twitterUserData.id_str}, function(err, docs) {
		if (err) {
			console.log("Error using users/_design/docs/_view/twitterId:");
			console.log(err);
			promise.fail(err);
			return;
		}
		if (docs.length > 0) {
			var user = docs[0].value;
			console.log('user exists: ' + util.inspect(user));
			promise.fulfill(user);
		} else {
			var doc = {
				name: twitterUserData.name,
				twitterId: twitterUserData.id
			};
			c.database('users').save(doc, function(err, res) {
				if (err) {
					console.log("Error using users:");
					console.log(err);
					promise.fail(err);
					return;
				}
				//console.log('user created: ' + util.inspect(doc));
				promise.fulfill(doc);
			})
		}
	});
}