var domain = require('wires-domain');
var Config = require('wires-config');
var models = require('./models');

var configName = "app.conf";
if (process.argv.length == 3) {
    configName = "prod.conf";
}

Config.register(configName, 'main', {
    domain: domain,
    models: models
})


var express = require('express');
var path = require('path')
var Service = require('./service');
var cfg = Config.getMain();
var resources = require('./resources');




var app = domain.webApp();


domain.connect(cfg, function() {
    var port = cfg.get('app.port', 8888);

    var kickass = new Service.KickAss();

    kickass.buildMoviesOnPages(2, function() {

    });

});