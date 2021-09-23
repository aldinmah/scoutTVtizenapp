scoutTVApp.directive("login", function () {
    return {
        restrict: "E",
        templateUrl: "/App/templates/login.html",
    };
});
scoutTVApp.directive("main", function () {
    return {
        restrict: "E",
        templateUrl: "/App/templates/main.html",
    };
});
scoutTVApp.directive("home", function () {
    return {
        restrict: "E",
        templateUrl: "/App/templates/home.html",
    };
});
scoutTVApp.directive("playerTemplate", function () {
    return {
        restrict: "E",
        templateUrl: "/App/templates/elements/playerTemplate.html",
    };
});
scoutTVApp.directive("channelInfoBar", function () {
    return {
        restrict: "E",
        templateUrl: "/App/templates/channels/channelInfoBar.html",
    };
});