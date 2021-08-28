scoutTVApp.factory('httpService', function ($http, $rootScope, configService) {
    $http.defaults.headers.post['Content-Type'] = 'application/json; charset=UTF-8';

    function login(hash, uid) {
        console.log('login api called');
        var req = {
            method: 'POST',
            url: configService.ApiCollection.LoginApiUrl,
            headers: {
                'Authorization': 'Basic ' + hash,
                'Device': "smart-tv",
                'UID': uid
            }
        }
        $http(req).then(function (response) {
            console.log(response);
            if (response.status == 200 && response.data.data) {
                $rootScope.$broadcast('loginSuccess', {
                    response: response.data.data
                });
            } else {
                $rootScope.$broadcast('loginError', {
                    response: response.data.message
                });
            }

        }, function (response) {
            $rootScope.$broadcast('loginError', {
                response: configService.generalErrorMessage
            });
        });
    }

    function logout(){
      var req = {
          method: 'GET',
          url: configService.ApiCollection.LogoutApiUrl,
          headers: {
              'Token': $rootScope.userToken
          }
      }
      $http(req).then(function (response) {
        console.log(response);
          if (response.status == 200 && response.data.data) {
              $rootScope.$broadcast('logoutSuccess', {
                    response: response.data.data
              });
          } else {
              $rootScope.$broadcast('logoutError', {
                    response: response.data.message
              });
          }

      }, function (response) {
          $rootScope.$broadcast('logoutError', {
                response: configService.generalErrorMessage
          });
      });
    }

    function checkToken(token) {
        var req = {
            method: 'POST',
            url: configService.ApiCollection.CheckToken,
            headers: {
                'Token': $rootScope.userToken
            }
        }
        $http(req).then(function (response) {
            if (response.status == 200 && response.data.data) {
                $rootScope.userToken = response.data.data.token;
                $rootScope.$broadcast('tokenValid', {
                    response: response.data.data
                });
            } else {
                $rootScope.userToken = '';
                $rootScope.$broadcast('tokenExpired', {
                    response: response.data.data
                });
            }

        }, function (response) {
            $rootScope.userToken = '';
            $rootScope.$broadcast('tokenExpired', {
                response: response.data
            });
        });
    }

    function forgotPassword(email) {
      var req = {
          method: 'POST',
          url: configService.ApiCollection.ForgotPasword,
          data: $.param({
              'email': email
          }),
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
          }
      }
      console.log(email);
      $http(req).then(function (response) {
          console.log(response);
          if (response.status == 200 && response.data.status) {
              $rootScope.$broadcast('forgotPasswordCallback', {
                  successMessage: response.data,
                  response: response.data
              });
          } else {
              $rootScope.$broadcast('forgotPasswordCallback', {
                  response: response.data
              });
          }
      }, function (response) {
          $rootScope.$broadcast('forgotPasswordCallback', {
              response: response.data
          });
      });
    }

    function initAPICall() {
        
    }
    return {
        login: login,
        logout: logout,
        checkToken: checkToken,
        forgotPassword: forgotPassword,
        initAPICall: initAPICall
    }
});
