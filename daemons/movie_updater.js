var domain = require('wires-domain');
var Config = require('wires-config');
var models = require('../models');
var _ = require('lodash');

var async = require('async');
var logger = require('log4js').getLogger();
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
    updateAll: function() {
        var self = this;
        this._init(function() {
            var Service = require('../service');
            var kickass = new Service.KickAss();

            kickass.buildMoviesOnPages(85, 400, function() {
                console.log("ALL DONE");
            });
        });
    }
}

updater.updateAll();
