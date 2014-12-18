var domain = require('conmio-domain');

var Movie = domain.models.BaseModel.extend({
    name: 'movie',
    schema: {
        id: {},
        title: {
            required: true
        },
        year: {
            required: true
        },
        series: {
            defaults: function() {
                return false
            }
        },
        imdb_id: {
            required: true
        },
        image: {},
        description: {},
        rating: {},

    }
});
module.exports = Movie;