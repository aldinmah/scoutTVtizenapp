scoutTVApp.controller("epgCtrl", ['$scope', '$rootScope', '$timeout', '$interval', 'focusController', 'routingService', 'timeDateService', 'configService', function($scope, $rootScope, $timeout, $interval, focusController, routingService, timeDateService, configService) {

    $scope.epg = [];
    $scope.epgRawData = [];
    $scope.numberOfChannels = 8;
    $scope.timelineDaysPast = 1;
    $scope.timelineDaysFuture = 1;
    $scope.timeline = [];
    $scope.currentTimelineTime = "";
    $scope.pixelSizeInMinutes = 11.2;
    $scope.focusedEpgItem = {};
    $scope.focusedEpgChannelTitle = "";
    $scope.focusedEpgChannelLogo = "";
    $scope.focusedEpgChannelItemStart = 0;
    $scope.focusedEpgChannelItemStop = 0;
    $scope.focusedEpgChannelItemDesc = "";
    $scope.focusedEpgChannelItemTitle = "";
    $scope.channelRow = 0;
    $scope.channelRowItemIndex = -1;
    $rootScope.catchupStartEndTime = "";
    $scope.focusedNoEpgStartEndTime = "";
    $rootScope.currentEpg = {};
    $rootScope.currentSideBarEpg = {};
    $rootScope.currentEpgChannelIndex = 0;
    $rootScope.currentEpgProgrammeIndex = 0;
    $rootScope.currentFocusedChannelIndex = 0;
    $rootScope.currentFocusedEpgElement = null;
    $rootScope.epgCatchupHoursPast = 0;
    $rootScope.showCatchUpIcon = false;
    $rootScope.catchupStart = 0;
    $rootScope.catchupDuration = 0;
    $rootScope.remindersInterval = 0;
  
    $rootScope.epgReminders = [];
  
    $rootScope.$on('epgLoaded', function(event, args) {
      $scope.epgRawData = args.response;
      $rootScope.loadEpgView = true;
      $scope.prePareEpgData();
      $scope.createTimeline();
    });
    $scope.updateEpgItemByEpgChannelId = function(response, deleteReminder){
      for (var i = 0; i < $scope.epg.length; i++) {
        if ($scope.epg[i].epg_channel_id == response.epg_channel_id) {
          for (var j = 0; j < $scope.epg[i].programmes.length; j++) {
            if($scope.epg[i].programmes[j].id==response.epg_programme_id){
              if(deleteReminder){
                $scope.epg[i].programmes[j].hasReminder = false;
                $scope.epg[i].programmes[j].reminderData = null;
                $rootScope.currentEpg = $scope.epg[i].programmes[j];
              }
              else{
                $scope.epg[i].programmes[j].hasReminder = true;
                $scope.epg[i].programmes[j].reminderData = response;
                $rootScope.currentEpg = $scope.epg[i].programmes[j];
              }
              return true;
            }
          }
        }
      }
      return false;
    }
    $scope.checkIfReminderIsAdded = function(stringId){
      if($rootScope.epgReminders.length>0){
        for (var i = 0; i < $rootScope.epgReminders.length; i++) {
          if($rootScope.epgReminders[i].string_id == stringId)
            return true;
        }
      }
      return false;
    }
    $rootScope.$on('epgReminderAdded', function(event, args) {
      if(args.response.epg_channel_id && args.response.epg_programme_id){
        $scope.updateEpgItemByEpgChannelId(args.response);
      }
    });
    $rootScope.$on('epgReminderDeleted', function(event, args) {
      if(args.response.epg_channel_id && args.response.epg_programme_id){
        $scope.updateEpgItemByEpgChannelId(args.response,true);
      }
    });
    $rootScope.checkReminders = function(){
      if(!$rootScope.showEpgReminderPopup)
      {
        for(var i=0;i<$rootScope.epgReminders.length;i++){
          if($rootScope.epgReminders[i].activate_time){
            var date = new Date($rootScope.epgReminders[i].activate_time)
            var dateWithoutTimezone = new Date(date.getTime() + (date.getTimezoneOffset() * 60000));
            if(dateWithoutTimezone < new Date()){
              $rootScope.activeEpgReminder = $rootScope.epgReminders[i];
              $rootScope.activeEpgReminder.startFormated = timeDateService.formatDateToHHMM($rootScope.epgReminders[i].epg_programme.start)
              $rootScope.activeEpgReminder.channel = $rootScope.getChannelByEpgChannelId($rootScope.epgReminders[i].epg_channel_id);
              $scope.openEpgReminderPopup();
            }
          }
        }
      }
    };
  
    $rootScope.$on('epgRemindersLoaded', function(event, args) {
      $rootScope.epgReminders = args.response;
      if($rootScope.remindersInterval)
        $interval.cancel($rootScope.remindersInterval);
      $rootScope.remindersInterval = $interval(function () {
        $rootScope.checkReminders();
      }, configService.checkRemindersInterval);
    });
    $rootScope.$on('updateCurrentEpg', function(event, args) {
      $rootScope.showAddReminderBtn = false;
      var currentDate = new Date();
      for (var i = 0; i < $scope.epg.length; i++) {
  
        if ($scope.epg[i].epg_channel_id == $rootScope.currentFocusedChannel.epg_channel_id) {
          for (var j = 0; j < $scope.epg[i].programmes.length; j++) {
  
            var startTime = timeDateService.createSafariDate($scope.epg[i].programmes[j].start);
            var endTime = timeDateService.createSafariDate($scope.epg[i].programmes[j].stop);
            if (startTime < currentDate && currentDate < endTime) {
              $rootScope.currentEpg = $scope.epg[i].programmes[j];
              $rootScope.currentEpgChannelIndex = i;
              $rootScope.currentEpgProgrammeIndex = j;
              $rootScope.currentEpg.focusedEpgChannelItemStartEndTime = timeDateService.formatDateToHHMM(startTime, true) + " - " + timeDateService.formatDateToHHMM(endTime, true);
              return false;
            } else
              $rootScope.currentEpgChannelIndex = -1;
          }
        }
      }
      $rootScope.currentEpg = {};
      $rootScope.currentEpg.focusedEpgChannelItemStartEndTime = "";
  
      var startDate = new Date();
      var endDate = timeDateService.addHoursToDate(startDate, 1) //Add one hour to start time
      $rootScope.catchupStartEndTime = timeDateService.formatDateToHHMM(startDate, true) + " - " + timeDateService.formatDateToHHMM(endDate, true)
  
    });
    $rootScope.$on('updateCurrentSideBarEpg', function(event, args) {
        var currentDate = new Date();
        for (var i = 0; i < $scope.epg.length; i++) {
          if ($scope.epg[i].epg_channel_id == $rootScope.currentSideBarFocusedChannel.epg_channel_id) {
            for (var j = 0; j < $scope.epg[i].programmes.length; j++) {
              var startTime = timeDateService.createSafariDate($scope.epg[i].programmes[j].start);
              var endTime = timeDateService.createSafariDate($scope.epg[i].programmes[j].stop);
              if (startTime < currentDate && currentDate < endTime) {
                $rootScope.currentSideBarEpg = $scope.epg[i].programmes[j];
                $rootScope.currentSideBarEpg.focusedEpgChannelItemStartEndTime = timeDateService.formatDateToHHMM(startTime, true) + " - " + timeDateService.formatDateToHHMM(endTime, true);
                return false;
              }
            }
          }
        }
        $rootScope.currentSideBarEpg = {};
        $rootScope.currentSideBarEpg.focusedEpgChannelItemStartEndTime = "";
    });
    $rootScope.$on('updateNextEpgData', function(event, args) {
      if ($rootScope.currentFocusedChannel.epg_channel_id) {
        if ($rootScope.currentEpgChannelIndex > -1 && $rootScope.currentEpgProgrammeIndex < $scope.epg[$rootScope.currentEpgChannelIndex].programmes.length - 1) {
          $rootScope.currentEpgProgrammeIndex++;
          var currentDate = new Date();
          var epgProgramme = $scope.epg[$rootScope.currentEpgChannelIndex].programmes[$rootScope.currentEpgProgrammeIndex];
  
          var startTime = timeDateService.createSafariDate(epgProgramme.start);
          var endTime = timeDateService.createSafariDate(epgProgramme.stop);
          var startTimeWithOffset = new Date(startTime.getTime() - currentDate.getTimezoneOffset() * 60 * 1000);
          var endTimeWithOffset = new Date(endTime.getTime() - currentDate.getTimezoneOffset() * 60 * 1000);
  
          $rootScope.currentEpg = $scope.epg[$rootScope.currentEpgChannelIndex].programmes[$rootScope.currentEpgProgrammeIndex];
          $rootScope.currentEpg.hasReminder = false;
          $rootScope.currentEpg.focusedEpgChannelItemStartEndTime = timeDateService.formatDateToHHMM(startTime, true) + " - " + timeDateService.formatDateToHHMM(endTime, true);
  
          $rootScope.showAddReminderBtn = false;
          if($rootScope.currentFocusedChannel.catchup_enabled & startTime < currentDate){
            if(endTime>currentDate){
              $rootScope.showCatchUpIcon = false;
            }
            else {
              $rootScope.showCatchUpIcon = true;
              $rootScope.catchupStart = parseInt(startTime.getTime()/1000);
              $rootScope.catchupDuration = parseInt((endTime.getTime()-startTime.getTime())/1000);
            }
          }
          else {
  
            $rootScope.showCatchUpIcon = false;
            $rootScope.showAddReminderBtn = true;
            if(endTime < currentDate)
              $rootScope.showAddReminderBtn = false;
            else if(startTime < currentDate)
              $rootScope.showAddReminderBtn = false;
            else if($scope.checkIfReminderIsAdded($rootScope.currentEpg.string_id)){
              $rootScope.currentEpg.hasReminder = true;
              $rootScope.currentEpg.reminder_string_id = $rootScope.currentEpg.string_id;
  
            }
          }
        }
      } else {
        var now = new Date();
        var startDate = timeDateService.addHoursToDate(new Date(), $rootScope.epgCatchupHoursPast);
        var endDate = timeDateService.addHoursToDate(startDate, 1) //Add one hour to start time
        $rootScope.showAddReminderBtn = false;
        if($rootScope.epgCatchupHoursPast==0){
          $rootScope.showCatchUpIcon = false;
          $rootScope.catchupStartEndTime = timeDateService.formatDateToHHMM(startDate, true) + " - " + timeDateService.formatDateToHHMM(endDate, true)
        }
        else if ($rootScope.currentFocusedChannel.catchup_enabled && startDate < now && ($rootScope.currentFocusedChannel.catchup_duration_total >= $rootScope.epgCatchupHoursPast * 60)) {
          if(endTime>currentDate){
            $rootScope.showCatchUpIcon = false;
          }
          else{
            $rootScope.epgCatchupHoursPast++;
            startDate = timeDateService.addHoursToDate(new Date(), $rootScope.epgCatchupHoursPast);
            endDate = timeDateService.addHoursToDate(startDate, 1) //Add one hour to start time
            $rootScope.catchupStartEndTime = timeDateService.formatDateToHHMM(startDate, true) + " - " + timeDateService.formatDateToHHMM(endDate, true)
  
            $rootScope.catchupStart = parseInt(startDate.getTime()/1000);
            $rootScope.catchupDuration = parseInt((endDate.getTime()-startDate.getTime())/1000);
  
            if($rootScope.epgCatchupHoursPast!=0)
              $rootScope.showCatchUpIcon = true;
            else
              $rootScope.showCatchUpIcon = false;
          }
        }
  
      }
  
    });
    $rootScope.$on('updatePreviousEpgData', function(event, args) {
      if ($rootScope.currentFocusedChannel.epg_channel_id) {
        if ($rootScope.currentEpgChannelIndex > -1 && $rootScope.currentEpgProgrammeIndex > 0) {
          $rootScope.currentEpgProgrammeIndex--;
  
          var currentDate = new Date();
          var epgProgramme = $scope.epg[$rootScope.currentEpgChannelIndex].programmes[$rootScope.currentEpgProgrammeIndex];
          var startTime = timeDateService.createSafariDate(epgProgramme.start);
          var endTime = timeDateService.createSafariDate(epgProgramme.stop);
  
          var startTimeWithOffset = new Date(startTime.getTime() - currentDate.getTimezoneOffset() * 60 * 1000);
          var endTimeWithOffset = new Date(endTime.getTime() - currentDate.getTimezoneOffset() * 60 * 1000);
  
          $rootScope.currentEpg = $scope.epg[$rootScope.currentEpgChannelIndex].programmes[$rootScope.currentEpgProgrammeIndex];
  
          $rootScope.currentEpg.focusedEpgChannelItemStartEndTime = timeDateService.formatDateToHHMM(startTime, true) + " - " + timeDateService.formatDateToHHMM(endTime, true);
  
          var minutesInPast = parseInt(((currentDate.getTime()-startTime.getTime())/1000)/60);
  
          $rootScope.showAddReminderBtn = false;
          if($rootScope.currentFocusedChannel.catchup_enabled && startTime < currentDate && minutesInPast < $rootScope.currentFocusedChannel.catchup_duration_total){
            if(endTime>currentDate){
              $rootScope.showCatchUpIcon = false;
            }
            else{
              $rootScope.showCatchUpIcon = true;
              $rootScope.catchupStart = parseInt(startTime.getTime()/1000);
              $rootScope.catchupDuration = parseInt((endTime.getTime()-startTime.getTime())/1000);
            }
          }
          else {
            $rootScope.showCatchUpIcon = false;
            $rootScope.showAddReminderBtn = true;
            if(endTime < currentDate)
              $rootScope.showAddReminderBtn = false;
            else if(startTime < currentDate)
              $rootScope.showAddReminderBtn = false;
  
          }
        }
      } else {
        $rootScope.showAddReminderBtn = false;
        if ($rootScope.currentFocusedChannel.catchup_enabled && ($rootScope.currentFocusedChannel.catchup_duration_total > Math.abs($rootScope.epgCatchupHoursPast * 60))) {
          $rootScope.epgCatchupHoursPast--;
          var startDate = timeDateService.addHoursToDate(new Date(), $rootScope.epgCatchupHoursPast);
          var endDate = timeDateService.addHoursToDate(startDate, 1) //Add one hour to start time
          $rootScope.catchupStartEndTime = timeDateService.formatDateToHHMM(startDate, true) + " - " + timeDateService.formatDateToHHMM(endDate, true);
          $rootScope.showCatchUpIcon = true;
  
          $rootScope.catchupStart = parseInt(startDate.getTime()/1000);
          $rootScope.catchupDuration = parseInt((endDate.getTime()-startDate.getTime())/1000);
        }
      }
  
    });
    $rootScope.$on('selectedEpgChannelDown', function(event, args) {
      $scope.currentFocusedChannelIndex = $scope.getCurrenFocusedChannelIndex();
      if ($rootScope.currentFocusedChannelIndex > 0) {
        $rootScope.currentFocusedChannelIndex--;
        $rootScope.currentFocusedChannel = $rootScope.channels[$rootScope.currentFocusedChannelIndex];
        $rootScope.epgCatchupHoursPast = 0;
        $rootScope.$broadcast('updateCurrentEpg');
  
      }
    });
    $rootScope.$on('selectedEpgChannelUp', function(event, args) {
      $scope.currentFocusedChannelIndex = $scope.getCurrenFocusedChannelIndex();
      if ($rootScope.currentFocusedChannelIndex < $rootScope.channels.length - 1) {
        $rootScope.currentFocusedChannelIndex++;
        $rootScope.currentFocusedChannel = $rootScope.channels[$rootScope.currentFocusedChannelIndex];
        $rootScope.epgCatchupHoursPast = 0;
        $rootScope.$broadcast('updateCurrentEpg');
      }
    });
  
    $scope.getCurrenFocusedChannelIndex = function() {
      for (var i = 0; i < $rootScope.channels.length; i++) {
        if ($rootScope.channels[i].id == $rootScope.currentFocusedChannel.id)
          return i;
      }
    };
    $rootScope.$on('showEpgTemplateRender', function(event, args) {
      $scope.generateEpgItemsHTML();
    });
    $rootScope.$on('triggerRightKey', function(event, args) {
      $scope.handleRightKey(args.myelem);
    });
    $rootScope.$on('triggerLeftKey', function(event, args) {
      $scope.handleLeftKey(args.myelem);
    });
    $scope.prePareEpgData = function() {
      var epgData = [];
      for (var i = 0; i < $scope.epgRawData.length; i++) {
        var epgProgrammes = [];
        if ($scope.epgRawData[i].hasOwnProperty("programmes") && $scope.epgRawData[i].programmes) {
          for (var j = 0; j < $scope.epgRawData[i].programmes.length; j++) {
  
            var d = new Date();
            d.setDate(d.getDate() - $scope.timelineDaysPast);
  
            var start = new Date($scope.epgRawData[i].programmes[j].start_timestamp * 1000);
  
            if (start.getTime() > d.getTime()) {
              epgProgrammes.push($scope.epgRawData[i].programmes[j]);
            }
  
            //check for reminder
            $scope.epgRawData[i].programmes[j].hasReminder = $scope.checkIfReminderIsAdded($scope.epgRawData[i].programmes[j].string_id)
          }
        }
        epgData.push($scope.epgRawData[i]);
        epgData[i].programmes = epgProgrammes;
      }
      $scope.epg = epgData;
    };
    $scope.createTimelineItem = function(lastTimeLineDate) {
      var hours = lastTimeLineDate.getHours();
      if (hours < 10)
        hours = "0" + hours;
  
      var minutes = lastTimeLineDate.getMinutes();
      if (minutes < 10)
        minutes = "0" + minutes;
  
      return hours + ":" + minutes;
  
    };
    $scope.createTimeline = function() {
      var lastTimeLineDate = new Date();
      var endTimeLineDate = new Date();
      lastTimeLineDate.setDate(lastTimeLineDate.getDate() - Math.abs($scope.timelineDaysPast));
      endTimeLineDate.setDate(endTimeLineDate.getDate() + Math.abs($scope.timelineDaysFuture));
  
      var timeline = [];
  
      timeline.push({
        text: $scope.createTimelineItem(lastTimeLineDate)
      });
      do {
        lastTimeLineDate.setMinutes(lastTimeLineDate.getMinutes() + 30);
        timeline.push({
          text: $scope.createTimelineItem(lastTimeLineDate)
        });
      }
      while (lastTimeLineDate < endTimeLineDate);
  
      $scope.timeline = timeline;
    };
    $scope.getWidthFromDuration = function(start, stop) {
  
      var startDate = new Date(start * 1000);
      var stopDate = new Date(stop * 1000);
  
      var diffMs = Math.abs(stopDate - startDate);
      var diffMins = Math.floor((diffMs / 1000) / 60); // minutes
  
      return parseFloat(diffMins * $scope.pixelSizeInMinutes).toFixed(2);
    };
    $scope.moveItemToTimelineStart = function(start) {
      var d = new Date();
      var start = new Date(start * 1000);
      start = start.getTime() + d.getTimezoneOffset() * 60 * 1000;
  
      //start = start*1000;
      var startDate = new Date(start);
      var epgBeginDate = new Date();
      epgBeginDate.setDate(epgBeginDate.getDate() - Math.abs($scope.timelineDaysPast));
      var diffMs = Math.abs(startDate - epgBeginDate);
      var minutes = Math.floor((diffMs / 1000) / 60); // minutes
      var numPixels = parseInt(minutes * $scope.pixelSizeInMinutes);
      return numPixels;
    };
    $rootScope.getChannelByEpgChannelId = function(epgchannelid){
      var channel = null;
      for(var i=0;i<$rootScope.channels.length;i++){
        if($rootScope.channels[i].epg_channel_id == epgchannelid)
          channel = $rootScope.channels[i];
      }
      return channel;
    }
    $scope.generateEpgItemsHTML = function() {
      var html = '';
      var now = new Date();
      for (var i = 0; i < $scope.epg.length; i++) {
        html += '<div class="col-xs-12 no-padding epgRow">';
        var channel = $rootScope.getChannelByEpgChannelId($scope.epg[i].epg_channel_id);
        $scope.epg[i].channelData = false;
        if(channel){
          $scope.epg[i].channelData = channel;
          if(i==2)
            $scope.epg[i].channelData.catchup_enabled = true;
        }
        if ($scope.epg[i].hasOwnProperty("programmes")) {
  
          for (var j = 0; j < $scope.epg[i].programmes.length; j++) {
            html += '<a href="javascript:void(0)" class="epgItem reminder-update-'+$scope.epg[i].programmes[j].id+'" data-catchupenabled="'+$scope.epg[i].channelData.catchup_enabled+'" data-reminderstringid="'+$scope.epg[i].programmes[j].string_id+'" data-hasreminder="'+$scope.epg[i].programmes[j].hasReminder+'" data-epgprogrammeid="'+$scope.epg[i].programmes[j].id+'" data-epgchannelid="'+$scope.epg[i].epg_channel_id+'" id="epgItem-' + i + '-' + j + '" style="width:' + $scope.getWidthFromDuration($scope.epg[i].programmes[j].start_timestamp, $scope.epg[i].programmes[j].stop_timestamp) + 'px;left:' + $scope.moveItemToTimelineStart($scope.epg[i].programmes[j].start_timestamp) + 'px" data-channeltitle="' + $scope.epg[i].programmes[j].title + '" data-channellogo="' + $scope.epg[i].logo + '" data-epgitemtitle="' + $scope.epg[i].programmes[j].title + '" data-epgitemdesc="' + $scope.epg[i].programmes[j].desc + '" data-hasreminder="'+$scope.epg[i].programmes[j].hasReminder+'" data-epgitemstart="' + $scope.epg[i].programmes[j].start + '" data-epgitemstop="' + $scope.epg[i].programmes[j].stop + '"><span>' + $scope.epg[i].programmes[j].title + '</span><span class="glyphicon glyphicon-bell reminder-notice-'+$scope.epg[i].programmes[j].hasReminder+'"></span>';
  
            if(timeDateService.createSafariDate($scope.epg[i].programmes[j].start) < now){
              html += '<div class="glyphicon glyphicon-repeat red epg-catchup '+$scope.epg[i].channelData.catchup_enabled+'"></div>';
            }
  
            html += '</a>';
          }
          html += '</div>';
        }
        $(".epgItemsWrapper").html(html);
  
        $timeout(function() {
          $scope.markCurrentTimeline();
        }, 100);
      }
    };
  
    $scope.markCurrentTimeline = function() {
      var currentDate = new Date();
      var epgBeginDate = new Date();
      var currentTime = currentDate.getTime();
      $scope.currentTimelineTime = $scope.createTimelineItem(currentDate);
  
      epgBeginDate.setDate(epgBeginDate.getDate() - Math.abs($scope.timelineDaysPast));
  
      var diffMs = Math.abs(currentDate - epgBeginDate);
      var minutes = Math.floor((diffMs / 1000) / 60); // minutes
  
      var numPixels = parseInt(minutes * 11.18);
      $(".epgData").scrollLeft(numPixels);
      $(".current-epg-line").animate({
        left: numPixels + 50
      }, 100);
  
    }
    $scope.isElementVisible = function(elem, container, move) {
      var docViewTop = container.offset().top;
      var docViewBottom = docViewTop + container.height();
  
      var headerTop = $(".epgDetailsBox").offset().top;
      var headerBottom = headerTop + $(".epgDetailsBox").height() + 20;
  
      var elemTop = $(elem).offset().top;
      var elemBottom = elemTop + $(elem).height();
  
      if (move) {
        if (elemTop > docViewTop && elemBottom > docViewBottom) {
          $scope.lastBottomScrollValue = (docViewBottom - elemBottom) - 100;
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
    $scope.blurEpgItem = function() {
      $(".focusedEpg").removeClass("focusedEpg");
      $scope.focusedEpgChannelItemTitle = "";
      $scope.focusedEpgChannelItemDesc = "";
      $scope.focusedEpgChannelItemStart = "";
      $scope.focusedEpgChannelItemStop = "";
      $scope.focusedEpgChannelItemStartEndTime = "";
    };
  
    $scope.updateEpgItemDetails = function(element) {
      $scope.blurEpgItem();
  
      $("#epgItem-" + $scope.channelRow + "-" + $scope.channelRowItemIndex).focus();
      var focusedEpgItem = $("#epgItem-" + $scope.channelRow + "-" + $scope.channelRowItemIndex);
      focusedEpgItem.addClass("focusedEpg");
      var startTime = timeDateService.createSafariDate(focusedEpgItem.data("epgitemstart"));
  
      if(startTime<new Date()){
        $rootScope.addReminderBtn = false;
        $rootScope.removeReminderBtn = false;
        var catchupEnabled = focusedEpgItem.data("catchupenabled")
        if(catchupEnabled)
          $rootScope.playCatchup = true;
        else
          $rootScope.playCatchup = false;
      }else{
        if(focusedEpgItem.data("hasreminder")){
          $rootScope.addReminderBtn = false;
          $rootScope.removeReminderBtn = true;
        }else {
          $rootScope.addReminderBtn = true;
          $rootScope.removeReminderBtn = false;
        }
        $rootScope.playCatchup = false;
      }
      $rootScope.showHelpBar = true;
  
      $rootScope.currentFocusedEpgElement = focusedEpgItem;
      var start = focusedEpgItem.data("epgitemstart");
      var stop = focusedEpgItem.data("epgitemstop");
      $scope.focusedEpgChannelItemTitle = focusedEpgItem.data("epgitemtitle");
      $scope.focusedEpgChannelItemDesc = focusedEpgItem.data("epgitemdesc");
  
      if (start)
        $scope.focusedEpgChannelItemStart = timeDateService.formatDateToHHMM(start);
      if (stop)
        $scope.focusedEpgChannelItemStop = timeDateService.formatDateToHHMM(stop);
      $scope.focusedEpgChannelItemStartEndTime = $scope.focusedEpgChannelItemStart + " - " + $scope.focusedEpgChannelItemStop;
      $timeout(function() {
        focusController.focus("chitem" + $scope.channelRow);
        $("#chitem" + $scope.channelRow).focus();
      }, 500);
    };
    $scope.focusOnCurrenEpgItem = function() {
  
      if ($scope.epg[$scope.channelRow].programmes.length > 0) {
        var currentDate = new Date();
        for (var j = 0; j < $scope.epg[$scope.channelRow].programmes.length; j++) {
          var start = new Date($scope.epg[$scope.channelRow].programmes[j].start_timestamp * 1000);
          start = start.getTime() + currentDate.getTimezoneOffset() * 60 * 1000;
          var stop = new Date($scope.epg[$scope.channelRow].programmes[j].stop_timestamp * 1000);
          stop = stop.getTime() + currentDate.getTimezoneOffset() * 60 * 1000;
          if (start > currentDate.getTime() && currentDate.getTime() < stop) {
            $scope.channelRowItemIndex = j;
            return false;
          }
        }
      }
  
    };
    $scope.handleRightKey = function(element) {
      if ($scope.channelRowItemIndex == -1) {
        $scope.focusOnCurrenEpgItem();
        $scope.updateEpgItemDetails(element);
        return false;
      }
      $scope.channelRowItemIndex++;
      $scope.updateEpgItemDetails(element);
    }
    $scope.handleLeftKey = function(element) {
      $scope.channelRowItemIndex--;
      $scope.updateEpgItemDetails(element);
    }
    $scope.focusEpgChannelTitle = function($event, $originalEvent) {
      var focusedItem = $($event.currentTarget);
      $scope.blurEpgItem();
      $scope.channelRowItemIndex = -1;
      $scope.channelRow = $($event.currentTarget).data("channelrow");
      $scope.focusedEpgChannelTitle = $($event.currentTarget).data("channeltitle");
      $scope.focusedEpgChannelLogo = $($event.currentTarget).data("channellogo");
      var container = $(".epgChannelList");
      if (!$scope.isElementVisible(focusedItem, container)) {
        $scope.isElementVisible(focusedItem, container, true);
        $scope.isElementVisible(focusedItem, $(".epgSlide"), true)
      }
  
      $rootScope.showHelpBar = false;
      // focusedItem.focus();
    };
    $scope.focusEpgChannelItem = function($event, $originalEvent, epgItem) {
      var focusedItem = $($event.currentTarget);
      $scope.focusedEpgChannelTitle = $($event.currentTarget).data("channeltitle");
      $scope.focusedEpgChannelLogo = $($event.currentTarget).data("channellogo");
      $scope.focusedEpgItem = epgItem;
  
      /*Check for vertical scroll*/
      var container = $(".epgSlide");
      if (!$scope.isElementVisible(focusedItem, container)) {
        $scope.isElementVisible(focusedItem, container, true);
        $scope.isElementVisible(focusedItem, $(".epgChannelList"), true)
      }
      /*Check for horizontal scroll*/
      focusedItem.focus();
    };
  }]);
  