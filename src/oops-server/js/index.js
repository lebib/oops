var Knex = require('knex');

var knex;

exports.init = function(config, cb) {

	knex = Knex.initialize({
		client: config.database.protocol,
		connection: {
			host: config.database.host,
			user: config.database.user,
			password: config.database.user.password,
			database: config.database.database,
			charset: config.database.charset
		}
	});
	cb();
};

exports.checkPlace = function(lat, lon) {
	console.log(lat+" -- "+lon);
}

exports.addPrune = function(lat, lon) {
	console.log(lat+" -- "+lon);
}