var models = require('../models');
module.exports = function(req, res)
{
	var genre = req.query.genre;
	var currentGenre = "All Movies"
	var ratingOrder = req.query.rating;
	new models.Genre().find().order({name : 'asc'}).all(function(genres){
		
		
		var movies = new models.Movie();

		if (genre && genre != "All Movies") {
			currentGenre = genre;
            movies.find({
                genres: {
                    $contains: genre
                }
            });
        }
        if ( ratingOrder ){
        	movies.order({rating : 'desc'})
        } else {
        	movies.order({age : 'asc'})
        }
        //movies.limit(50);
        
        movies.all(function(movieList){


        	res.render('index', {genres : genres, movies : movieList, currentGenre : currentGenre});
        });
		
	});

	
}