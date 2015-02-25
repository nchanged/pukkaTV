var domain = require('wires-domain');

var MovieDownloads = domain.models.BaseModel.extend({
    name: 'movie_downloads',
    schema: {
        id: {},
        magnet_id: {type : 'int'},
        done : {type : 'int'},
        total : {type : 'bigint'},
        completed : {type : 'bigint'},
        files : {type : 'json-large', hidden : true},
        movie_id : {type : 'int'},
        finished : {type : 'bool'},
        path : {}
    }

});
module.exports = MovieDownloads;