scoutTVApp.controller("playerCtrl", ['$scope', '$rootScope', '$timeout', 'focusController', 'routingService', function($scope, $rootScope, $timeout, focusController, routingService) {

    /*Channels*/
    $rootScope.currentPlayingChannel = {};
    $rootScope.currentFocusedChannel = {};
    $rootScope.currentSideBarFocusedChannel = {};
    $rootScope.channelTemplate = true;
    $rootScope.avPlayerObj = document.getElementById("av-player");
    $rootScope.currentPlayingVod = {};
    $scope.bufferPercentage = 0;
    $scope.focusItems = ['1','2'];
    $scope.audioTracks = [];
    $scope.listener = {
      onbufferingstart: function() {
        //console.log("Buffering start.");
      },
      onbufferingprogress: function(percent) {
        //console.log("Buffering progress percent : " + percent);
        $scope.bufferPercentage = percent+"%";
        $scope.$apply()
      },
      oncurrentplaytime: function(currentTime) {
        //console.log('oncurrentplaytime');
      },
      onbufferingcomplete: function() {
        //console.log('onbufferingcomplete');
        $rootScope.showPlayerLoader = false;
        $scope.$apply()
      },
      onevent: function(eventType, eventData) {
        //console.log("event type data");
        //console.log(eventType);
        //console.log(eventData);
      },
      onerror: function(eventType) {
        //console.log("event type error : ");
        //console.log(eventType);
        $rootScope.showPlayerLoader = false;
      },
      ondrmevent: function(drmEvent, drmData) {
        //console.log("DRM callback: " + drmEvent + ", data: " + drmData);
      },
      onstreamcompleted: function() {
       // console.log("Stream Completed");
      }
    };
  
    $scope.sentPreviousChannelDataToSocket = function() {
     // console.log('sentPreviousChannelDataToSocket');
    }
    $scope.playerKeyDown = function ($event, $originalEvent) {
        //console.log($event.keyCode);
    }
    $scope.handleAudioTracks = function () {
      var totalTrackInfo = webapis.avplay.getTotalTrackInfo();
      $scope.audioTracks = [];
      for (var i=0; i<totalTrackInfo.length;i++)
      {
        if (totalTrackInfo[i].type == "AUDIO")
        {
          totalTrackInfo[i].extra_info = JSON.parse(totalTrackInfo[i].extra_info)
          $scope.audioTracks.push(totalTrackInfo[i])
        }
      }
    }
    $scope.changeAudioTrack = function (audioTrackIndex) {
      if (webapis.avplay.getState() == "READY" || webapis.avplay.getState() == "PLAYING" || webapis.avplay.getState() == "PAUSED"){
        webapis.avplay.setSelectTrack('AUDIO',audioTrackIndex);
      }
    }
    $scope.handleAudioTrackPopup = function () {
      $rootScope.showAudioTrackPopup = !$rootScope.showAudioTrackPopup
    }
    function successCallback() {

        if (webapis.avplay.getState() != "PLAYING")
          webapis.avplay.play();
        else {
          webapis.avplay.suspend();
          webapis.avplay.play();
        }
        $rootScope.showPlayerLoader = false;
        $scope.$apply();
        if (webapis.avplay.getState() == "READY" || webapis.avplay.getState() == "PLAYING" || webapis.avplay.getState() == "PAUSED"){
          $scope.handleAudioTracks();
        }
    }
    function errorCallback(error) {
        
    }
    $rootScope.playChannel = function(channel, sideBarChannel) {
      //console.log(channel);
      $scope.bufferPercentage = 0;
      $rootScope.showPlayerLoader = true;
      $rootScope.channelTemplate = true;
      $rootScope.currentPlayingChannel = channel;
      $rootScope.currentFocusedChannel = channel;
      $rootScope.moreControlsActive = false;
      if(sideBarChannel)
        $rootScope.currentSideBarFocusedChannel = channel;
      var channelUrl = channel.primary_url;
      
      try {
        
        if (webapis.avplay.getState() == "NONE") {
          webapis.avplay.open(channelUrl);
        } else {
          webapis.avplay.close();
          webapis.avplay.open(channelUrl);
        }
        //var BitRateString = "BITRATES=30000~35000|STARTBITRATE=HIGHEST|SKIPBITRATE=LOWEST"
        //webapis.avplay.setStreamingProperty("ADAPTIVE_INFO", BitRateString);
        // For the initial buffering
        webapis.avplay.setBufferingParam("PLAYER_BUFFER_FOR_PLAY","PLAYER_BUFFER_SIZE_IN_SECOND", 1); // 5 is in seconds
        // For the rebuffering
        webapis.avplay.setBufferingParam("PLAYER_BUFFER_FOR_RESUME","PLAYER_BUFFER_SIZE_IN_SECOND", 5); // 15 is in seconds
        webapis.avplay.setListener($scope.listener);
        webapis.avplay.setDisplayRect($rootScope.avPlayerObj.offsetLeft, $rootScope.avPlayerObj.offsetTop, $rootScope.avPlayerObj.offsetWidth, $rootScope.avPlayerObj.offsetHeight);
        webapis.avplay.setDisplayMethod('PLAYER_DISPLAY_MODE_AUTO_ASPECT_RATIO')
        

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
  