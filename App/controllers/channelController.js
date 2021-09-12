scoutTVApp.controller("channelCtrl", ['$scope', '$rootScope', '$timeout', 'focusController', 'routingService', function ($scope, $rootScope, $timeout, focusController, routingService) {

  $rootScope.channels = [];
  $scope.favoriteChannels = [];
  $scope.preventEventStacking = false;

  $scope.$on('favoriteChannelsLoaded', function (event, args) {
    $rootScope.loadFavoriteChannelsView = false;
    if(args.focusOnFavorite)
      $scope.favoriteChannels = [];

    $timeout(function () {
      if (args.response.length > 0) {
        $rootScope.loadFavoriteChannelsView = true;
        $scope.favoriteChannels = args.response;
        
      } else {
        $rootScope.loadChannelsView = true;
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
      var favChannel = $scope.getChannelByChannelID(channelId)
      if(favChannel)
        $scope.favoriteChannels.push(favChannel)
        $scope.$apply();
    }

  });
  $scope.$on('channelsLoaded', function (event, args) {
    $rootScope.channels = args.response;
    $rootScope.loadChannelsView = true;
  });
  $scope.getChannelByChannelID = function (channelID) {
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
}]);