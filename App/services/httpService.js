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
        /*
        $rootScope.$broadcast('highlightedLoaded', {
            response: globalService.MockData.highlightContent
        });
        return;
        */
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
    function getDayEpgByChannelID(filter, fromTimestamp, channelID) {
        var startTimestamp = new Date(fromTimestamp*1000);
        startTimestamp.setUTCHours(0,0,0,0);
        startTimestamp = parseInt(startTimestamp.getTime()/1000)
        var apiUrl = configService.ApiCollection.Epg;
        var to_timestamp = startTimestamp + (60 * 60 * 24);

        if (filter)
            apiUrl += "?filter[from_timestamp]=" + startTimestamp + "&filter[to_timestamp]=" + to_timestamp;
        if(channelID)
            apiUrl += "&filter[id]="+channelID
        var req = {
            method: 'POST',
            url: apiUrl,
            headers: {
                'Token': $rootScope.userToken
            }
        }
        $http(req).then(function (response) {
            if (response.status == 200 && response.data.data) {
                $rootScope.$broadcast('epgChannelListUpdated', {
                    response: response.data.data,
                    channelID: channelID
                });
            
            } else {
                $rootScope.$broadcast('epgChannelListUpdated', {
                    response: [],
                    channelID: channelID
                });
            }
        }, function (response) {
            $rootScope.$broadcast('epgChannelListUpdated', {
                response: [],
                channelID: channelID
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

    function addEpgReminder(channel_id, epg_channel_id, epg_programme_id, remind_me_minutes, epgView) {
        var apiUrl = configService.ApiCollection.addEpgReminder;

        var postData = new FormData();
		postData.append('channel_id', channel_id);
		postData.append('epg_channel_id', epg_channel_id);
		postData.append('epg_programme_id', epg_programme_id);
		postData.append('remind_me', remind_me_minutes);
        axios({
			method: 'post',
			url: apiUrl,
			data: postData,
			headers: {
				'Token': $rootScope.userToken,
			}
		}).then((response)=>{
            if (response.status == 200 && response.data.data) {
                getEpgReminders();
                $rootScope.$broadcast('epgReminderAdded', {
                    response: response.data.data,
                    epgView: epgView
                });
            } else {
                $rootScope.$broadcast('epgReminderAdded', {
                    response: [],
                });
            }
		}).catch((err)=>{
            $rootScope.$broadcast('epgReminderAdded', {
                response: [],
            });
			return err;
		});
    }
    function deleteEpgReminder(reminderId,epgView) {
        var apiUrl = configService.ApiCollection.deleteEpgReminder;
        var postData = new FormData();
		postData.append('id', reminderId);
        axios({
			method: 'post',
			url: apiUrl,
			data: postData,
			headers: {
				'Token': $rootScope.userToken,
			}
		}).then((response)=>{
            if (response.status == 200 && response.data.data) {
                getEpgReminders();
                $rootScope.$broadcast('epgReminderDeleted', {
                    response: response.data.data,
                    epgView: epgView
                });
            } else {
                $rootScope.$broadcast('epgReminderDeleted', {
                    response: [],
                });
            }
		}).catch((err)=>{
            $rootScope.$broadcast('epgReminderDeleted', {
                response: [],
            });
			return err;
		});
    }

    function getEpgReminders() {
        var apiUrl = configService.ApiCollection.getEpgReminders;
        var req = {
            method: 'POST',
            url: apiUrl,
            headers: {
                'Token': $rootScope.userToken
            },
        }

        $http(req).then(function (response) {
            if (response.status == 200 && response.data.data) {
                $rootScope.$broadcast('epgRemindersLoaded', {
                    response: response.data.data,
                });
            } else {
                $rootScope.$broadcast('epgRemindersLoaded', {
                    response: [],
                });
            }
        }, function (response) {
            $rootScope.$broadcast('epgRemindersLoaded', {
                response: [],
            });
        });
    }

    function updateAccountData(accountData) {
        var apiUrl = configService.ApiCollection.UpdateProfile;

        var postData = new FormData();
        if(accountData.profile.first_name)
		    postData.append('first_name', accountData.profile.first_name);

        if(accountData.profile.last_name)
		    postData.append('last_name', accountData.profile.last_name);

        if(accountData.profile.email)
		    postData.append('email', accountData.profile.email);

        if(accountData.profile.username)
		    postData.append('username', accountData.profile.username);

        if(accountData.profile.age)
		    postData.append('age', accountData.profile.age);
        
        if(accountData.profile.sex)
		    postData.append('sex', accountData.profile.sex);

        if(accountData.profile.pin)
		    postData.append('pin', accountData.profile.pin);

        if(accountData.account.purchase_pin)
		    postData.append('purchase_pin', accountData.account.purchase_pin);

        if(accountData.account.billing_first_name)
		    postData.append('billing_first_name', accountData.account.billing_first_name);

        if(accountData.account.billing_email)
		    postData.append('billing_email', accountData.account.billing_email);

        if(accountData.account.billing_address)
		    postData.append('billing_address', accountData.account.billing_address);

        if(accountData.account.billing_last_name)
		    postData.append('billing_last_name', accountData.account.billing_last_name);

        if(accountData.account.billing_country_name)
		    postData.append('billing_country_name', accountData.account.billing_country_name);
        if(accountData.account.billing_country_id)
		    postData.append('billing_country_id', accountData.account.billing_country_id);

        axios({
			method: 'post',
			url: apiUrl,
			data: postData,
			headers: {
				'Token': $rootScope.userToken,
			}
		}).then((response)=>{
            if (response.status == 200 && response.data.data) {
                $rootScope.$broadcast('accountDataUpdated', {response: response.data});
                    
            } else {
                $rootScope.$broadcast('accountDataUpdated', {response: []});

            }
		}).catch((err)=>{
            $rootScope.$broadcast('accountDataUpdated', {response: []});
			return err;
		});
    }
    function createProfile(accountData) {
        var apiUrl = configService.ApiCollection.CreateProfile;

        var postData = new FormData();
        if(accountData.first_name)
		    postData.append('first_name', accountData.first_name);

        if(accountData.last_name)
		    postData.append('last_name', accountData.last_name);

        if(accountData.email)
		    postData.append('email', accountData.email);

        if(accountData.username)
		    postData.append('username', accountData.username);
        
        if(accountData.pin)
		    postData.append('pin', accountData.pin);

        if(accountData.isKidAccount)
		    postData.append('kid', accountData.isKidAccount);
        
        if(accountData.password)
		    postData.append('password', accountData.password);
            
        axios({
			method: 'post',
			url: apiUrl,
			data: postData,
			headers: {
				'Token': $rootScope.userToken,
			}
		}).then((response)=>{
            if (response.status == 200 && response.data.data) {
                
                $rootScope.$broadcast('accountProfileCreated', {response: response.data});
                    
            } else {
                $rootScope.$broadcast('accountProfileCreated', {response: []});

            }
		}).catch((err)=>{
            $rootScope.$broadcast('accountProfileCreated', {response: []});
			return err;
		});
    }
    function getAllDevices() {
        var req = {
            method: 'GET',
            url: configService.ApiCollection.GetAllDevices,
            headers: {
                'Token': $rootScope.userToken
            }
        }
        $http(req).then(function (response) {
            if (response.status == 200 && response.data.data) {
                $rootScope.$broadcast('allDevicesLoaded', {
                    response: response.data.data
                });
            } else {
                $rootScope.$broadcast('allDevicesLoaded', {
                    response: []
                });
            }
        }, function (response) {
            $rootScope.$broadcast('allDevicesLoaded', {
                response: []
            });
        });
    }
    function getPaymentHistory() {
        var req = {
            method: 'GET',
            url: configService.ApiCollection.PaymentHistory,
            headers: {
                'Token': $rootScope.userToken
            }
        }
        $http(req).then(function (response) {
            if (response.status == 200 && response.data.data) {
                $rootScope.$broadcast('paymentHistoryLoaded', {
                    response: response.data.data.items
                });
            } else {
                $rootScope.$broadcast('paymentHistoryLoaded', {
                    response: []
                });
            }
        }, function (response) {
            $rootScope.$broadcast('paymentHistoryLoaded', {
                response: []
            });
        });
    }
    function getCountries() {
        var req = {
            method: 'GET',
            url: configService.ApiCollection.Countries,
            headers: {
                'Token': $rootScope.userToken
            }
        }
        $http(req).then(function (response) {
            if (response.status == 200 && response.data.data) {
                var countriesObject = response.data.data
                var countryList = []
                Object.keys(countriesObject).map((key) => {
                    countryList.push({
                        value:Number(key),
                        name:countriesObject[key]
                    })
                });
                $rootScope.$broadcast('countriesLoaded', {
                    response: countryList
                });
            } else {
                $rootScope.$broadcast('countriesLoaded', {
                    response: []
                });
            }
        }, function (response) {
            $rootScope.$broadcast('countriesLoaded', {
                response: []
            });
        });
    }
    
    function initAPICall() {
        getHighlighted()
        getChannels()
        getChannelCategories()
        getFavoriteChannels()
        getEpg(true, 1, 2),
        getEpgReminders(),
        getCountries()
    }
    return {
        login: login,
        logout: logout,
        checkToken: checkToken,
        forgotPassword: forgotPassword,
        getChannels: getChannels,
        handleFavoriteChannel: handleFavoriteChannel,
        initAPICall: initAPICall,
        getEpg: getEpg,
        getDayEpgByChannelID: getDayEpgByChannelID,
        addEpgReminder: addEpgReminder,
        deleteEpgReminder: deleteEpgReminder,
        getEpgReminders: getEpgReminders,
        updateAccountData: updateAccountData,
        getAllDevices: getAllDevices,
        createProfile: createProfile,
        getPaymentHistory: getPaymentHistory
    }
});