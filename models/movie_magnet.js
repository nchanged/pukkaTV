var domain = require('wires-domain');

var MovieMagnet = domain.models.BaseModel.extend({
    name: 'movie_magnet',
    schema: {
        id: {},
        url : {},
        full_title : {},
        movie_id: {type : 'int'},
        quality: {type : 'varchar(20)'},
        seeds : {type : 'int'},
        magnet : {type : 'varchar(1000)'},
        

    }
});
module.exports = MovieMagnet;