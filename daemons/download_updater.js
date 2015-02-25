var domain = require('wires-domain');
var Config = require('wires-config');
var models = require('../models');
var _ = require('lodash');

var async = require('async');


var scheduleFinishedUpdate = function(model)
{
    setTimeout(function(){
        model.set("finished", true);
        model.save();
    },15000)
}
var updater = module.exports = {

    onUpdate: function(data) {
        var self = this;

        _.each(data, function(item) {
            var movieDownloadIdMatch = item.dir.match(/movie_id(\d{1,})/i);
            if (movieDownloadIdMatch) {
                
                new models.MovieDownloads().find({
                    id: movieDownloadIdMatch[1]
                }).first(function(md) {
                    
                    if (md) {
                       

                        md.set("files", item.files);
                        var totalLength = 0;
                        var completedLength = 0;
                        _.each(item.files, function(file){
                            totalLength += file["length"] * 1;
                            completedLength += file["completedLength"] * 1
                        });

                        md.set("total", totalLength);
                        md.set("completed", completedLength);
                        
                        if ( totalLength > 1000000 ){
                            var isReady = totalLength === completedLength;
                            if ( isReady === false ){
                                md.set('finished',isReady );
                            } else {
                                scheduleFinishedUpdate(md);
                            }
                        } else {
                            md.set('finished', false);
                        }
                        
                        md.save(function() {

                        })
                    }
                });
            }
        });
    }
}