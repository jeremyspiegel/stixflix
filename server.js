var express = require('express');
var http = require('http');

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
            var movies = JSON.parse(json).movies;
            for (var i = 0; i < movies.length; i++) {
                callback(movies[i]);
            };
        });
    }).on('error', function(error) {
        console.log('Error: ' + error.message);
    });
}

function getMoviesOfType(type) {
    var movies = [];
    data.push( { type: prettify(type), movies: movies } );
    get('http://api.rottentomatoes.com/api/public/v1.0/lists/dvds/' + type + '.json?page_limit=50&apikey=3h8aduxd8tx6k72gcmfmj3hw', function(movie) {
        movies.push( {
            title: movie.title,
            critics_score: movie.ratings.critics_score,
            audience_score: movie.ratings.audience_score,
            image: movie.posters.profile } );
    });
}

// get('http://api.rottentomatoes.com/api/public/v1.0/movies.json?q=a&page_limit=50&page=1&apikey=3h8aduxd8tx6k72gcmfmj3hw', function(movie) {
//     console.log(movie.title + ' - ' + JSON.stringify(movie.release_dates));
// });

getMoviesOfType('current_releases');
getMoviesOfType('top_rentals');
getMoviesOfType('new_releases');
getMoviesOfType('upcoming');

function prettify(string) {
    return string.replace('_', ' ')
                 .replace(/\w\S*/g, function(txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
}