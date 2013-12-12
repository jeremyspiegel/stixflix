angular.module('app', ['ui.bootstrap']);

function StixController($scope, $http, $modal) {
    $http.get('/data')
    .success(function(data, status, headers, config) {
        $scope.data = data;
        $scope.activeTab = $scope.data[0].type;
    })
    .error(function(data, status, headers, config) {
        $scope.error = data || "Request failed";
    });

    $scope.onclick = function(movie) {
        $http.jsonp('http://api.rottentomatoes.com/api/public/v1.0/movies/' + movie.id + '.json?page_limit=50&apikey=3h8aduxd8tx6k72gcmfmj3hw&callback=JSON_CALLBACK')
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
}

function ModalController($scope, movie) {
    $scope.movie = movie;
}
