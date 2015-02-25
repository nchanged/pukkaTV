var Aria2 = require('aria2');
var path = require('path');

var watchCallbacks = {};
var pingCallbacks = {};

var Config = require('wires-config');
var mySql = require('wires-mysql');
var cfg = Config.getMain();
var logger = require('log4js').getLogger();
var models = require('../models');
var _ = require('lodash');

var bytesToSize = function(bytes) {
    if (bytes == 0) return '0 Byte';
    var k = 1000;
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
}

var onUpdate = function(list) {
    console.log(list);
}

module.exports = {
    init: function() {
        Config = require('wires-config');
        cfg = Config.getMain();
    },

    connect: function(options) {



        var self = this;
        this.client = new Aria2(options);

        var client = this.client;
        this.client.onclose = function() {
            self.connected = false;
        };

        this.client.onsend = function(m) {

        };

        this.client.onDownloadStart = function(data) {

        };


        this.client.onDownloadComplete = function(e) {

        }


        var client = this.client;

        this.client.open(function() {
            self.connected = true;
            self.getServerStatus();

        });
    },
    listen: function(callback) {
        onUpdate = callback;
    },
    dbChecked: false,
    initialCheckForDownloadRestarts: function(data) {

        var existingIds = [0];
        _.each(data, function(item) {
            var movieDownloadIdMatch = item.dir.match(/movie_id(\d{1,})/i);
            if (movieDownloadIdMatch) {
                existingIds.push(movieDownloadIdMatch[1])
            }
        });
        /*
        */
        var self = this;

        mySql.connection.get(function(err, connection){
            var q = "Select * from movie_downloads where id not in ("+existingIds.join(',')+") and total != completed OR total is null OR completed is null";
            connection.query(q, function(err, results){
                
                _.each(results, function(item){
                    // Need to restart download
                    var magnetId = item.magnet_id;

                    new models.MovieMagnet().find({id : magnetId}).first(function(magnet){
                        logger.info("Restart download for " + magnet.get('full_title'))
                        self.addMagnet({
                            "type": "movie",
                            "magnet": magnet.get('magnet'),
                            "title": magnet.get("full_title"),
                            "id": item.id
                        });
                    });
                })
                connection.release();
            })
        })
        
    },
    getServerStatus: function() {
        var self = this;
        setInterval(function() {
            self.client.tellActive(["files", "dir", "totalLength", "completedLength"], function(e, data) {
                
                if (self.dbChecked === false) {
                    self.dbChecked = true;
                    self.initialCheckForDownloadRestarts(data);
                }
                
                onUpdate(data);
            });
        }, 2000)
    },
    addMagnet: function(opts, callback) {
        var self = this;
        

        var dlFolder = cfg.get("downloads.movies", '/Users/iorlov/Desktop/PukkaDownloads/');
        if (opts.type === "tv") {
            dlFolder = cfg.get("downloads.tv", '/Users/iorlov/Desktop/PukkaDownloads/');
        }

        var convertToSlug = function(Text) {
            return Text
                .toLowerCase()
                .replace(/[^\w ]+/g, '')
                .replace(/ +/g, '-');
        }
        if (self.connected) {
            var magnet = opts.magnet;
            var id = opts.id;
            var title = convertToSlug(opts.title) + "_" + opts.type + "_id" + id;

            var dir = path.join(dlFolder, title);
            
            self.client.addUri([magnet], {
                dir: dir,
                "seed-ratio" : 0.1
            });
        }
    }


}