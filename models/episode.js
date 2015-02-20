var domain = require('wires-domain');

var Episode = domain.models.BaseModel.extend({
    name: 'episode',
    schema: {
        id: {},
        tv_show_id: {type : 'int'},
        season: {type : 'int'},
        num : {type : 'int'},
        name : {},
        kickass_id : { type : 'int'},
        date : {}
    }

});
module.exports = Episode;