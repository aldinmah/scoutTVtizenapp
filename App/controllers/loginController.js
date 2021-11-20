scoutTVApp.controller("loginCtrl", ['$scope', '$rootScope','$timeout', 'focusController', 'configService', 'httpService', 'storageService', 'routingService', function ($scope, $rootScope, $timeout, focusController, configService, httpService, storageService, routingService) {

    $rootScope.removeLoginScreen = false;
    $rootScope.existingPassword = "";
    $scope.username = "";
    $scope.password = "";
    $scope.forgotPasswordEmail = '';
    $scope.forgotPasswordClass = '';
    $scope.errorMsgValue = "";
    $scope.preventDoubleLoad = false;

    $scope.validateEmail = function (email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }
    $scope.focus = function ($event, $originalEvent) {
        $event.preventDefault()
        $($event.currentTarget).find("input").focus();
        return false;
    }
    $scope.change = function ($event, value) {
        if ($event.target.parentNode.title == "username") {
            $scope.username = value;
        } else if ($event.target.parentNode.title == "password") {
            $scope.password = value;
        }
        else if ($event.target.parentNode.title == "forgotemail") {
            $scope.forgotPasswordEmail = value;
        }
        if($scope.username.length || $scope.password.length){
            $scope.errorMsgValue="";
            $scope.loginErrorMsg = false;
        }
    }
    $rootScope.reLogin = function () {
        if ($scope.username.length && $scope.password.length) {
            var uid = webapis.network.getMac();
            //var uid = '6a2d8e717d47e3874ca7aa3f8b08e2f6'
            var hash = window.btoa($scope.username + ":" + $scope.password);
            httpService.login(hash, uid, true);
        }
    }
    $scope.login = function ($event, $originalEvent) {
        if($scope.preventDoubleLoad) return;
        $scope.preventDoubleLoad = true;

        if ($scope.username.length && $scope.password.length) {
            $rootScope.showLoader = true;
            var uid = webapis.network.getMac();
            //var uid = '6a2d8e717d47e3874ca7aa3f8b08e2f6'
            var hash = window.btoa($scope.username + ":" + $scope.password);
            httpService.login(hash, uid);
        }
        else{
            $scope.loginErrorMsg = true;
            if(!$scope.password.length)
                $scope.errorMsgValue = 'Password field cannot be empty!';
            if(!$scope.username.length)
                $scope.errorMsgValue = 'Username field cannot be empty!';
            if(!$scope.password.length && !$scope.username.length)
                $scope.errorMsgValue = 'Username or password field cannot be empty!';
        }
        $timeout(function () {
            $scope.preventDoubleLoad = false;
        }, 10);
    }
    $scope.$on('loginSuccess', function (event, args) {
        var isRelogin = args.isRelogin;

        storageService.set("user-data", args.response);
        $rootScope.loggedUser = args.response;
        $rootScope.loggedUser.existingPassword = $scope.password
        $rootScope.userToken = args.response.device.token;

        if(!isRelogin){
            $rootScope.showLoginTemplate = false;
            $scope.loginErrorMsg = false;
            routingService.clearTemplateStack();
            $rootScope.$broadcast('Invoke-openHomeTemplate', {
                skipRouteStack: false
            });
            $rootScope.removeLoginScreen = true;
            httpService.initAPICall();
        }
    });
    $rootScope.logout = function () {
        httpService.logout();
    }
    $rootScope.$on('logoutSuccess', function (event, args) {
        $rootScope.showLoader = false;
        storageService.destroy("user-data");
        $rootScope.forceOpenTemplateByName('login');
    })
    $scope.$on('loginError', function (event, args) {
        $rootScope.showLoader = false;
        if (args.response)
            $scope.errorMsgValue = args.response;
        else
            $scope.errorMsgValue = configService.generalErrorMessage;

        if($scope.errorMsgValue.length)
            $scope.loginErrorMsg = true;
        else
            $scope.loginErrorMsg = false;
    })
    
    $scope.$on('forgotPasswordCallback', function (event, args){
        if(args.response.status)
          $scope.forgotPasswordClass = "success"
        else
          $scope.forgotPasswordClass = "error"
        
        $scope.forgotPasswordMessage = args.response.message;
    })
    $scope.forgotPassword = function(){
        if ($scope.forgotPasswordEmail) {
            if($scope.validateEmail($scope.forgotPasswordEmail))
                httpService.forgotPassword($scope.forgotPasswordEmail);
            else
                $scope.forgotPasswordMessage = 'Invalid email address!'
        }
        else
            $scope.forgotPasswordMessage = 'Email address cannot be empty!'
    }
    $scope.autoLogin = function () {
        var userData = storageService.get("user-data");
        if (userData) {
            var uid = webapis.network.getMac();
            httpService.autoDeviceLogin(uid)
        } else {
            $scope.openLoginScreen();
           
        }
    }
    angular.element(document).ready(function () {
        var selectedTheme = localStorage.getItem("selectedTheme");
        if(!selectedTheme){
            selectedTheme = 'light'
            localStorage.setItem("selectedTheme",selectedTheme);
        }
        $rootScope.selectedTheme = selectedTheme
        if($rootScope.selectedTheme=='dark')
            $('body').removeClass('light').addClass('dark')
        else
            $('body').removeClass('dark').addClass('light')

        $scope.autoLogin();
    })
}]);
