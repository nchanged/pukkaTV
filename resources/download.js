var domain = require('wires-domain');
var models = require('../models');


module.exports = domain.resources.BaseResource.extend({
	index : function(env) {
		var req = env.req;
		if ( !req.query.magnet_id){
			env.res.send("No magnet id");
			return;
		}

		var magnet_id = req.query.magnet_id * 1;


		new models.MovieMagnet({id : magnet_id}).first(function(magnet){
			if ( !magnet ){
				env.res.send({err : "Magnet was not found"});
			} else {
				new models.MovieDownloads({})
			}
		});


	}
})