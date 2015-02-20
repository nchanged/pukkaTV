var domain = require('wires-domain');

var TVShow = domain.models.BaseModel.extend({
    name: 'tv_show',
    schema: {
        id: {},
        title: {},
        img : {},
        imdb_id : { type : 'int'},
        summary : { type : 'varchar(1000)'},
        index : { type : 'int'},
        genres : {type : 'json'},
        age : {type : 'bigint'},
        url : {}
    }
});
module.exports = TVShow;