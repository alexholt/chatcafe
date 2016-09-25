const angular = require('angular');

const chatCafe = angular.module(
  'chatCafe',
  []
);

const FETCH_INTERVAL = 500;

const httpConfig = { withCredentials: true };

chatCafe.config(['avatarInfoProvider', function (avatarInfoProvider) {
  avatarInfoProvider.initializeName();
  avatarInfoProvider.initializeAvatar();
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
    $scope.message.avatarUrl = avatarInfo.getAvatarUrl();

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
    avatarUrl: avatarInfo.getAvatarUrl(),
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
  let avatarUrl = '';
  let localStorageNameKey = 'username';

  let buildRandomAvatar = function () {
    let url = 'http://api.adorable.io/avatars/face/';

    let parts = [ 'eyes', 'noise', 'mouth' ].map( function (part) {
      return `${part}${Math.floor(Math.random() * 10) + 1}`;
    }).join('/');

    let color = (function () {
      var colorValue = '';
      for (var i = 0; i < 6; i++) {
        colorValue += Math.floor(Math.random() * 16).toString(16);
      }
      return colorValue;
    })();

    return url + parts + '/' + color;
  };

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
      setName,
      getAvatarUrl: function () {
        return avatarUrl;
      }
    };
  }];

  this.initializeName = function () {
    try {
      username = localStorage.getItem(localStorageNameKey);
    } catch (err) {
      console.error(`Local storage is unavailable: ${err.message}`);
    }
  };

  this.initializeAvatar = function () {
    avatarUrl = buildRandomAvatar();
  };
}]);
