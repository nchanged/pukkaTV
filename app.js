var domain = require('wires-domain');
var Config = require('wires-config');
var models = require('./models');

Config.register('app.conf', 'main', {
    domain: domain,
    models: models
})


var express = require('express');
var path = require('path')
var Service = require('./service');
var cfg = Config.getMain();
var resources = require('./resources');




var app = domain.webApp();






// MOVIES *************************

domain.add('/api/genres/:id?', {
    model: models.Genre,
    prepare: function(env, model) {
        model.order({
            name: "asc"
        });
        return model;
    }
});

domain.add('/api/movie_magnet', {
    model: models.MovieMagnet,
    prepare: function(env, model) {
        if (env.req.query.movie_id){
            model.find({movie_id : env.req.query.movie_id * 1})
        }
        return model;
    }
});


domain.add('/api/movies/:id?', {
    model: models.Movie,
    prepare: function(env, model) {
        model.order({
            age: 'asc'
        });



        if (env.req.query.genre) {
            model.find({
                genres: {
                    $contains: env.req.query.genre
                }
            });
        }

        return model;
    }
});

// TV SERIES ****************

domain.add('/api/episodes/:tv_show_id?', {
    model: models.Episode,
    prepare: function(env, model) {
        model.order({
            season: 'desc',
            num: 'desc'
        });
        return model;
    }
});


domain.add('/api/download', {
    handler : resources.Download
});

domain.add('/api/shows/:id?', {
    model: models.TVShow,
    prepare: function(env, model) {
        model.order({
            age: 'asc'
        });
        return model;
    }
});


/*Service.Aria.connect({
  host: 'localhost',
  port: 6800,
  secure: false,
  secret: ''
});*/

domain.connect(cfg, function() {
    var port = cfg.get('app.port', 8888);

    var kickass = new Service.KickAss();


    /*
        kickass.buildTVShowIndex(function() {
        kickass._updateSeriesIndex(function(res) {

        });
      });
    */

   // kickass.buildMoviesOnPages(10, function() {
   // });

    /*
    kickass._getMoviePage(1,function(a){
        console.log(a);
    })*/

   /* kickass._getMovieDetails('/the-hunger-games-mockingjay-part-1-2014-hdrip-xvid-evo-t10232397.html', function(){

    })*/

    app.listen(port);
    // console.log('listening on port:' + port);
});