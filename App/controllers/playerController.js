scoutTVApp.controller("playerCtrl", ['$scope', '$rootScope', '$timeout', 'focusController', 'routingService', function($scope, $rootScope, $timeout, focusController, routingService) {

    /*Channels*/
    $rootScope.currentPlayingChannel = {};
    $rootScope.currentFocusedChannel = {};
    $rootScope.channelTemplate = true;
    $rootScope.avPlayerObj = document.getElementById("av-player");
    $rootScope.currentPlayingVod = {};
    $scope.bufferPercentage = 0;
    $scope.focusItems = ['1','2'];
    $scope.listener = {
      onbufferingstart: function() {
        console.log("Buffering start.");
      },
      onbufferingprogress: function(percent) {
        console.log("Buffering progress percent : " + percent);
        $scope.bufferPercentage = percent+"%";
        $scope.$apply()
      },
      oncurrentplaytime: function(currentTime) {
        //console.log('oncurrentplaytime');
      },
      onbufferingcomplete: function() {
        console.log('onbufferingcomplete');
        $rootScope.showPlayerLoader = false;
        $scope.$apply()
      },
      onevent: function(eventType, eventData) {
        console.log("event type data");
        console.log(eventType);
        console.log(eventData);
      },
      onerror: function(eventType) {
        console.log("event type error : ");
        console.log(eventType);
        $rootScope.showPlayerLoader = false;
      },
      ondrmevent: function(drmEvent, drmData) {
        console.log("DRM callback: " + drmEvent + ", data: " + drmData);
      },
      onstreamcompleted: function() {
        console.log("Stream Completed");
      }
    };
  
    $scope.sentPreviousChannelDataToSocket = function() {
      console.log('sentPreviousChannelDataToSocket');
    }
    $scope.playerKeyDown = function ($event, $originalEvent) {
        console.log($event.keyCode);
    }
    function successCallback() {
        console.log('all good!');
        if (webapis.avplay.getState() != "PLAYING")
          webapis.avplay.play();
        else {
          webapis.avplay.suspend();
          webapis.avplay.play();
        }
        $rootScope.showPlayerLoader = false;
        $scope.$apply();
    }
    function errorCallback(error) {
        console.log('prepareAsync errorCallback!');
        console.log(error);
    }
    $rootScope.playChannel = function(channel) {
      $scope.bufferPercentage = 0;
      $rootScope.showPlayerLoader = true;
      $rootScope.channelTemplate = true;
      $rootScope.currentPlayingChannel = channel;
      $rootScope.currentFocusedChannel = channel;
      var channelUrl = channel.primary_url;
      
      try {
        
        if (webapis.avplay.getState() == "NONE") {
          webapis.avplay.open(channelUrl);
        } else {
          webapis.avplay.close();
          webapis.avplay.open(channelUrl);
        }

        // For the initial buffering
        webapis.avplay.setBufferingParam("PLAYER_BUFFER_FOR_PLAY","PLAYER_BUFFER_SIZE_IN_SECOND", 1); // 5 is in seconds
        // For the rebuffering
        webapis.avplay.setBufferingParam("PLAYER_BUFFER_FOR_RESUME","PLAYER_BUFFER_SIZE_IN_SECOND", 5); // 15 is in seconds
        webapis.avplay.setListener($scope.listener);
        webapis.avplay.setDisplayRect($rootScope.avPlayerObj.offsetLeft, $rootScope.avPlayerObj.offsetTop, $rootScope.avPlayerObj.offsetWidth, $rootScope.avPlayerObj.offsetHeight);
        webapis.avplay.prepareAsync(successCallback, errorCallback);
        //webapis.avplay.play();
        
      } catch (e) {
        //webapis.avplay.close();
        console.log("PlayerController PlayChannel method exception");
        console.log(e);
      }
    };
    $scope.playChannelFromSidebar = function(channelID) {
      let channel = $rootScope.getChannelByChannelID(channelID)
      if(channel)
        $rootScope.playChannel(channel);
      else
        alert("Channel can't be played. Please try again later.")
    };
    $rootScope.$on('resumePlayer', function(event, args) {
      if (webapis.avplay.getState() == "PAUSED"){
        webapis.avplay.play();
        webapis.avplay.setSpeed(1);
      }
    });
  
    $rootScope.$on('stopPlayer', function(event, args) {
      if (webapis.avplay.getState() == "PAUSED" || webapis.avplay.getState() == "PLAYING"){
        webapis.avplay.stop();
        webapis.avplay.setSpeed(1);
      }
    });
  
    $rootScope.$on('fastForward', function(event, args) {
      if (webapis.avplay.getState() == "PAUSED" || webapis.avplay.getState() == "PLAYING")
        webapis.avplay.setSpeed(8);
    });
  
    $rootScope.$on('rewindBack', function(event, args) {
      if (webapis.avplay.getState() == "PAUSED" || webapis.avplay.getState() == "PLAYING")
        webapis.avplay.setSpeed(-8);
    });
  
  }]);
  