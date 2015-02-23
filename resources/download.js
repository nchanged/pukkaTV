var domain = require('wires-domain');
var models = require('../models');
var service = require('../service');

/* self.addMagnet({
                           magnet: testMagnet,
                           title: "The Hunger Games: Mockingjay - Part 1 (2014) 1080p BrRip x264 - YIFY",
                           id: 5
                       }, function(progress) {
                           console.log(progress);
                       });*/



module.exports = domain.resources.BaseResource.extend({
    index: function(env) {
        var req = env.req;
        if (!req.query.magnet_id) {
            env.res.send("No magnet id");
            return;
        }
        var magnet_id = req.query.magnet_id * 1;
        new models.MovieDownloads().find({
            magnet_id: magnet_id
        }).first(function(scheduled) {
            if (!scheduled) {
                new models.MovieMagnet({
                    id: magnet_id
                }).first(function(magnet) {

                    if (!magnet) {
                        env.res.send({
                            err: "Magnet was not found"
                        });
                    } else {

                        var newDownload = new models.MovieDownloads({
                            magnet_id: magnet.get('id'),
                            movie_id: magnet.get('movie_id')
                        })
                        newDownload.save(function(nw) {

                            service.Aria.addMagnet({
                                "type": "movie",
                                "magnet": magnet.get('magnet'),
                                "title": magnet.get("full_title"),
                                "id": nw.get("id")
                            });
                            env.res.send({
                                success: nw
                            });
                        })
                    }
                });
            } else {
                env.res.send({
                    err: "Already scheduled"
                });
            }
        })

    }
})