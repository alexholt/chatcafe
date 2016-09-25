const angular = require('angular');

const chatCafe = angular.module(
  'chatCafe',
  []
);

const FETCH_INTERVAL = 500;

const httpConfig = { withCredentials: true };

chatCafe.config(['avatarInfoProvider', function (avatarInfoProvider) {
  avatarInfoProvider.initializeName();
}]);

chatCafe.controller('historyCtrl', function ($scope, $http) {
  $scope.messages = [];

  const fetchData = function () {
    $http.get(`${SERVER_URL}/chat`, httpConfig)
      .success(function (messages) {
        const messageIds = $scope.messages.reduce(function (acc, cur) {
          acc[cur.id] = true;
          return acc;
        }, {});
        for (let i = 0; i < messages.length; i++) {
          if (!messageIds[messages[i].id]) {
            $scope.messages.push(messages[i]);
          }
        }
      })
      .error(function (err) {
        console.error(`An error has occured: ${err.message}`);
      });

    setTimeout(fetchData, FETCH_INTERVAL);
  };

  setTimeout(fetchData, FETCH_INTERVAL);

});

chatCafe.controller('messageCtrl', function ($scope, $http, avatarInfo) {
  $scope.master = {};

  $scope.update = function (message) {
    $scope.message = angular.copy(message);
    $scope.message.timestamp = Date.now();
    $scope.message.senderName = avatarInfo.getName();

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
  };

  $scope.reset();
});

chatCafe.controller('avatarCtrl', function ($scope, avatarInfo) {
  $scope.master = {
    name: avatarInfo.getName(),
  };

  $scope.update = function (user) {
    $scope.user = angular.copy(user);
    avatarInfo.setName($scope.user.name);
  };

  $scope.reset = function () {
    $scope.user = angular.copy($scope.master);
  };

  $scope.reset();
});

chatCafe.provider('avatarInfo', [function () {
  let username = 'Anonymous';
  let localStorageKey = 'username';

  let setName = function (name) {
    username = name;
    try {
      localStorage.setItem('username', username);
    } catch (err) {
      console.error(`Local storage is unavailable: ${err.message}`);
    }
  };

  this.$get = [function () {
    return {
      getName: function () {
        return username;
      },
      setName
    };
  }];

  this.initializeName = function () {
    try {
      username = localStorage.getItem(localStorageKey);
    } catch (err) {
      console.error(`Local storage is unavailable: ${err.message}`);
    }
  };
}]);
