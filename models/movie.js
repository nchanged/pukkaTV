var domain = require('wires-domain');
var moment = require('moment');

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
        age : {type : 'int'},
        release_date : {type : 'bigint'}
    },
    getDate : function()
    {
        if ( this.attrs.release_date ){
            return moment(this.attrs.release_date).format('DD MMMM YYYY')
        }
        return "";
    }
});
module.exports = Movie;