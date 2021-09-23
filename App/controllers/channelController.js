scoutTVApp.controller("channelCtrl", ['$scope', '$rootScope', '$timeout', 'focusController', 'routingService', function ($scope, $rootScope, $timeout, focusController, routingService) {

  $rootScope.channels = [];
  $rootScope.currentSideBarFocusedChannel = {};
  $scope.filteredChannels = [];
  $scope.favoriteChannels = [];
  $scope.channelCategoriesRaw = [];
  $scope.channelCategories = [];
  $scope.verticalChannelListReady = false;
  $scope.channelCategoryAll = {
    id: 'all',
    name: "All",
  };
  
  $scope.preventEventStacking = false;

  $scope.$on('favoriteChannelsLoaded', function (event, args) {
    $rootScope.loadFavoriteChannelsView = false;
    if(args.focusOnFavorite)
      $scope.favoriteChannels = [];

    $timeout(function () {
      if (args.response.length > 0) {
        $rootScope.loadFavoriteChannelsView = true;
        $rootScope.favoriteChannelsExist = true;
        $scope.favoriteChannels = args.response;
        
      } else {
        $rootScope.loadChannelsView = true;
        $rootScope.favoriteChannelsExist = false;
      }
    }, 0);
    if(args.focusOnFavorite){
      $timeout(function () {
        if (args.response.length > 0) 
          focusController.focus('favoriteChannel0')
        else
          focusController.focus('channelListItem0')
      }, 500);
    }
  });
  $scope.$on('handleFavoritesResponse', function (event, args) {
    var channelId = args.channelId;
    var error = args.error;
    
    if (!error)
      $scope.updateChannelInList(channelId, args.response.status);

    if(args.isFavoriteAdded){
      var favChannel = $rootScope.getChannelByChannelID(channelId)
      if(favChannel)
        $scope.favoriteChannels.push(favChannel)
        $scope.$apply();
    }

  });
  $scope.$on('channelsLoaded', function (event, args) {
    $rootScope.channels = args.response;
    $rootScope.loadChannelsView = true;
  });
  $rootScope.getChannelByChannelID = function (channelID) {
    var channel = null;
    for(var i=0;i<$rootScope.channels.length;i++){
      if($rootScope.channels[i].id == channelID)
        channel = $rootScope.channels[i];
    }
    return channel;
  }
  $scope.updateChannelInList = function (channelId, status) {
    
    for (var i = 0; i < $rootScope.channels.length; i++) {
      if ($rootScope.channels[i].id == parseInt(channelId)) {
        if ($rootScope.channels[i].favorite) {
          $rootScope.addToFavoritesHelpButton = true;
          $rootScope.removeFromFavoritesHelpButton = false;
          $rootScope.channels[i].favorite = false;
        } else {
          $rootScope.addToFavoritesHelpButton = false;
          $rootScope.removeFromFavoritesHelpButton = true;
          $rootScope.channels[i].favorite = true;
        }
      }
    }
  }

  $scope.$on('channelCategoriesLoaded', function (event, args) {
    $scope.channelCategoriesRaw = args.response;
    $scope.channelCategories = args.response;
    $scope.channelCategories.unshift($scope.channelCategoryAll);
    $rootScope.loadChannelCategoriesView = true;
  });
  $rootScope.$on('loadLiveTVtemplateInit', function (event, args) {
    $scope.filterChannelsByGenre();
  });
  $scope.getCategoryById = function (id) {
    for (var i = 0; i < $scope.channelCategoriesRaw.length; i++)
        if ($scope.channelCategoriesRaw[i].id == id)
            return $scope.channelCategoriesRaw[i];
  };

  $scope.filterChannelsByGenre = function ($event, $originalEvent) {
    $scope.loadLiveTVChannelList = false;

    var genreId = 'all';
      if($event && $($event.currentTarget).data("itemid"))
        genreId = $($event.currentTarget).data("itemid")

      var itemindex = 0;
      if($event && $($event.currentTarget).data("itemindex"))
        itemindex = $($event.currentTarget).data("itemindex")

      $(".activeGenre").removeClass("activeGenre");
      $(".categoryItem" + genreId).addClass("activeGenre");
      if (genreId != "all")
          $scope.selectedGenre = $scope.getCategoryById(genreId);

      if (genreId == "all") {
          $scope.filteredChannels = $rootScope.channels;
      } else {
          $scope.filteredChannels = [];
          _.filter($rootScope.channels, function (channel) {
              var filteredChannels = [];
              if (channel.channel_categories.length > 0) {
                  _.filter(channel.channel_categories, function (item) {
                      if (item.id == genreId)
                          $scope.filteredChannels.push(channel);
                  })
              }
          });
      }
      $timeout(function () {
        $scope.loadLiveTVChannelList = true;
      },0)
  };

  $scope.$on('openChannel', function (event, args) {
    $rootScope.showPlayerLoader = true;

    $timeout(function () {
      $rootScope.$broadcast('Invoke-openPlayerTemplate', {
          skipRouteStack: false
      });
      $rootScope.playChannel($rootScope.selectedChannel);
    }, 10);
  });
  $rootScope.openChannelByChannelID = function (channelID) {
    $scope.openChannel(null,null,channelID)
  }
  $rootScope.focusSideBarChannel = function (index, channelID) {
    $rootScope.focusedSideChannelName = 'sideChannelItem'+index;
    let channel = $rootScope.getChannelByChannelID(channelID)
    if(channel){
      $rootScope.currentSideBarFocusedChannel = channel
      $rootScope.$broadcast('updateCurrentSideBarEpg');
    }
  }
  $scope.openChannel = function ($event, $originalEvent, channelID) {

    var channel = $rootScope.getChannelByChannelID(channelID);
    console.log('opening channel');
    console.log(channel);
    $rootScope.channelTemplate = true;
    if (channel) {
      $rootScope.selectedChannel = channel;
      if(channel.parental_rating && channel.parental_rating.require_pin)
      {
        $scope.openParentalPinPopup(true,true);
      }else{
        $rootScope.showPlayerLoader = true;
        $timeout(function () {
          $rootScope.$broadcast('Invoke-openPlayerTemplate', {
              skipRouteStack: true
          });
          $rootScope.playChannel(channel);
        }, 10);
      }
    }
  };

}]);