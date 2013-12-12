angular.module('app', ['ui.bootstrap', 'infinite-scroll']);

function StixController($scope, $http, $modal) {
    $http.get('/data')
    .success(function(data, status, headers, config) {
        $scope.data = data;
    })
    .error(function(data, status, headers, config) {
        $scope.error = data || "Request failed";
    });

    $scope.onclick = function(movie) {
        $http.jsonp('http://api.rottentomatoes.com/api/public/v1.0/movies/' + movie.id + '.json?page_limit=50&apikey=ah3k28e92uw29wedz8qgrsge&callback=JSON_CALLBACK')
        .success(function(movie) {
            console.log(movie);
            $modal.open({
                templateUrl: 'modal.html',
                controller: ModalController,
                resolve: {
                    movie: function() {
                        return movie;
                    }
                }
            });
        })
        .error(function(data, status, headers, config) {
            $scope.error = data || "Request failed";
        });
    };

    var allMoviesPage = 1;
    $scope.page = function() {
        console.log('page');
        if ( !$scope.data )
            return;

        $http.get('/all_movies?page=' + ++allMoviesPage)
        .success(function(data) {
            $scope.data[2].movies = $scope.data[2].movies.concat(data);
        })
        .error(function(data, status, headers, config) {
            $scope.error = data || "Request failed";
        });
    }
}

function ModalController($scope, movie) {
    $scope.movie = movie;
}
