var models = require('../models');
module.exports = function(req, res)
{
	var genre = req.query.genre;
	var currentGenre = "All Movies"
	var ratingOrder = req.query.rating;
	var yearplus = req.query.year;
    var release = req.query.release;

    var offset = req.query.offset;



	new models.Genre().find().order({name : 'asc'}).all(function(genres){
		
		
		var movies = new models.Movie();
        movies.find({release_date : {$notNull : true} } );

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
        } 


        if ( release){
            movies.order({release_date : 'desc'})   
        }

        if ( yearplus ){
        	movies.find({year : { $gte : yearplus  * 1}})
        }
        
        movies.limit(50);
        if ( offset ){
            movies.offset(offset*1);    
        }
        
        
        movies.all(function(movieList){

            if ( req.query.template ){
                res.render('movie_items', {movies : movieList, currentGenre : currentGenre});    
            } else {
        	   res.render('index', {genres : genres, movies : movieList, currentGenre : currentGenre});
            }
        });
		
	});

	
}