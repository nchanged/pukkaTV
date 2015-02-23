var domain = require('wires-domain');

var models = require('../models');
var _ = require('lodash');
var Service = require('../service');
var async = require('async');
var logger = require('log4js').getLogger();
var Config = require('wires-config');
var cfg = Config.getMain();



var updater = module.exports = {
    _init: function(ready) {
        var configName = "../app.conf";
        if (process.argv.length == 3) {
            configName = "../prod.conf";
        }
        Config.register(configName, 'main', {
            domain: domain,
            models: models
        });
        var cfg = Config.getMain();

        domain.connect(cfg, function() {
            ready();
        });
    },
    checkMovie: function(movie, next) {
        logger.info("Checking imdb page: " + movie.get('title'));
        Service.IMDB.details(movie.get('imdb_id'), function(info) {
            if (info.date) {
                movie.set("release_date", info.date.getTime());
                movie.set("year", info.date.getFullYear());
            }
            if (info.rating) {
                movie.set("rating", info.rating);
            }
            logger.info("Saving for " + movie.attrs.title + " -> rating: " + info.rating + " date: " + info.date);
            movie.save(function() {
                setTimeout(function() {
                    next();
                }, 5000);
            });
        });
    },
    updateAll: function() {
        var self = this;
        this._init(function() {
            new models.Movie().find().order({
                    id: 'asc'
                })
                .asyncAll(function(movie, nextMovie) {
                    self.checkMovie(movie, nextMovie);
                }, function() {

                });
        });
    }
}
