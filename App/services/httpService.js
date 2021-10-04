scoutTVApp.factory('httpService', function ($http, $rootScope, configService, globalService, timeDateService) {
    $http.defaults.headers.post['Content-Type'] = 'application/json; charset=UTF-8';

    function login(hash, uid) {
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

    function logout() {
        var req = {
            method: 'GET',
            url: configService.ApiCollection.LogoutApiUrl,
            headers: {
                'Token': $rootScope.userToken
            }
        }
        $http(req).then(function (response) {
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

        $http(req).then(function (response) {
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

    function getHighlighted() {
        //debug, mock data
        $rootScope.$broadcast('highlightedLoaded', {
            response: globalService.MockData.highlightContent
        });
        return;

        var req = {
            method: 'GET',
            url: configService.ApiCollection.highlightContent,
            headers: {
                'Token': $rootScope.userToken
            }
        }
        $http(req).then(function (response) {
            if (response.status == 200 && response.data.data) {
                $rootScope.$broadcast('highlightedLoaded', {
                    response: response.data.data
                });
            } else {
                $rootScope.$broadcast('highlightedLoaded', {
                    response: []
                });
            }
        }, function (response) {
            $rootScope.$broadcast('highlightedLoaded', {
                response: []
            });
        });
    }

    function getFavoriteChannels(skipFocus) {
        var apiUrl = configService.ApiCollection.GetFavoriteChannels + "?config[enable_favorites]=1";
        var req = {
            method: 'POST',
            url: apiUrl,
            headers: {
                'Token': $rootScope.userToken
            }
        }
        $http(req).then(function (response) {
            if (response.status == 200 && response.data.data) {
                $rootScope.$broadcast('favoriteChannelsLoaded', {
                    response: response.data.data,
                    focusOnFavorite: skipFocus
                });
            } else {
                $rootScope.$broadcast('favoriteChannelsLoaded', {
                    response: [],
                    focusOnFavorite: skipFocus
                });
            }
        }, function (response) {
            $rootScope.$broadcast('favoriteChannelsLoaded', {
                response: [],
                focusOnFavorite: skipFocus
            });
        });
    }

    function handleFavoriteChannel(channelId, remove) {
        var apiUrl = configService.ApiCollection.AddFavoriteChannel;
        var isRemoveFavorite = remove != "false";
        if (isRemoveFavorite)
            apiUrl = configService.ApiCollection.RemoveFavoriteChannel;

        var postData = new FormData();
		postData.append('channel_id', channelId);
        axios({
			method: 'post',
			url: apiUrl,
			data: postData,
			headers: {
				'Token': $rootScope.userToken,
			}
		}).then((response)=>{
            if (response.status == 200 && response.data.data) {
                
                $rootScope.$broadcast('handleFavoritesResponse', {
                    channelId: channelId,
                    response: response.data,
                    error: false,
                    isFavoriteAdded : !isRemoveFavorite
                });
                if(isRemoveFavorite)
                    getFavoriteChannels(isRemoveFavorite);
            } else {
                $rootScope.$broadcast('handleFavoritesResponse', {
                    error: true
                });
            }
		}).catch((err)=>{
            $rootScope.$broadcast('handleFavoritesResponse', {
                error: true
            });
			return err;
		});
    }
    function getChannels() {
        var req = {
            method: 'POST',
            url: configService.ApiCollection.GetChannels+"?config[enable_favorites]=1",
            headers: {
                'Token': $rootScope.userToken
            }
        }
        $http(req).then(function (response) {
            if (response.status == 200 && response.data.data) {
                $rootScope.$broadcast('channelsLoaded', {
                    response: response.data.data
                });
            } else {
                $rootScope.$broadcast('channelsLoaded', {
                    response: []
                });
            }
        }, function (response) {
            $rootScope.$broadcast('channelsLoaded', {
                response: []
            });
        });
    }

    function getChannelCategories() {
        var req = {
            method: 'GET',
            url: configService.ApiCollection.GetChannelCategories,
            headers: {
                'Token': $rootScope.userToken
            }
        }
        $http(req).then(function (response) {
            if (response.status == 200 && response.data.data) {

                $rootScope.$broadcast('channelCategoriesLoaded', {
                    response: response.data.data
                });
            } else {
                $rootScope.$broadcast('channelCategoriesLoaded', {
                    response: []
                });
            }
        }, function (response) {
            $rootScope.$broadcast('channelCategoriesLoaded', {
                response: []
            });
        });
    }

    function getEpg(filter, from, to) {
        var apiUrl = configService.ApiCollection.Epg;
        var fromFilter = '';
        var toFilter = '';
        if (from)
            fromFilter = timeDateService.getCurrentTimeFormatedForEpg(-Math.abs(from));
        if (to)
            toFilter = timeDateService.getCurrentTimeFormatedForEpg(Math.abs(to));
        if (filter)
            apiUrl += "?filter[from]=" + fromFilter + "&filter[to]=" + toFilter;
        var req = {
            method: 'POST',
            url: apiUrl,
            headers: {
                'Token': $rootScope.userToken
            }
        }
        $http(req).then(function (response) {
            if (response.status == 200 && response.data.data) {
                $rootScope.$broadcast('epgLoaded', {
                    response: response.data.data
                });
            } else {
                $rootScope.$broadcast('epgLoaded', {
                    response: []
                });
            }
        }, function (response) {
            $rootScope.$broadcast('epgLoaded', {
                response: []
            });
        });
    }

    function initAPICall() {
        getHighlighted()
        getChannels()
        getChannelCategories()
        getFavoriteChannels()
        getEpg(true, 1, 2);
    }
    return {
        login: login,
        logout: logout,
        checkToken: checkToken,
        forgotPassword: forgotPassword,
        getChannels: getChannels,
        handleFavoriteChannel: handleFavoriteChannel,
        initAPICall: initAPICall
    }
});