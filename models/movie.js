var domain = require('wires-domain');

var Movie = domain.models.BaseModel.extend({
    name: 'movie',
    schema: {
        id: {},
        title: {},
        img : {},
        rating : {type : 'float'},
        year : {type : 'int'},
        genres : {type : 'json'},
        summary : {type : 'varchar(2000)'},
        imdb_id : {type : 'int'},
        age : {type : 'int'}
    }
});
module.exports = Movie;