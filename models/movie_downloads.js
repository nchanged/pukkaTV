var domain = require('wires-domain');

var MovieDownloads = domain.models.BaseModel.extend({
    name: 'movie_downloads',
    schema: {
        id: {},
        magnet_id: {type : 'int'},
        done : {type : 'int'},
        path : {}
    }

});
module.exports = MovieDownloads;