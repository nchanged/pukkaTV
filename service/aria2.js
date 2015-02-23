var Aria2 = require('aria2');
var path = require('path');

var watchCallbacks = {};
var pingCallbacks = {};

 var Config = require('wires-config');
var cfg = Config.getMain();

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
    init : function()
    {
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
        this.client.onmessage = function(m) {
            var result = m.result;
            if (result) {
                if (result.dir) {
                    var dir = result.dir;
                    var idMatch = dir.match(/_id(\d{1})/i);
                    if (idMatch) {
                        var id = idMatch[1];
                        var totalLength = result.totalLength;
                        var completedLength = result.completedLength;
                        if (watchCallbacks["id-" + id]) {

                            watchCallbacks["id-" + id]({
                                id: id,
                                totalLength: result.totalLength,
                                completedLength: completedLength,
                                total: bytesToSize(result.totalLength),
                                complete: bytesToSize(result.completedLength),
                                gid: result.gid,
                                status: result.status
                            })
                        }
                    }
                }
            }
        };

        this.client.onDownloadStart = function(data) {
            pingCallbacks[data.gid] = setInterval(function() {
                client.tellStatus(data.gid, ["gid", "dir", "status", "downloadSpeed", "totalLength", "completedLength"]);
            }, 2000)

        };


        this.client.onDownloadComplete = function(e) {

            var gid = e.gid;
            clearInterval(pingCallbacks[gid]);
        }

        var testMagnet = "magnet:?xt=urn:btih:E63A9B7329462B4961FADA125E140AFDAE3286E1&dn=the+hunger+games+mockingjay+part+1+2014+hdrip+xvid+evo&tr=udp%3A%2F%2Fopen.demonii.com%3A1337%2Fannounce";
        var client = this.client;

        this.client.open(function() {
            self.connected = true;
            self.getServerStatus();
           
        });
    },
    listen: function(callback) {
        onUpdate = callback;
    },
    getServerStatus: function() {
        var self = this;
        setInterval(function() {
            self.client.tellActive(["files", "dir", "totalLength", "completedLength"],function(e, data) {
                onUpdate(data);
            });
        }, 2000)
    },
    addMagnet: function(opts, callback) {
        var self = this;

        var dlFolder = cfg.get("downloads.movies", '/Users/iorlov/Desktop/PukkaDownloads/');
        if ( opts.type === "tv"){
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
                dir: dir
            });
        }
    }


}