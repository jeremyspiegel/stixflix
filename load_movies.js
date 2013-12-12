var http = require('http');
var RateLimiter = require('limiter').RateLimiter;
var limiter1 = new RateLimiter(1, 2000);
var limiter2 = new RateLimiter(9000, 'day');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('db');
db.run("create table if not exists movies (id int primary key, title text, year int, critics_score int, audience_score int, image text)");
db.run("create table if not exists genres (id int, genre text, primary key (id, genre))");

var openConnections = 0;
function get(uri, callback) {
    limiter1.removeTokens(1, function() {
        limiter2.removeTokens(2, function() {
            console.log(new Date().toString() + ' ' + openConnections + ' ' + uri);
            openConnections++;
            http.get(uri, function(response) {
                var json = '';
                response.on('data', function(data) {
                    json += data;
                });
                response.on('end', function() {
                    callback(JSON.parse(json));
                    openConnections--;
                });
            }).on('error', function(error) {
                console.log('Error: ' + error.message);
            });
        });
    });
}

function callback(result) {
    for (var i = 0; i < result.movies.length; i++) {
        var movie = result.movies[i];
        if ( movie.ratings.audience_score >= 2 * movie.ratings.critics_score && movie.ratings.critics_score > 0 && movie.ratings.audience_score >= 50 ) {
            db.run("insert or ignore into movies (id, title, year, critics_score, audience_score, image) values (?,?,?,?,?,?)",
                   movie.id, movie.title, movie.year, movie.ratings.critics_score, movie.ratings.audience_score, movie.posters.profile);
            get('http://api.rottentomatoes.com/api/public/v1.0/movies/' + movie.id + '.json?apikey=3h8aduxd8tx6k72gcmfmj3hw', function(movie) {
                if ( !movie.genres )
                    console.log(movie);
                for (var i = 0; i < movie.genres.length; i++) {
                    db.run("insert or ignore into genres (id, genre) values (?,?)", movie.id, movie.genres[i]);
                }
            });
        }
    }

    if ( result.links.next )
        get(result.links.next + '&apikey=3h8aduxd8tx6k72gcmfmj3hw', callback);
}

for (var i = 'a'.charCodeAt(0); i <= 'z'.charCodeAt(0); ++i) {
    var letter = String.fromCharCode(i);
    get('http://api.rottentomatoes.com/api/public/v1.0/movies.json?q=' + letter + '&page_limit=50&apikey=3h8aduxd8tx6k72gcmfmj3hw', callback);
}

// function(movie) {
//     if ( movie.ratings.audience_score >= 2 * movie.ratings.critics_score && movie.ratings.critics_score > 0 && movie.ratings.audience_score >= 50 )
//         console.log(movie.title + ' ' + movie.id + ' ' + movie.ratings.critics_score + ' ' + movie.ratings.audience_score);
//         // movies.push( {
//         //     title: movie.title,
//         //     year: movie.year,
//         //     id: movie.id,
//         //     critics_score: movie.ratings.critics_score,
//         //     audience_score: movie.ratings.audience_score,
//         //     image: movie.posters.profile } );
// });
