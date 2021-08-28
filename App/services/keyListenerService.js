scoutTVApp.service('keyListenerService', function ($window, $rootScope) {
    function setKeyListenerOnWindow() {
        $window.addEventListener('keydown', function (e) {
            $rootScope.$broadcast('keydownEvent', e);
        })
    }

    return {
        "setKeyListenerOnWindow": setKeyListenerOnWindow
    }
});
