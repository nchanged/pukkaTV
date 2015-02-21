var Class = require('wires-class');
var cfg = require('wires-config').getConfig();
var request = require('request');
var cheerio = require('cheerio');
var _ = require("lodash");
var models = require('../models');
var log4js = require('log4js');
var logger = log4js.getLogger();
var async = require('async');


var getAge = function(str) {

    var m = str.match(/(\d{1,3})\s(month|hour|day|week|year|minute)(s)?/);
    if (m) {
        var duration = m[1] * 1;
        var period = m[2];

        switch (period) {
            case "minute":
                return duration * 60;
            case "hour":
                return (duration * 60) * 60
            case "day":
                return (duration * 86400)
            case "week":
                return (duration * 604800)
            case "month":
                return (duration * 2678400);
            case "year":
                return (duration * 31536000);
        }
    }


    // Very low prioarity
    return 31536000 * 5;
}



var getContents = function(link, done) {

    var headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:24.0) Gecko/20100101 Firefox/24.0',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept-Language': 'en-US,en;q=0.8'
    };
    request.get({
        url: link,
        headers: headers,
        followAllRedirects: true,
        gzip: true

    }, function(e, r, body) {
        $ = cheerio.load(body);
        done($, body)
    });
}

module.exports = Class.extend({

    initialize: function() {
        console.log(cfg.get('kickass.feed'));

    },
    _getMovieDetails: function(url, done) {
        getContents(cfg.get('kickass.url') + url, function($, body) {
            var res = {};
            var cover = $(body).find(".movieCover");

            var imgTag = cover.find("img");
            if (imgTag) {
                res.img = $(imgTag).attr("src");
                if (res.img && res.img.indexOf("http:") < 0) {
                    res.img = "http:" + res.img;
                }
            }

            var summaryDiv = $(body).find("#summary");

            var summary = null;
            if (summaryDiv) {
                var summaryAllText = summaryDiv.children().first().text();
                var m = summaryAllText.match(/([\s\S]*)(Written)/);

                if (m) {
                    res.summary = m[1].split("\n").join('').split('\r').join('').trim();
                }
            }

            // Searting for genres
            res.genres = [];
            $(body).find(".dataList li").each(function(index, element) {
                var i = $(element).text();
                var s = i.match(/.*(\d\.\d)\s*\([0-9,]+\svotes\)/i);
                if (s) {
                    res.rating = parseFloat(s[1]);
                }
            });
            // neeed: quality, quality_param, year, title

            $(body).find(".dataList li strong").each(function(index, element) {
                var header = $(element);
                var group = header.text();
                var parent = header.parent();
                switch (group) {
                    case "Movie:":
                        res.title = parent.find("span").text();
                        break;
                    case "Detected quality:":
                        res.quality = parent.find("span").text();
                        break;
                    case "Release date:":
                        var y = parent.text().match(/^.*?(\d{4})$/i);
                        if (y) {
                            res.year = y[1] * 1;
                        }


                        break;
                }
            });
            // give it another try
            if (!res.year) {
                var yy = $(body).find(".novertmarg span");
                if (yy) {
                    var yearMath = yy.text().match(/\((\d{4})\)/i);
                    if (yearMath) {
                        var year = yearMath[1] * 1;
                        if (year > 1900) {
                            res.year = year * 1;
                        }
                    } else {
                        // and anothoer
                        var yearMath = yy.text().match(/(\d{4})/i)
                        if (yearMath) {
                            var year = yearMath[1] * 1;
                            if (year > 1900) {
                                res.year = year * 1;
                            }
                        }
                    }
                }
            }



            $(body).find(".dataList a[class=plain]").each(function(index, element) {
                var el = $(element);
                var href = el.attr("href");
                if (href.indexOf("genre") > -1) {
                    res.genres.push(el.text());
                }
                if (href.indexOf("imdb.com") > -1) {
                    res.imdb_id = el.text() * 1;
                }
            });

            done(res);
        });
    },
    // movies ********************************
    _getMoviePage: function(page, done) {
        //https://kickass.to/highres-movies/4/
        getContents("https://kickass.to/movies/" + page, function($, body) {
            var result = [];
            $(body).find("#mainSearchTable tr").each(function(index, element) {
                if ($(element).attr("id")) {
                    var age = 31536000 * 5;
                    var main = $(element).find(".cellMainLink");
                    var seeds = $(element).find('.green').text() * 1;

                    var fullTitle = $(main).text();

                    $(element).find('td').each(function(index, el) {

                        var inner = $(el).text();

                        var ageData = inner.match(/^(\d{1,3})\s(month|hour|day|week|year|minute)(s)?$/);

                        if (ageData) {
                            age = getAge(inner);
                        }
                    })

                    var magnetLink = $(element).find('.imagnet').attr('href');

                    var url = $(main).attr("href");
                    result.push({
                        age: age,
                        url: url,
                        seeds: seeds,
                        full_title: fullTitle,
                        magnet: magnetLink,
                    });

                }
            });

            done(result);
        });
    },
    updateGenreCount: function(done) {
        //SELECT count(1) FROM movie WHERE INSTR(genres, 'Animation') > 0
        logger.info("Updating genres count....");
        new models.Genre().all(function(items) {
            async.eachSeries(items, function(item, ready) {

                new models.Movie().find({
                    genres: {
                        $contains: item.get('name')
                    }
                }).count(function(count) {
                    item.set('amount', count)
                    item.save(function() {
                        ready(null);
                    })
                });

            }, function() {
                var updateAllMovieCount = function(allMovies) {
                    new models.Movie().count(function(amount) {
                        allMovies.set('amount', amount);
                        allMovies.save(function() {
                            done();
                        })
                    })
                }
                new models.Genre().find({
                    name: "All Movies"
                }).first(function(allMovies) {
                    if (!allMovies) {
                        var n = new models.Genre({
                            name: "All Movies"
                        });
                        n.save(function(allMovies) {
                            updateAllMovieCount(allMovies);
                        })
                    } else {
                        updateAllMovieCount(allMovies);
                    }
                });

            });
        })
    },
    buildMoviesOnPages: function(pages, done) {

        var pagesIndex = [];
        for (var i = 1; i <= pages; i++) {
            pagesIndex.push(i);
        }
        var self = this;
        async.eachSeries(pagesIndex, function(pageNum, pageDone) {

            self._getMoviePage(pageNum, function(movieList) {


                async.eachSeries(movieList, function(movieItem, movieDone) {
                    // First search for magnet
                    new models.MovieMagnet().find({
                        url: movieItem.url
                    }).first(function(magnetFound) {
                        if (!magnetFound) {
                            self._getMovieDetails(movieItem.url, function(movieDetails) {
                                // checking genres****
                                _.each(movieDetails.genres, function(genre) {
                                    if (genre) {
                                        new models.Genre().find({
                                            name: genre
                                        }).first(function(genreFound) {
                                            if (!genreFound) {
                                                new models.Genre({
                                                    name: genre
                                                }).save();
                                            }
                                        })
                                    }
                                });
                                //********************
                                if (!movieDetails.imdb_id || movieDetails.year) {
                                    logger.warn("SKIPPED: Movie has not imdb id or year " + movieItem.title);
                                    movieDone();
                                    return;
                                }


                                var data = _.merge(movieItem, movieDetails);

                                var addMagnet = function(movieId) {

                                    var newMagnet = new models.MovieMagnet({
                                        url: data.url,
                                        quality: data.quality,
                                        magnet: data.magnet,
                                        movie_id: movieId,
                                        full_title: data.full_title,
                                        seeds: data.seeds
                                    });
                                    newMagnet.save(function() {
                                        logger.info("New magnet for " + movieItem.title + " was added");
                                        movieDone();
                                    });
                                }

                                // Searching for movie
                                new models.Movie().find({
                                    imdb_id: data.imdb_id
                                }).first(function(movieFound) {
                                    if (!movieFound) {

                                        var nmovie = new models.Movie(data);

                                        nmovie.save(function(n) {
                                            addMagnet(n.get('id'));
                                        });
                                    } else {
                                        addMagnet(movieFound.get('id'));
                                    }
                                });


                            });
                        } else {
                            logger.info("Update seeds found for " + movieItem.full_title);
                            magnetFound.set('seeds', movieItem.seeds);
                            magnetFound.save(function() {
                                movieDone();
                            });

                        }
                    });



                }, function() {
                    logger.info("Page " + pageNum + " is done");
                    pageDone(null);
                });

            });
        }, function() {
            self.updateGenreCount(function() {
                logger.info("All done....");
            })

        });
    },


    // Series ********************************
    buildTVShowIndex: function(allDone) {
        var self = this;

        var pageFns = [];
        for (var i = 15; i > 0; i--) {
            pageFns.push(function(pageReady) {

                self._getLatestTVShowsPage(this.i, function(res) {

                    var fns = [];
                    var updatedIndexes = {};
                    _.each(res, function(item, index) {

                        // Function for async
                        fns.push(function(next) {
                            new models.TVShow().find({
                                title: item.title
                            }).first(function(found) {
                                if (!found) {


                                    self._fetchSearchDetailsPage(item.url, function(details) {
                                        if (!details.url) {
                                            next(null);
                                            return;
                                        }

                                        // Double check just in case for the id
                                        new models.TVShow().find({
                                            url: details.url
                                        }).first(function(urlCheck) {
                                            if (!urlCheck) {
                                                var show = new models.TVShow({
                                                    title: item.title,
                                                    url: details.url,
                                                    imdb_id: details.imdb_id,
                                                    genres: details.genres,
                                                    summary: details.summary,
                                                    age: item.age,
                                                    img: details.img,
                                                    index: item.index
                                                });
                                                logger.info("TV Show added " + item.title);
                                                show.save(function() {
                                                    next(null);
                                                });
                                            } else {
                                                if (item.index > urlCheck.get('index')) {

                                                    urlCheck.set('index', item.index);
                                                    urlCheck.set('age', item.age);
                                                    urlCheck.save(function() {
                                                        next(null);
                                                    });
                                                } else {
                                                    next(null);
                                                }
                                            }
                                        });


                                    });
                                } else {

                                    if (item.index > found.get('index')) {
                                        found.set('index', item.index);
                                        found.set('age', item.age);
                                        logger.info("Found fresher index for " + item.title + " " + item.index);
                                        found.save(function() {
                                            next(null);
                                        });
                                    } else {
                                        logger.info("Skipping " + item.title + " " + item.index);
                                        next(null);
                                    }
                                }
                            }.bind({
                                index: index
                            }))
                        })
                    });
                    async.series(fns, function(err, res) {
                        pageReady(null);
                    })
                });
            }.bind({
                i: i
            }))
        }

        async.series(pageFns, function(err, res) {
            allDone();
        })

    },
    _fetchEpisodes: function(url, done) {

    },
    _fetchSearchDetailsPage: function(url, done) {
        getContents(cfg.get('kickass.url') + url, function($, body) {
            var res = {};
            var cover = $(body).find(".movieCover");

            var imgTag = cover.find("img");
            if (imgTag) {
                res.img = $(imgTag).attr("src");
                if (res.img && res.img.indexOf("http:") < 0) {
                    res.img = "http:" + res.img;
                }
            }

            var summaryDiv = $(body).find("#summary");

            var summary = null;
            if (summaryDiv) {
                var summaryAllText = summaryDiv.children().first().text();
                var m = summaryAllText.match(/([\s\S]*)(Written)/);

                if (m) {
                    res.summary = m[1].split("\n").join('').split('\r').join('').trim();
                }
            }
            res.url = cover.attr("href");

            // Searting for genres
            res.genres = [];

            $(body).find(".dataList a[class=plain]").each(function(index, element) {
                var el = $(element);
                var href = el.attr("href");
                if (href.indexOf("genre") > -1) {
                    res.genres.push(el.text());
                }
                if (href.indexOf("imdb.com") > -1) {
                    res.imdb_id = el.text() * 1;
                }
            });

            done(res);
        });
    },
    _getLatestTVShowsPage: function(page, done) {
        var result = [];

        getContents(cfg.get('kickass.tvshowlist') + "/" + page, function($, body) {

            $(body).find("#mainSearchTable tr").each(function(index, element) {
                if ($(element).attr("id")) {
                    var age = 31536000 * 5;
                    var main = $(element).find(".cellMainLink");

                    var fullTitle = $(main).text();
                    //1
                    $(element).find('td').each(function(index, el) {

                        var inner = $(el).text();

                        var ageData = inner.match(/^(\d{1,3})\s(month|hour|day|week|year|minute)(s)?$/);

                        if (ageData) {
                            age = getAge(inner);
                        }
                    })



                    var tvShowName = fullTitle.match(/(.*?)\sS(\d{1,3})E(\d{1,3})/i);
                    var url = $(main).attr("href");

                    if (tvShowName) {

                        index = (tvShowName[2] + tvShowName[3]) * 1;

                        result.push({
                            url: url,
                            age: age,
                            title: tvShowName[1],
                            index: index
                        });
                    }
                }

            });
            done(result);
        });
    },
    _updateSeriesIndex: function(allDone) {
        var fns = [];
        var self = this;
        new models.TVShow().find().all(function(mods) {
            _.each(mods, function(item) {

                // Main async function
                fns.push(function(next) {


                    //logger.info("Update episodes for " + this.item.get('title'));

                    self._fetchSeries(item.get('url'), function(result) {

                        var epfns = [];
                        _.each(result, function(episodes, season) {
                            _.each(episodes, function(episode, v) {
                                // Checking if it's there
                                new models.Episode().find({
                                    kickass_id: episode.id
                                }).first(function(wasFound) {
                                    if (!wasFound) {
                                        var newEpisode = new models.Episode({
                                            tv_show_id: item.get('id'),
                                            season: season,
                                            num: episode.episode,
                                            name: episode.name,
                                            kickass_id: episode.id,
                                            date: episode.date
                                        });
                                        logger.info("Adding new episode " + item.get('title') + " " + season + " " + episode.episode + " -> " + episode.name);
                                        newEpisode.save(function() {});
                                    } else {
                                        logger.info("Exists " + item.get('title') + " " + season + " " + episode.episode + " -> " + episode.name);
                                    }
                                });
                            });
                        });

                        next(null);
                    });
                });
            });

            async.series(fns, function(err, res) {
                allDone();
            })

        });


    },
    _fetchSeries: function(page, done) {

        getContents(cfg.get('kickass.url') + page, function($, body) {
            var res = {};

            $(body).find("h3").each(function(index, element) {
                var header = $(element);
                var isOurClient = header.text().match(/^Season\s(\d{1,3})$/i);

                if (isOurClient) {

                    var seasonNumber = isOurClient[1] * 1;
                    var container = $(header).next();
                    container.children().each(function(i, div) {
                        var episodeNum = null;

                        var episodeNumberText = $(div).find(".versionsEpNo").text()
                        var m = episodeNumberText.match(/Episode\s(\d{1,3})/i);
                        if (m) {
                            episodeNum = m[1] * 1;
                        }

                        var episideName = $(div).find(".versionsEpName").text();
                        var episodeDate = $(div).find(".versionsEpDate").text();

                        // FIND ID
                        var idDiv = $(div).find(".infoListCut");
                        var episodeId = null;
                        if (idDiv) {
                            var idFunction = idDiv.attr("onclick");
                            if (idFunction) {
                                var m = idFunction.match(/showEpisodeInfo\(this, '(\d{1,})'\)/);
                                if (m) {
                                    episodeId = m[1] * 1;
                                }
                            }

                        }
                        if (!res[seasonNumber]) {
                            res[seasonNumber] = [];
                        }

                        res[seasonNumber].push({
                            episode: episodeNum,
                            name: episideName,
                            date: episodeDate,
                            id: episodeId
                        });

                    });


                }
            });
            done(res);
        });
    }
});