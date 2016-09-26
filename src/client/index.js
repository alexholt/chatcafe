const angular = require('angular');

const chatCafe = angular.module(
  'chatCafe',
  []
);

const FETCH_INTERVAL = 500;

const httpConfig = { withCredentials: true };

chatCafe.config(['$anchorScrollProvider', 'avatarInfoProvider', function ($anchorScrollProvider, avatarInfoProvider) {
  $anchorScrollProvider.disableAutoScrolling();
  avatarInfoProvider.initializeName();
  avatarInfoProvider.initializeAvatar();
}]);

chatCafe.controller('historyCtrl', ['$scope', '$http', '$anchorScroll', function ($scope, $http, $anchorScroll) {
  $scope.messages = [];

  const fetchData = function () {
    $http.get(`${SERVER_URL}/chat`, httpConfig)
      .success(function (messages) {
        let highestNewId = -Infinity;
        const messageIds = $scope.messages.reduce(function (acc, cur) {
          acc[cur.id] = true;
          if (highestNewId < cur.id) {
            highestNewId = cur.id;
          }
          return acc;
        }, {});

        let shouldScroll = false;
        for (let i = 0; i < messages.length; i++) {
          if (!messageIds[messages[i].id]) {
            shouldScroll = true;
            $scope.messages.push(messages[i]);
          }
        }

        if (shouldScroll) {
          // setTimeout here to give angular a chance to actually add the message
          // we are scrolling to
          setTimeout(() => $anchorScroll(`message-${highestNewId}`), 0);
        }

        setTimeout(fetchData, FETCH_INTERVAL);
      })
      .error(function (err) {
        console.error(`An error has occured: ${err.message}`);
      });
  };

  setTimeout(fetchData, FETCH_INTERVAL);

}]);

chatCafe.controller('messageCtrl', ['$scope', '$http', 'avatarInfo', function ($scope, $http, avatarInfo) {
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
}]);

chatCafe.controller('avatarCtrl', ['$scope', 'avatarInfo', function ($scope, avatarInfo) {
  $scope.master = {
    name: avatarInfo.getName(),
    avatarUrl: avatarInfo.getAvatarUrl(),
  };

  if (!$scope.master.name) {
    $scope.avatarModifier = 'avatar--fullscreen';
  }

  $scope.update = function (user) {
    if (/$\s*^/.test(user.name)) {
      // Reject names that are all whitespace
      $scope.reset();
      return;
    }
    $scope.avatarModifier = '';
    $scope.user = angular.copy(user);
    avatarInfo.setName($scope.user.name);
  };

  $scope.close = function () {

  };

  $scope.reset = function () {
    $scope.user = angular.copy($scope.master);
  };

  $scope.reset();
}]);

chatCafe.provider('avatarInfo', [function () {
  let username = '';
  let avatarUrl = '';
  const localStorageNameKey = 'username';
  const localStorageAvatarUrlKey = 'avatarUrl';

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
    try {
      avatarUrl = localStorage.getItem(localStorageAvatarUrlKey);
    } catch (err) {
      console.error(`Local storage is unavailable: ${err.message}`);
    }
    if (!avatarUrl) {
      avatarUrl = buildRandomAvatar();
    }
    try {
      localStorage.setItem(localStorageAvatarUrlKey, avatarUrl); 
    } catch (err) {
      console.error(`Local storage is unavailable: ${err.message}`);
    }
  };
}]);
