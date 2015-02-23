var domain = require('wires-domain');

var MovieDownloads = domain.models.BaseModel.extend({
    name: 'movie_downloads',
    schema: {
        id: {},
        magnet_id: {type : 'int'},
        done : {type : 'int'},
        total : {type : 'bigint'},
        completed : {type : 'bigint'},
        files : {type : 'json-med'},
        movie_id : {type : 'int'},
        path : {}
    }

});
module.exports = MovieDownloads;