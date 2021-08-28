scoutTVApp.factory('configService', function () {
    var ApiUrl = 'https://api.www.scouttv.tv';
    return {
        AppName: "ScoutTV",
        DeviceType: "smart-tv",
        ApiUrl: ApiUrl,
        ApiCollection: {
            LoginApiUrl: ApiUrl + "/account/login",
            LogoutApiUrl : ApiUrl + "/account/logout",
            CheckToken: ApiUrl + "/account/check-device-token",
            GetChannels: ApiUrl + "/channels",
            GetChannelCategories: ApiUrl + "/channels/categories",
            GetSubscription: ApiUrl + "/account/get-subscriptions",
            ForgotPasword: ApiUrl + "/account/forgot-password",
            RegisterAccount: ApiUrl + "/account/registration",
            Epg: ApiUrl + "/epgs/index",
            AddFavoriteChannel : ApiUrl + "/channels/add-to-favorites",
            RemoveFavoriteChannel : ApiUrl + "/channels/delete-from-favorites",
            GetFavoriteChannels : ApiUrl + "/channels/favorites",
            getRecommendedMovies : ApiUrl + "/recommendations/vod-list/viewed",
            addEpgReminder : ApiUrl + "/epg-reminders/add",
            deleteEpgReminder : ApiUrl + "/epg-reminders/delete",
            getEpgReminders : ApiUrl + "/epg-reminders/index",
            highlightContent : ApiUrl + "/highlight-contents"
        },
        IpInfo: ApiUrl + "/ip-info",
        CallbackJsonp: "?callback=JSON_CALLBACK",
        epgReminderMinutes: 10,
        checkRemindersInterval : 60000,
        generalErrorMessage : 'Sorry, something went wrong. Please try again later.'
    };
});
