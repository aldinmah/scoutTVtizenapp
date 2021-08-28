scoutTVApp.controller("templateCtrl", ['$scope', '$rootScope', 'focusController', 'routingService', function ($scope, $rootScope, focusController, routingService) {

    $rootScope.showMainTemplate = false;
    $rootScope.showLoginTemplate = false;
    $rootScope.showLoginForm = false;
    $rootScope.showLoader = false;
    $rootScope.showForgotPasswordForm = false;

    $scope.openMainScreen = function (skipRouteStack) {
        if (!skipRouteStack)
            routingService.addRouteToStack("openMainScreen");
        console.log('open main screen');
        focusController.setDepth(0);
    };

    $scope.openLoginScreen = function (skipRouteStack) {
        if (!skipRouteStack)
            routingService.addRouteToStack("openLoginScreen");
        $rootScope.showLoginTemplate = true;
        $rootScope.showLoginForm = true;
        
        focusController.setDepth(0);
    };
    $scope.openForgotPasswordForm = function (skipRouteStack) {
      if (!skipRouteStack)
          routingService.addRouteToStack("openForgotPasswordForm");
      $rootScope.showForgotPasswordForm = true;
      $rootScope.showLoginForm = false;
      $scope.forgotPasswordEmail = '';
      focusController.focus("forgotPassword-input");

  };
    $scope.hideAllTemplates = function () {
        $rootScope.showMainTemplate = false;
        $rootScope.showLoginTemplate = false;
        $rootScope.showForgotPasswordForm = false;
    }
    $scope.openTemplate = function ($event, $originalEvent) {
        var selectedTemplate = $($event.currentTarget).data("open-template");
        switch (selectedTemplate) {
            case 'login':
                $scope.hideAllTemplates();
                $scope.openLoginScreen(false);
                break;
            case 'main':
                $rootScope.showLoader = true;
                $scope.openMainScreen(false);
                break;
            
            default:
                break;
        }

        $timeout(function () {
            $rootScope.showLoader = false;
        }, 1000);
    };
    $rootScope.$on('keydownEvent', function (item, event) {
        /*Help bar control*/
        var activeItem = $(focusController.getCurrentFocusItem());
        switch (event.keyCode) {
            case tizen.tvinputdevice.getKey('ColorF0Red').code:
                console.log("red pressed");

                break;
            case tizen.tvinputdevice.getKey('ColorF1Green').code:
                console.log("green pressed");
              
            case tizen.tvinputdevice.getKey('ColorF2Yellow').code:
                console.log("yellow pressed");
                break;
            case tizen.tvinputdevice.getKey('ColorF3Blue').code:
                console.log("blue pressed");
                break;
            case 65376: // Done
                $('input').blur()
                break;
            case 65385: // Cancel
                $('input').blur();
                break;
            default:
                break;
        }

        if (event.keyCode == 13) {
            event.preventDefault();
            return false;
        }


    });
    
    $scope.exitApp = function(){
      tizen.application.getCurrentApplication().exit();
    }
}]);
