var models = require('../models');
var _ = require('lodash');
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
                    var priorityMagnets = [];
                    var restMagnets = [];
                     _.each(magnets, function(magnet) {
                        var quality = magnet.get('quality')
                        var title = magnet.get('full_title');
                        var shitQuality = quality.match(/CAM|TeleSync|TS|Telecine|Screener|Unknown/i)
                        var isGood = (title.match(/\sHD/i) && !shitQuality) || (!title.match(/cam/i) && 
                            quality.match(/720p|1080p|HDRIP|DVDRip/i))
                        
                        if ( isGood && !shitQuality){
                            priorityMagnets.push(magnet)
                        } else {
                            magnet.isShit = true;
                            restMagnets.push(magnet);
                        }
                        
                    });
                     var sortedMagnets = priorityMagnets.concat(restMagnets)
                     
                     
                    res.render('movie_details', {
                        genres: genres,
                        movie: movie,
                        magnets: sortedMagnets
                    });
                })

            }


        });

    })
}