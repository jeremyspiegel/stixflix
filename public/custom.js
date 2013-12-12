angular.module('app', ['ui.bootstrap']);

function StixController($scope, $http) {
    $http.get('/data')
    .success(function(data, status, headers, config) {
        $scope.data = data;
        $scope.activeTab = $scope.data[0].type;
    })
    .error(function(data, status, headers, config) {
        $scope.error = data || "Request failed";
    });
}
