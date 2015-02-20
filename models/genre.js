var domain = require('wires-domain');

var Genre = domain.models.BaseModel.extend({
    name: 'genre',
    schema: {
        id: {},
        name: {},
        amount : {type : 'int'}
    }

});
module.exports = Genre;