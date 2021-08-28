scoutTVApp.controller("loginCtrl", ['$scope', '$rootScope','$timeout', 'focusController', 'configService', 'httpService', 'storageService', function ($scope, $rootScope, $timeout, focusController, configService, httpService, storageService) {

    console.log('init login ctrl')
    $scope.username = "aldin";
    $scope.password = "tizenapp";
    //$scope.username = "";
    //$scope.password = "";
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
            $scope.loginErrorMsg = true;
        }
    }
    $scope.login = function ($event, $originalEvent) {
        if($scope.preventDoubleLoad) return;
        $scope.preventDoubleLoad = true;
        if ($scope.username.length && $scope.password.length) {
            $rootScope.showLoader = true;
            //var uid = webapis.network.getMac();
            var uid = '6a2d8e717d47e3874ca7aa3f8b08e2f4'
            var hash = window.btoa($scope.username + ":" + $scope.password);
            httpService.login(hash, uid);
        }
        else{
            console.log('here?');
            $scope.loginErrorMsg = true;
            $scope.errorMsgValue = 'Email/Username or Password field cannot be empty!';
        }
        $timeout(function () {
            $scope.preventDoubleLoad = false;
        }, 10);
    }
    $scope.$on('loginError', function (event, args) {
        $rootScope.showLoader = false;
          if (args.response)
              $scope.errorMsgValue = args.response;
          else
              $scope.errorMsgValue = translateService.errorMessages.generalError;
  
          $scope.loginErrorMsg = true;
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
            alert('auto login event on load')
        } else {
            $scope.openLoginScreen();

        }
    }
    angular.element(document).ready(function () {
        $scope.autoLogin();
    })
}]);
