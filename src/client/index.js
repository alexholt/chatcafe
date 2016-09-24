const angular = require('angular');

const chatCafe = angular.module(
  'chatCafe',
  []
);

const FETCH_INTERVAL = 500;

const httpConfig = { withCredentials: true };

chatCafe.controller('historyCtrl', function ($scope, $http) {
  $scope.master = {};

  const fetchData = function () {
    $http.get(`${SERVER_URL}/chat`, httpConfig)
      .success(function (data) {
        $scope.messages = data;
        setTimeout(fetchData, FETCH_INTERVAL);
      })
      .error(function (err) {
        $scope.messages = [];
      });
  };

  setTimeout(fetchData, FETCH_INTERVAL);

});

chatCafe.controller('messageCtrl', function ($scope, $http) {
  $scope.master = {};

  $scope.update = function (message) {
    $scope.message = angular.copy(message);
    $scope.message.timestamp = Date.now();

    $http.post(`${SERVER_URL}/chat`, $scope.message, httpConfig)
      .success(function (data) {
        $scope.reset();
      })
      .error(function (err) {
        console.dir(err);
      });
  };

  $scope.reset = function () {
    $scope.message = angular.copy($scope.master);
    $scope.message.senderName = 'Alex';
  };

});
