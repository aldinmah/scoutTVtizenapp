scoutTVApp.controller("templateCtrl", ['$scope', '$rootScope', '$timeout', 'focusController', 'routingService', 'httpService', function ($scope, $rootScope, $timeout, focusController, routingService, httpService) {

    $rootScope.showMainTemplate = false;
    $rootScope.showHomeTemplate = false;
    $rootScope.showLoginTemplate = false;
    $rootScope.showLoginForm = false;
    $rootScope.showLoader = false;
    $rootScope.showMainMenu = true;
    $rootScope.showForgotPasswordForm = false;
    $rootScope.showActiveTemplateInMenuBox = false;
    $rootScope.loadFavoriteChannelsView = false;
    $rootScope.loadChannelsView = false;
    $rootScope.activeTemplate = '';
    
    /*Help bar buttons*/
    $rootScope.showHelpBar = false;
    $rootScope.addToFavoritesHelpButton = true;
    $rootScope.removeFromFavoritesHelpButton = false;

    $scope.openLoginScreen = function (skipRouteStack) {
        if (!skipRouteStack)
            routingService.addRouteToStack("openLoginScreen");
        $rootScope.showLoginTemplate = true;
        $rootScope.showLoginForm = true;
        
        focusController.setDepth(0);
        focusController.focus('loginUsernameInput');

    };
    $scope.openForgotPasswordForm = function (skipRouteStack) {
      if (!skipRouteStack)
          routingService.addRouteToStack("openForgotPasswordForm");
      $rootScope.showForgotPasswordForm = true;
      $rootScope.showLoginForm = false;
      $scope.forgotPasswordEmail = '';
      
      focusController.focus('forgotPasswordInput');

  };
    $scope.hideAllTemplates = function () {
        $rootScope.showMainTemplate = false;
        $rootScope.showHomeTemplate = false;
        $rootScope.showLoginTemplate = false;
        $rootScope.showForgotPasswordForm = false;
        $rootScope.loadFavoriteChannelsView = false;
        $rootScope.loadChannelsView = false;
    }
    $scope.openTemplate = function ($event, $originalEvent) {
        var selectedTemplate = $($event.currentTarget).data("open-template");
        switch (selectedTemplate) {
            case 'login':
                $scope.hideAllTemplates();
                $scope.openLoginScreen(false);
                break;
            case 'home':
                $rootScope.showLoader = true;
                $scope.openHomeTemplate(false);
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
        if(activeItem.data("channelitem")){
          if(activeItem.find(".isFavorite").html()=="true"){
            $rootScope.addToFavoritesHelpButton = false;
            $rootScope.removeFromFavoritesHelpButton = true;
          }
          else{
            $rootScope.addToFavoritesHelpButton = true;
            $rootScope.removeFromFavoritesHelpButton = false;
          }
          $rootScope.showHelpBar = true;
        }
        else
          $rootScope.showHelpBar = false;

        var dataFocusableGroup = focusController.getCurrentGroup()
        switch (dataFocusableGroup) {
            case 'forgotPassword':
                if(event.keyCode == tizen.tvinputdevice.getKey('Back').code){
                    $scope.hideAllTemplates();
                    $scope.openLoginScreen(false);
                }
                break;
            case 'loginScreen':
                if(event.keyCode == tizen.tvinputdevice.getKey('Back').code){
                    $scope.exitApp()
                }
                break;
        
            default:
                break;
        }
        
        switch (event.keyCode) {
            case tizen.tvinputdevice.getKey('ColorF0Red').code:
                console.log("red pressed");
                if(activeItem.data("channelitem")){
                    httpService.handleFavoriteChannel($(activeItem).find(".channelId").html(),$(activeItem).find(".isFavorite").html());
                }
                break;
            case tizen.tvinputdevice.getKey('ColorF1Green').code:
                console.log("green pressed");
                break;
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
    
    $scope.openHomeTemplate = function (skipRouteStack) {
        if (!skipRouteStack)
            routingService.addRouteToStack("openHomeTemplate");
        focusController.setDepth(0);
        $scope.hideAllTemplates();
        $rootScope.showMainTemplate = true;
        $rootScope.showHomeTemplate = true;
        focusController.setDepth(0);
        $rootScope.activeTemplate = 'Home';
       
        $rootScope.showLoader = false;
        $rootScope.$broadcast('refreshCurrentTime');
        
        $timeout(function () {
            $rootScope.showActiveTemplateInMenuBox = false;
            $rootScope.showMainMenu = true;
        }, 50);
        $timeout(function () {
            focusController.focus("menuItem0");
        }, 150);
    };
    $scope.$on('Invoke-openHomeTemplate', function (event, args) {
        var skipRouteStack = false;
        if (args && args.skipRouteStack)
            skipRouteStack = args.skipRouteStack;
        $scope.openHomeTemplate(skipRouteStack);
    });

    $scope.exitApp = function(){
      tizen.application.getCurrentApplication().exit();
    }
}]);
