var domain = require('wires-domain');
var Config = require('wires-config');
var models = require('../models');
var _ = require('lodash');

var async = require('async');


var updater = module.exports = {

    onUpdate: function(data) {
        var self = this;

        _.each(data, function(item) {
            var movieDownloadIdMatch = item.dir.match(/movie_id(\d{1})/i);
            if (movieDownloadIdMatch) {
                new models.MovieDownloads().find({
                    id: movieDownloadIdMatch[1]
                }).first(function(md) {
                    if (md) {
                        md.set("total", item.totalLength);
                        md.set("completed", item.completedLength);
                        md.set("files", item.files);
                        md.save(function() {

                        })
                    }
                });
            }
        });
    }
}