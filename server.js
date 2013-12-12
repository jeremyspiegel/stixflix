var express = require('express');
var http = require('http');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('db');
var app = express();

app.use(express.static(__dirname + '/public'));

app.get('/', function(request, response) {
    response.sendfile('public/index.html');
});

var data = [];
app.get('/data', function(request, response) {
    response.send(JSON.stringify(data));
})

app.listen(80);

function get(uri, callback) {
    http.get(uri, function(response) {
        var json = '';
        response.on('data', function(data) {
            json += data;
        });
        response.on('end', function() {
            callback(JSON.parse(json));
        });
    }).on('error', function(error) {
        console.log('Error: ' + error.message);
    });
}

function getMoviesOfType(type) {
    var movies = [];
    data.push( { type: prettify(type), movies: movies } );
    get('http://api.rottentomatoes.com/api/public/v1.0/lists/dvds/' + type + '.json?page_limit=50&apikey=3h8aduxd8tx6k72gcmfmj3hw', function(response) {
        for (var i = 0; i < response.movies.length; i++) {
            var movie = response.movies[i];
            if ( movie.ratings.audience_score >= 2 * movie.ratings.critics_score && movie.ratings.critics_score > 0 && movie.ratings.audience_score >= 50 )
                movies.push( {
                    title: movie.title,
                    year: movie.year,
                    id: movie.id,
                    critics_score: movie.ratings.critics_score,
                    audience_score: movie.ratings.audience_score,
                    image: movie.posters.profile } );
        }
        movies.sort(function(a, b) { return a.title.localeCompare(b.title); });
    });
}

// get('http://api.rottentomatoes.com/api/public/v1.0/movies.json?q=a&page_limit=50&page=1&apikey=3h8aduxd8tx6k72gcmfmj3hw', function(movie) {
//     console.log(movie.title + ' - ' + JSON.stringify(movie.release_dates));
// });

getMoviesOfType('current_releases');
getMoviesOfType('upcoming');

var allMovies = [];
data.push( { type: 'All Movies', movies: allMovies } );
db.each("select id, title, year, critics_score, audience_score, image from movies limit 100", function(err, row) {
    allMovies.push(row);
});

app.get('/all_movies', function(request, response) {
    var movies = [];
    db.each("select id, title, year, critics_score, audience_score, image from movies limit 100 offset ?", 100 * request.query.page, function(err, row) {
        movies.push(row);
    }, function() {
        response.send(JSON.stringify(movies));
    });
});

function prettify(string) {
    return string.replace('_', ' ')
                 .replace(/\w\S*/g, function(txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
}