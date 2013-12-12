var http = require('http');
var URL = require('url');
var RateLimiter = require('limiter').RateLimiter;
var limiter1 = new RateLimiter(10, 1000);
var limiter2 = new RateLimiter(9000, 'day');

function get(url, callback) {
    limiter1.removeTokens(1, function() {
        limiter2.removeTokens(2, function() {
            url = URL.parse(url, true);
            url.query.apikey = 'ah3k28e92uw29wedz8qgrsge';
            delete url.search;
            url = URL.format(url);
            http.get(url, function(response) {
                var json = '';
                response.on('data', function(data) {
                    json += data;
                });
                response.on('end', function() {
                    var result = JSON.parse(json);
                    if ( result.error )
                    {
                        console.log(json + ' ' + url);
                        get(url, callback);
                    }
                    else
                    {
                        callback(result);
                    }
                });
            }).on('error', function(error) {
                console.log('Error: ' + error.message);
            });
        });
    });
}

exports.get = get;
