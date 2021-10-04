scoutTVApp.controller("templateCtrl", ['$scope', '$rootScope', '$timeout', 'focusController', 'routingService', 'httpService', function ($scope, $rootScope, $timeout, focusController, routingService, httpService) {

    $rootScope.showMainTemplate = false;
    $rootScope.showHomeTemplate = false;
    $rootScope.showLoginTemplate = false;
    $rootScope.showLoginForm = false;
    $rootScope.showLoader = false;
    $rootScope.showPlayerLoader = false;
    $rootScope.showMainMenu = true;
    $rootScope.showForgotPasswordForm = false;
    $rootScope.showActiveTemplateInMenuBox = false;
    $rootScope.loadFavoriteChannelsView = false;
    $rootScope.loadChannelsView = false;
    $rootScope.showLiveTVTemplate = false;
    $rootScope.showLiveTVTemplateItems = false;
    $rootScope.loadChannelCategoriesView = false;
    $rootScope.favoriteChannelsExist = false;
    $rootScope.loadLiveTVChannelList = false;
    $rootScope.showSideChannelList = false;
    $rootScope.showChannelInfoBar = false;
    $rootScope.activeTemplate = '';
    $rootScope.focusedSideChannelName = 'sideChannelItem0'
    
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
    $rootScope.hidePlayerTemplate = function () {
        $(".videoTemplateWrapper").hide();
        $("#av-player").hide();
        $rootScope.showPlayerTemplate = false;
        if(webapis.avplay.getState() == "READY" || webapis.avplay.getState() == "PLAYING" || webapis.avplay.getState() == "PAUSED")
        {
          webapis.avplay.suspend();
          webapis.avplay.close();
        }
    };
    $scope.hideAllTemplates = function () {
        $rootScope.showMainTemplate = false;
        $rootScope.showHomeTemplate = false;
        $rootScope.showLoginTemplate = false;
        $rootScope.showForgotPasswordForm = false;
        $rootScope.loadFavoriteChannelsView = false;
        $rootScope.loadChannelsView = false;
        $rootScope.showLiveTVTemplate = false;
        $rootScope.showLiveTVTemplateItems = false;
        $rootScope.loadChannelCategoriesView = false;
        $rootScope.loadLiveTVChannelList = false;
        $rootScope.showSideChannelList = false;
        $rootScope.showChannelInfoBar = false;
        if($rootScope.showPlayerTemplate)
          $rootScope.hidePlayerTemplate();
    }
    $scope.openTemplate = function ($event, $originalEvent) {
        var selectedTemplate = $($event.currentTarget).data("template");
        
        switch (selectedTemplate) {
            case 'login':
                $scope.hideAllTemplates();
                $scope.openLoginScreen(false);
                break;
            case 'home':
                $rootScope.showLoader = true;
                $scope.openHomeTemplate(false);
                break;
            case 'liveTV':
                $rootScope.showLoader = true;
                $scope.openLiveTVTemplate(false);
                break;
            default:
                break;
        }

        $timeout(function () {
            $rootScope.showLoader = false;
        }, 1000);
    };
    $scope.handlePlayerKeyDown = function (item, event) {      
        switch (event.keyCode) {
            case 37: 
                $scope.openSideChannelsTemplate();
                break;
            case 428:
            case 427:
            case 13:
            case 39:
            case 38:
            case 40:
                $scope.openChannelInfoBar(true);
                break;
            case 10009:
            case 8:
                routingService.openPreviousTemplate();
                break;
            default: break
        }
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
        var dataFocusableDepth = focusController.getCurrentDepth()

        console.log('focus depth = ',focusController.getCurrentDepth());
        console.log('activeItem.data("playerfocus") = ',activeItem.data("playerfocus"));

        //Player focus depth 2, focus on player
        if(dataFocusableDepth==2){
            $scope.handlePlayerKeyDown(item, event);
        }
        //Sidebar focus
        else if(dataFocusableDepth==3){
            switch (event.keyCode) {
                case 39:
                    $rootScope.playChannel($rootScope.currentSideBarFocusedChannel, true)
                    break;
                default:
                    break;
            }
        }
        //Channel info box focus
        else if(dataFocusableDepth==4){
            switch (event.keyCode) {
                case 39:
                    $rootScope.$broadcast('updateNextEpgData');
                    break;
                case 37:
                    $rootScope.$broadcast('updatePreviousEpgData');
                    break;
                case 38:
                case 427:
                    $rootScope.$broadcast('selectedEpgChannelDown');
                    $rootScope.playChannel($rootScope.currentFocusedChannel);
                    break;
                case 40:
                case 428:
                    $rootScope.$broadcast('selectedEpgChannelUp');
                    $rootScope.playChannel($rootScope.currentFocusedChannel);
                    break;
                default:
                    break;
            }
        }
        else{
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
        }
        
        
        switch (event.keyCode) {
            case 10009:
            case 8:
                if ($rootScope.showSideChannelList){
                  $rootScope.showSideChannelList = false;
                  focusController.setDepth(2)
                  focusController.focus("playerFocusAnchor");
                  break;
                }
                else if($rootScope.showChannelInfoBar){
                    $rootScope.showChannelInfoBar = false;
                    focusController.setDepth(2)
                    focusController.focus("playerFocusAnchor");
                    break;
                }
                else if(dataFocusableDepth!=2){
                    routingService.openPreviousTemplate();
                }
                break;
            case tizen.tvinputdevice.getKey('ColorF0Red').code:
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
        console.log('openHomeTemplate');
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
        $rootScope.hidePlayerTemplate();
        if($rootScope.favoriteChannelsExist){
            $rootScope.loadFavoriteChannelsView = true;
        }
        $rootScope.loadChannelsView = true;

        $timeout(function () {
            $rootScope.showActiveTemplateInMenuBox = false;
            $rootScope.showMainMenu = true;
        }, 50);
        $timeout(function () {
            focusController.focus("menuItem0");
            $('.mainContentBox').css({top:0})
        }, 150);
    };
    $scope.$on('Invoke-openHomeTemplate', function (event, args) {
        var skipRouteStack = false;
        if (args && args.skipRouteStack)
            skipRouteStack = args.skipRouteStack;
        $scope.openHomeTemplate(skipRouteStack);
    });

    $scope.openLiveTVTemplate = function (skipRouteStack) {
        console.log('openLiveTVTemplate');
        if (!skipRouteStack)
            routingService.addRouteToStack("openLiveTVTemplate");
        $scope.hideAllTemplates();

        $rootScope.showMainTemplate = true;
        $rootScope.showLiveTVTemplate = true;
        $rootScope.linearSubmenuView = true;
        $rootScope.loadChannelCategoriesView = true;
        $rootScope.showLiveTVTemplateItems = true;
        $rootScope.loadLiveTVChannelList = true;
        $rootScope.activeTemplate = 'LiveTV';
        $rootScope.hidePlayerTemplate();
        focusController.setDepth(0);
        $rootScope.currentFocusDepth = 0;
        $rootScope.$broadcast('loadLiveTVtemplateInit');
        $('.mainContentBox').css({top:0})
        $timeout(function () {
            focusController.focus("liveTVChannelCategoryItem0");
        }, 1000);
    };
    $scope.$on('Invoke-openLiveTVTemplate', function (event, args) {
        var skipRouteStack = false;
        if (args && args.skipRouteStack)
            skipRouteStack = args.skipRouteStack;
        $scope.openLiveTVTemplate(skipRouteStack);
    });
    $scope.$on('Invoke-openPlayerTemplate', function (event, args) {
        var skipRouteStack = false;
        if (args && args.skipRouteStack)
            skipRouteStack = args.skipRouteStack;
        $scope.openPlayerTemplate(skipRouteStack);
    });
    $scope.openPlayerTemplate = function (skipRouteStack,focusOnChannel,channel) {
        if (!skipRouteStack)
            routingService.addRouteToStack("openPlayerTemplate");
        $scope.hideAllTemplates();

        $(".videoTemplateWrapper").show();
        $("#av-player").show();
        $rootScope.showPlayerTemplate = true;

        $timeout(function () {
            focusController.setDepth(2)
            focusController.focus("playerFocusAnchor");

            if(focusOnChannel){
              $scope.openChannelInfoBar(true);
              $rootScope.playChannel(channel);
            }
        }, 200);
    };
    $scope.openSideChannelsTemplate = function (skipRouteStack) {
        if (!skipRouteStack)
            routingService.addRouteToStack("openSideChannelsTemplate");

        $rootScope.showSideChannelList = true;
        $timeout(function () {
            focusController.setDepth(3);
            if($rootScope.focusedSideChannelName){
                focusController.focus($rootScope.focusedSideChannelName)
            }
            else{
                focusController.focus("sideChannelItem0")
            }

        }, 200);
    };
    $scope.openChannelInfoBar = function (skipRouteStack) {
        if (!skipRouteStack)
            routingService.addRouteToStack("openChannelInfoBar");

        $rootScope.$broadcast('updateCurrentEpg');
        $rootScope.showChannelInfoBar = true;

        $timeout(function () {
            focusController.setDepth(4);
            focusController.focus("infoBarAnchor")

        }, 200);
    };
    $scope.exitApp = function(){
      tizen.application.getCurrentApplication().exit();
    }
}]);
