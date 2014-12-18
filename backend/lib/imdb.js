var request = require('request');
var cheerio = require('cheerio');


var requestIMDBPath = function(path, query, success, fail) {
    var headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:24.0) Gecko/20100101 Firefox/24.0',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept-Language': 'en-US,en;q=0.8'
    };
    var form = {
        username: 'user',
        password: '',
        opaque: 'someValue',
        logintype: '1'
    };
    request.get({
        url: "http://www.imdb.com" + path,
        headers: headers,
        qs: query,
    }, function(e, r, body) {

        if (e) {
            if (fail)
                fail(r);
        } else {
            success(body);
        }

    });
}

var IMDB = {
    search: function(opts, done) {
        // Searhin
        requestIMDBPath('/find', {
            q: opts.name + (opts.year ? ' ' + opts.year : '')
        }, function(body) {
            $ = cheerio.load(body);

            var section = $(body).find('.findSection');
            var results = [];
            if (section.length > 0) {
                section.find('.result_text').each(function(index, element) {
                    var el = $(element);
                    var name = el.find('a').html();
                    var link = el.find('a').attr("href");
                    var idMatch = link.match(/(tt\d{1,50})/);
                    if (idMatch) {
                        var id = idMatch[1]
                        var full = el.html();
                        var year = 1600;
                        var type = null;
                        // Getting the year
                        var info = full.match(/\((\d{1,4})\)\s*(\(([^\)]+))?/);
                        if (info) {
                            year = info[1] * 1;
                            // Getting type (TV Episode, TV series)
                            if (info[3]) {
                                type = info[3];
                            }
                        }
                        results.push({
                            name: name,
                            id: id,
                            year: year,
                            type: type
                        });
                    }
                })
            }
            done(results);
        })

    }
}

module.exports = IMDB;