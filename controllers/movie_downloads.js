var models = require('../models');
module.exports = function(req, res) {
    var download_id = req.params.id;
    new models.Genre().find().order({
        name: 'asc'
    }).all(function(genres) {

        new models.MovieDownloads()
            .attach("movie_id", models.Movie)
            .attach("magnet_id",models.MovieMagnet)
            .order({id : "desc"})
            .all(function(data) {
                
                
                res.render('movie_downloads', {
                    downloads: data,
                    genres: genres,
                });

            });

    })
}