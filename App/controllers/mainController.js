scoutTVApp.controller("mainCtrl", ['$scope', '$rootScope', '$interval', '$timeout', 'focusController', 'configService', 'timeDateService', 'routingService', 'httpService', function ($scope, $rootScope, $interval, $timeout, focusController, configService, timeDateService, routingService, httpService) {

    $rootScope.currentTime = '';
    $scope.menuItems = [
        {
            name: "Home",
            template: "home"
        },
        {
            name: "Live TV",
            template: "liveTV"
        },
        {
            name: "TV guide",
            template: "epg"
        },
        {
            name: "Settings",
            template: "settings"
        },
        {
            name: "Search",
            template: "search"
        }
        /*{
            name: "Account",
            template: "account"
        },*/
    ];

    $rootScope.highlightedItems = [];

    $scope.clockInitialized = false;
    $scope.epgRefreshInitialized = false;
    $scope.lastBottomScrollValue = 0;

    $scope.$on('highlightedLoaded', function (event, args) {
        $rootScope.highlightedItems = args.response;
        if($rootScope.highlightedItems.length){
          $rootScope.favoriteUpElement = 'highLightedItem0';
          $rootScope.loadHighlightedView = true;
        }
        else{
          $rootScope.loadHighlightedView = false;
          $rootScope.favoriteUpElement = 'menuitem0';
        }
    });

    $scope.openHighlighted = function ($event, $originalEvent,channel) {
        $rootScope.showPlayerLoader = true;
        $timeout(function () {
          $rootScope.$broadcast('Invoke-openPlayerTemplate', {
              skipRouteStack: true
          });
          $rootScope.playChannel(channel);
        }, 10);
    };

    $scope.refreshCurrentTime = function () {
        if (!$scope.clockInitialized)
            $scope.clockInitialized = $interval($scope.refreshCurrentTime, 30000);
        $rootScope.currentTime = timeDateService.getCurrentTimeFormatedHHMM();
    };

    $scope.refreshEpgData = function () {
        if (!$scope.epgRefreshInitialized)
            $scope.epgRefreshInitialized = $interval($scope.refreshEpgData, 600000);
        httpService.getEpg();
    };

    $rootScope.$on("refreshCurrentTime", $scope.refreshCurrentTime);
    $rootScope.$on("refreshEpgData", $scope.refreshEpgData);

    $scope.isScrolledIntoView = function (elem, container, move, customHeader,moveValue) {
        var docViewTop = container.offset().top;
        var docViewBottom = docViewTop + container.height();

        var headerTop = 0;
        var headerBottom = 0;

        if (customHeader) {
            headerTop = customHeader.offset().top;
            headerBottom = headerTop + customHeader.height();
        } else {
            headerTop = $(".headerBox").offset().top;
            headerBottom = headerTop + $(".headerBox").height();
        }


        var elemTop = $(elem).offset().top;
        var elemBottom = elemTop + $(elem).height();

        if (move) {
            if (elemTop > docViewTop && elemBottom > docViewBottom) {
              var moveValuePx = 200;
              if(moveValue)
                moveValuePx = moveValue
                $scope.lastBottomScrollValue = (docViewBottom - elemBottom) - moveValuePx;
                container.animate({
                    top: $scope.lastBottomScrollValue + 'px'
                }, 100)
            } else {
                container.animate({
                    top: '0px'
                }, 100)
            }
            return;
        }
        if (elemTop < headerBottom) {
            return false;
        }
        return (elemBottom <= docViewBottom) && (elemTop >= docViewTop);
    }
    $scope.focusHorizontalItem = function ($event, $originalEvent) {
        var focusedItem = $($event.currentTarget);
        var container = $(".mainContentBox");
        focusedItem.find(".atag").focus();
        if (!$scope.isScrolledIntoView(focusedItem, container)) {
            $scope.isScrolledIntoView(focusedItem, container, true)
        }

    };
    $scope.focusHorizontalSubItem = function ($event, $originalEvent,containerClass) {
        var focusedItem = $($event.currentTarget);
        var container = $("."+containerClass);
        focusedItem.find(".atag").focus();
        if (!$scope.isScrolledIntoView(focusedItem, container)) {
            $scope.isScrolledIntoView(focusedItem, container, true,false,500)
        }
    };
    $scope.resetScrollView = function($event, $originalEvent,containerClass){
      $("."+containerClass).animate({
          top: 0
      }, 100)
    }
    $scope.focus = function ($event, $originalEvent) {
        $($event.currentTarget).find(".anchor").focus();
    };

   }]);
