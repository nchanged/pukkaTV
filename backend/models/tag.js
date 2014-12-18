var domain = require('conmio-domain');

var Tag = domain.models.BaseModel.extend({
    name: 'tag',
    schema: {
        id: {},
        name : {
            required: true
        }
    }
});
module.exports = Tag;