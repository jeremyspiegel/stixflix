var RottenTomatoes = require('./rotten_tomatoes.js');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('db');

db.run("create table if not exists movies (id int primary key, title text, year int, critics_score int, audience_score int, image text)");
db.run("create table if not exists genres (id int, genre text, primary key (id, genre))");

function callback(result) {
    for (var i = 0; i < result.movies.length; i++) {
        var movie = result.movies[i];
        if ( movie.ratings.audience_score >= 2 * movie.ratings.critics_score && movie.ratings.critics_score > 0 && movie.ratings.audience_score >= 50 ) {
            db.run("insert or ignore into movies (id, title, year, critics_score, audience_score, image) values (?,?,?,?,?,?)",
                   movie.id, movie.title, movie.year, movie.ratings.critics_score, movie.ratings.audience_score, movie.posters.profile);
            RottenTomatoes.get('http://api.rottentomatoes.com/api/public/v1.0/movies/' + movie.id + '.json', function(movie) {
                for (var i = 0; i < movie.genres.length; i++) {
                    db.run("insert or ignore into genres (id, genre) values (?,?)", movie.id, movie.genres[i]);
                }
            });
        }
    }

    if ( result.links.next )
        RottenTomatoes.get(result.links.next, callback);
}

for (var i = 'a'.charCodeAt(0); i <= 'z'.charCodeAt(0); ++i) {
    for (var j = 'a'.charCodeAt(0); j <= 'z'.charCodeAt(0); ++j) {
        var q = String.fromCharCode(i) + String.fromCharCode(j);
        RottenTomatoes.get('http://api.rottentomatoes.com/api/public/v1.0/movies.json?q=' + q + '&page_limit=50', callback);
        // (function(q) {
        //     RottenTomatoes.get('http://api.rottentomatoes.com/api/public/v1.0/movies.json?q=' + q + '&page_limit=50', function(result) {
        //         if ( result.total / 50 + 1 >= 25 )
        //             console.log(q + ' ' + result.total );
        //     });
        // })(q);
    }
}
