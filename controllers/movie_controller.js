var models = require('../models');
module.exports = function(req, res) {
    var movie_id = req.params.id;
    new models.Genre().find().order({
        name: 'asc'
    }).all(function(genres) {

        new models.Movie().find({
            id: movie_id
        }).first(function(movie) {
            if (movie) {

                new models.MovieMagnet().find({
                    movie_id: movie_id
                }).all(function(magnets) {
                    res.render('movie_details', {
                        genres: genres,
                        movie: movie,
                        magnets : magnets
                    });
                })

            }


        });

    })
}