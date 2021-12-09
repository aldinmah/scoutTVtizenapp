scoutTVApp.controller("epgCtrl", ['$scope', '$rootScope', '$timeout', '$interval', 'focusController', 'routingService', 'timeDateService', 'configService', 'httpService', function($scope, $rootScope, $timeout, $interval, focusController, routingService, timeDateService, configService, httpService) {

  $scope.epg = [];
  $scope.epgPaged = [];
  $scope.currentEpgPage = 1;
  $scope.epgPageSize = 4;
  $scope.epgTotalPages = 1;
  $scope.epgRawData = [];
  $scope.numberOfChannels = 8;
  $scope.timelineDaysPast = 7;
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
  $scope.fullViewEpgSelectedChannel = {programmes:[]};
  $rootScope.epgCatchupHoursPast = 0;
  $rootScope.showCatchUpIcon = false;
  $rootScope.catchupStart = 0;
  $rootScope.catchupDuration = 0;
  $rootScope.remindersInterval = 0;
  $rootScope.disableRightArrow = false;
  $rootScope.disableLeftArrow = false;
  $rootScope.epgReminders = [];
  $scope.showEpgProgrammeList = false;
  $scope.currentEpgProgrammeIndexFullEPGList = 0;
  $scope.activeEpgDate = new Date();

  $rootScope.$on('epgLoaded', function(event, args) {
    $scope.epgRawData = args.response;
    $rootScope.loadEpgView = true;
    $scope.prePareEpgData();
  });
  $scope.updateEpgItemByEpgChannelId = function(response, deleteReminder){
    for (var i = 0; i < $scope.fullViewEpgSelectedChannel.programmes.length; i++) {
      if($scope.fullViewEpgSelectedChannel.programmes[i].id==response.epg_programme_id){
        if(deleteReminder){
          $scope.fullViewEpgSelectedChannel.programmes[i].hasReminder = false;
          $scope.fullViewEpgSelectedChannel.programmes[i].reminderData = null;
          $rootScope.currentEpg = $scope.fullViewEpgSelectedChannel.programmes[i];
        }
        else{
          $scope.fullViewEpgSelectedChannel.programmes[i].hasReminder = true;
          $scope.fullViewEpgSelectedChannel.programmes[i].reminderData = response;
          $rootScope.currentEpg = $scope.fullViewEpgSelectedChannel.programmes[i];
        }
        return true;
      }
    }
    return false;
  }
  $scope.checkIfReminderIsAdded = function(stringId){
    if($rootScope.epgReminders.length>0){
      for (var i = 0; i < $rootScope.epgReminders.length; i++) {
        if($rootScope.epgReminders[i].string_id == stringId){
          return true;
        }
      }
    }
    return false;
  }
  $rootScope.$on('epgReminderAdded', function(event, args) {
    if(args.response.epg_channel_id && args.response.epg_programme_id){
      $scope.updateEpgItemByEpgChannelId(args.response);
      $scope.currentEpg.hasReminder = true;
      $scope.$apply()
    }
  });
  $rootScope.$on('epgReminderDeleted', function(event, args) {
    if(args.response.epg_channel_id && args.response.epg_programme_id){
      $scope.updateEpgItemByEpgChannelId(args.response,true);
      $scope.currentEpg.hasReminder = false;
      $scope.$apply()
    }
  });
  $rootScope.getChannelByEpgChannelId = function(epgchannelid){
    var channel = null;
    for(var i=0;i<$rootScope.channels.length;i++){
      if($rootScope.channels[i].epg_channel_id == epgchannelid)
        channel = $rootScope.channels[i];
    }
    return channel;
  }
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
            $rootScope.openEpgReminderPopup();
          }
        }
      }
    }
  };

  $rootScope.$on('epgRemindersLoaded', function(event, args) {
    $rootScope.epgReminders = args.response;
    $rootScope.checkReminders();

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

          var startTime = new Date($scope.epg[i].programmes[j].start);
          var endTime = new Date($scope.epg[i].programmes[j].stop);
          
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
            var startTime = new Date($scope.epg[i].programmes[j].start);
            var endTime = new Date($scope.epg[i].programmes[j].stop);
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
        if($rootScope.disableLeftArrow)
          $rootScope.disableLeftArrow = false;
        $rootScope.disableRightArrow = false;
        $rootScope.currentEpgProgrammeIndex++;
        var currentDate = new Date();
        var epgProgramme = $scope.epg[$rootScope.currentEpgChannelIndex].programmes[$rootScope.currentEpgProgrammeIndex];
        var startTime = new Date(epgProgramme.start);
        var endTime = new Date(epgProgramme.stop);

        $rootScope.currentEpg = $scope.epg[$rootScope.currentEpgChannelIndex].programmes[$rootScope.currentEpgProgrammeIndex];
        $rootScope.currentEpg.hasReminder = false;
        $rootScope.currentEpg.focusedEpgChannelItemStartEndTime = timeDateService.formatDateToHHMM(startTime, true) + " - " + timeDateService.formatDateToHHMM(endTime, true);

        $rootScope.showAddReminderBtn = false;
        if(startTime > currentDate){
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
      else{
        $rootScope.disableRightArrow = true;
      }
    }
  });
  $rootScope.$on('updatePreviousEpgData', function(event, args) {
    if ($rootScope.currentFocusedChannel.epg_channel_id) {
      if ($rootScope.currentEpgChannelIndex > -1 && $rootScope.currentEpgProgrammeIndex > 0) {
        $rootScope.currentEpgProgrammeIndex--;
        $rootScope.disableLeftArrow = false;
        if($rootScope.disableRightArrow)
          $rootScope.disableRightArrow = false;
        var currentDate = new Date();
        var epgProgramme = $scope.epg[$rootScope.currentEpgChannelIndex].programmes[$rootScope.currentEpgProgrammeIndex];
        var startTime = new Date(epgProgramme.start);
        var endTime = new Date(epgProgramme.stop);

        $rootScope.currentEpg = $scope.epg[$rootScope.currentEpgChannelIndex].programmes[$rootScope.currentEpgProgrammeIndex];

        $rootScope.currentEpg.focusedEpgChannelItemStartEndTime = timeDateService.formatDateToHHMM(startTime, true) + " - " + timeDateService.formatDateToHHMM(endTime, true);

        var minutesInPast = parseInt(((currentDate.getTime()-startTime.getTime())/1000)/60);

        $rootScope.showAddReminderBtn = false;
        if(startTime > currentDate){
          $rootScope.showCatchUpIcon = false;
          $rootScope.showAddReminderBtn = true;
          if(endTime < currentDate)
            $rootScope.showAddReminderBtn = false;
          else if(startTime < currentDate)
            $rootScope.showAddReminderBtn = false;
        }
      }
      else{
        $rootScope.disableLeftArrow = true;
      }
    } else {
      $rootScope.showAddReminderBtn = false;
    }
  });
  $rootScope.$on('selectedEpgChannelDown', function(event, args) {
    $rootScope.currentFocusedChannelIndex = $rootScope.getCurrenFocusedChannelIndex();
    if ($rootScope.currentFocusedChannelIndex > 0) {
      $rootScope.currentFocusedChannelIndex--;
      $rootScope.currentFocusedChannel = $rootScope.channels[$rootScope.currentFocusedChannelIndex];
      $rootScope.$broadcast('updateCurrentEpg');

    }
  });
  $rootScope.$on('selectedEpgChannelUp', function(event, args) {
    $rootScope.currentFocusedChannelIndex = $rootScope.getCurrenFocusedChannelIndex();
    if ($rootScope.currentFocusedChannelIndex < $rootScope.channels.length - 1) {
      $rootScope.currentFocusedChannelIndex++;
      $rootScope.currentFocusedChannel = $rootScope.channels[$rootScope.currentFocusedChannelIndex];
      $rootScope.$broadcast('updateCurrentEpg');
    }
  });

  $rootScope.getCurrenFocusedChannelIndex = function() {
    for (var i = 0; i < $rootScope.channels.length; i++) {
      if ($rootScope.channels[i].id == $rootScope.currentFocusedChannel.id)
        return i;
    }
  };
  $rootScope.$on('showEpgTemplateRender', function(event, args) {
    //$scope.generateEpgItemsHTML();
  });
  $rootScope.$on('triggerRightKey', function(event, args) {
    $scope.handleRightKey(args.myelem);
  });
  $rootScope.$on('triggerLeftKey', function(event, args) {
    $scope.handleLeftKey(args.myelem);
  });
  $rootScope.updateCurrentEpgProgrammes = function(){
    var currentDate = new Date();
    for (var i = 0; i < $scope.epg.length; i++) {
      $scope.epg[i].currentEPGProgramme = {};
      $scope.epg[i].currentEPGProgramme.focusedEpgChannelItemStartEndTime = "";
      
      for (var j = 0; j < $scope.epg[i].programmes.length; j++) {
        var startTime = new Date($scope.epg[i].programmes[j].start);
        var endTime = new Date($scope.epg[i].programmes[j].stop);
        
        if (startTime < currentDate && currentDate < endTime) {
          $scope.epg[i].currentEPGProgramme = $scope.epg[i].programmes[j];
          $scope.epg[i].currentEPGProgramme.focusedEpgChannelItemStartEndTime = timeDateService.formatDateToHHMM(startTime, true) + " - " + timeDateService.formatDateToHHMM(endTime, true);
        }
      }
      
    }
  };
  $scope.prePareEpgData = function() {
    var nowTimestamp = new Date();
    var offsetValue = nowTimestamp.getTimezoneOffset() * 60;
    var epgData = [];
    for (var i = 0; i < $scope.epgRawData.length; i++) {
      var epgProgrammes = [];
      if ($scope.epgRawData[i].hasOwnProperty("programmes") && $scope.epgRawData[i].programmes) {
       
        for (var j = 0; j < $scope.epgRawData[i].programmes.length; j++) {
          $scope.epgRawData[i].programmes[j].start = timeDateService.getFormatedMonthddyyyy(new Date($scope.epgRawData[i].programmes[j].start_timestamp*1000))
          $scope.epgRawData[i].programmes[j].start_timestamp = new Date($scope.epgRawData[i].programmes[j].start_timestamp*1000)
          $scope.epgRawData[i].programmes[j].stop = timeDateService.getFormatedMonthddyyyy(new Date($scope.epgRawData[i].programmes[j].stop_timestamp*1000))
          $scope.epgRawData[i].programmes[j].stop_timestamp = new Date($scope.epgRawData[i].programmes[j].stop_timestamp*1000)
          epgProgrammes.push($scope.epgRawData[i].programmes[j]);
          //$scope.epgRawData[i].programmes[j].hasReminder = $scope.checkIfReminderIsAdded($scope.epgRawData[i].programmes[j].string_id)
        }
      }
      epgData.push($scope.epgRawData[i]);
      epgData[i].programmes = epgProgrammes;
    }
    $scope.epg = epgData;
    $scope.epgPagedData = $scope.epg.slice(0,$scope.epgPageSize)
    $scope.epgTotalPages = parseInt(Math.ceil($scope.epg / $scope.epgPageSize))

    $rootScope.updateCurrentEpgProgrammes()
  };  

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

  $scope.updateEpgItemDetails = function(element) {
    $("#epgItem-" + $scope.channelRow + "-" + $scope.channelRowItemIndex).focus();
    var focusedEpgItem = $("#epgItem-" + $scope.channelRow + "-" + $scope.channelRowItemIndex);
    focusedEpgItem.addClass("focusedEpg");
    var startTime = new Date(focusedEpgItem.data("epgitemstart"));

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
    //$rootScope.showHelpBar = true;

    $scope.currentFocusedEpgElement = focusedEpgItem;
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
        //start = start.getTime() + currentDate.getTimezoneOffset() * 60 * 1000;
        var stop = new Date($scope.epg[$scope.channelRow].programmes[j].stop_timestamp * 1000);
        //stop = stop.getTime() + currentDate.getTimezoneOffset() * 60 * 1000;
        if (start > currentDate.getTime() && currentDate.getTime() < stop) {
          $scope.channelRowItemIndex = j;
          return false;
        }
      }
    }

  };
  $scope.prepareTodayEpgList = function (epgProgrammeList) {
    var nowTimestamp = new Date();
    var offsetValue = nowTimestamp.getTimezoneOffset() * 60;
    var programmeList = []

    for (var i = 0; i < epgProgrammeList.length; i++) {

        epgProgrammeList[i].start = timeDateService.getFormatedMonthddyyyy(new Date(epgProgrammeList[i].start_timestamp*1000))
        epgProgrammeList[i].start_timestamp = new Date(epgProgrammeList[i].start_timestamp*1000)
        epgProgrammeList[i].stop = timeDateService.getFormatedMonthddyyyy(new Date(epgProgrammeList[i].stop_timestamp*1000))
        epgProgrammeList[i].stop_timestamp = new Date(epgProgrammeList[i].stop_timestamp*1000)

        epgProgrammeList[i].startEndTimeString = ""
        epgProgrammeList[i].hasReminder = false;
        if($scope.checkIfReminderIsAdded(epgProgrammeList[i].string_id))
          epgProgrammeList[i].hasReminder = true;

        if (epgProgrammeList[i].start && epgProgrammeList[i].stop)
          epgProgrammeList[i].startEndTimeString = timeDateService.formatDateToHHMM(epgProgrammeList[i].start) + " - " + timeDateService.formatDateToHHMM(epgProgrammeList[i].stop)
        
        if(epgProgrammeList[i].stop_timestamp>nowTimestamp && epgProgrammeList[i].start_timestamp>nowTimestamp){
          epgProgrammeList[i].showReminderButton = true;
        }
        programmeList.push(epgProgrammeList[i]);
    }
    return programmeList;
  }
  $scope.getProgrammesForSelectedDate = function (epgProgrammeList) {
    var nowTimestamp = new Date($scope.activeEpgDate.getTime());
    var offsetValue = nowTimestamp.getTimezoneOffset() * 60;
    var startTimestamp = new Date($scope.activeEpgDate.getTime());
    var endTimestamp = new Date($scope.activeEpgDate.getTime());

    startTimestamp.setUTCHours(0,0,0,0);
    endTimestamp.setUTCHours(23,59,59,999);

    startTimestamp = parseInt(startTimestamp.getTime()/1000)
    endTimestamp = parseInt(endTimestamp.getTime()/1000)
    nowTimestamp = parseInt(nowTimestamp.getTime()/1000)

    var programmeList = []
    for (var i = 0; i < epgProgrammeList.length; i++) {
      
      if (epgProgrammeList[i].start_timestamp>startTimestamp && epgProgrammeList[i].stop_timestamp<endTimestamp) {
        epgProgrammeList[i].hasReminder = false;
        if($scope.checkIfReminderIsAdded(epgProgrammeList[i].string_id))
          epgProgrammeList[i].hasReminder = true;

        epgProgrammeList[i].startEndTimeString = ""
        if (epgProgrammeList[i].start && epgProgrammeList[i].stop)
          epgProgrammeList[i].startEndTimeString = timeDateService.formatDateToHHMM(epgProgrammeList[i].start) + " - " + timeDateService.formatDateToHHMM(epgProgrammeList[i].stop)
        
        if(epgProgrammeList[i].stop_timestamp>nowTimestamp && epgProgrammeList[i].start_timestamp>nowTimestamp){
          epgProgrammeList[i].showReminderButton = true;
        }
        programmeList.push(epgProgrammeList[i]);
      }
      else if(epgProgrammeList[i].start_timestamp<startTimestamp && epgProgrammeList[i].stop_timestamp>startTimestamp)
        programmeList.push(epgProgrammeList[i]);
    }
    return programmeList;
  }
  $scope.handleInitialProgrammeIndex = function (programmeList) {
    var activeIndex = programmeList.length-1
    if(programmeList && programmeList.length){
      var currentDate = new Date();
      for (var i = 0; i < programmeList.length; i++) {
        var startTime = new Date(programmeList[i].start);
        var endTime = new Date(programmeList[i].stop);
        if (startTime < currentDate && currentDate < endTime) {
          activeIndex = i;
         
        }
      }
    }
    return activeIndex
  }
  
  $rootScope.initEpgLoadDetails = function () {
    $scope.activeEpgDate = new Date()
    httpService.getDayEpgByChannelID(true,parseInt($scope.activeEpgDate.getTime()/1000),$scope.fullViewEpgSelectedChannel.id)
  }
  $scope.loadEPGDetailsForChannelID = function(epgItem, skipTransformation) {
    var newProgrammeList = []
      if(skipTransformation)
        newProgrammeList = $scope.prepareTodayEpgList(epgItem.programmes)
      else{
        newProgrammeList = $scope.getProgrammesForSelectedDate(epgItem.programmes)
      }

      var activeEpgIndex = $scope.handleInitialProgrammeIndex(newProgrammeList)
      $scope.showEpgProgrammeList = false;
      if(newProgrammeList.length){
        $scope.fullViewEpgSelectedChannel = epgItem;
        $scope.fullViewEpgSelectedChannel.programmes = newProgrammeList;

        var today = new Date();
        var isToday = (today.toDateString() == $scope.activeEpgDate.toDateString());
        if(!skipTransformation || isToday)
          $scope.currentEpgProgrammeIndexFullEPGList = activeEpgIndex
        else 
          $scope.currentEpgProgrammeIndexFullEPGList = -1
          
      }
      else{
        $scope.fullViewEpgSelectedChannel = {id:epgItem.id,programmes:[]};
      }

      $rootScope.showEpgTemplateTodayBox = false
     
      $timeout(function () {
        if(newProgrammeList.length)
          $scope.showEpgProgrammeList = true;
        else
          $scope.showEpgProgrammeList = false;
        $timeout(function () {
          $rootScope.refreshEPGTemplate()
        },0)
      },0)
  };
  $scope.activeEpgPage = 1;
  $scope.addDaysToDate = function(date, days) {
    var date = new Date(date);
    date.setDate(date.getDate() + days);
    return date;
  }
  $rootScope.$on('epgChannelListUpdated', function(event, args) {
    if (args.response && args.response[0] && args.response[0].hasOwnProperty("programmes") && args.response[0].programmes) {
      var channelID = args.channelID;
      $scope.loadEPGDetailsForChannelID(args.response[0], true)
    }
  });
  $scope.handleChannelListEPGclick = function (epgItem) {
    $scope.activeEpgDate = new Date()
    httpService.getDayEpgByChannelID(true,parseInt($scope.activeEpgDate.getTime()/1000),epgItem.id)
  }
  $scope.loadPrevEpgDate = function () {
    $scope.activeEpgDate = $scope.addDaysToDate($scope.activeEpgDate,-1)
    httpService.getDayEpgByChannelID(true,parseInt($scope.activeEpgDate.getTime()/1000),$scope.fullViewEpgSelectedChannel.id)
  }
  $scope.loadNextEpgDate = function () {
    $scope.activeEpgDate = $scope.addDaysToDate($scope.activeEpgDate,1)
    httpService.getDayEpgByChannelID(true,parseInt($scope.activeEpgDate.getTime()/1000),$scope.fullViewEpgSelectedChannel.id)
  }
  $scope.getActiveEpgDateFormated = function () {
    return timeDateService.getFormatedMonthddyyyy($scope.activeEpgDate)
  }
  $rootScope.openChannelFromReminder = function (channelID, reminder_id) {
    $rootScope.showEpgReminderPopup = false;
    httpService.deleteEpgReminder(reminder_id,true);
    focusController.setDepth($rootScope.lastFocusedDepth)
    focusController.focus($rootScope.lastFocusedItem);
    $rootScope.openChannelByChannelID(channelID)
  }
  $rootScope.deleteReminderFromPopup = function (reminder_id) {
    $rootScope.showEpgReminderPopup = false;
    $rootScope.activeEpgReminder = {};
    focusController.setDepth($rootScope.lastFocusedDepth)
    focusController.focus($rootScope.lastFocusedItem);
    httpService.deleteEpgReminder(reminder_id,true);
  }
  $rootScope.handleEPGReminder = function (item, forceEvent) {
    if(!item.showReminderButton && !forceEvent) return;
    if(item.hasReminder){
      for(var i=0;i<$rootScope.epgReminders.length;i++){
        if($rootScope.epgReminders[i].string_id == item.string_id)
          reminder_id = $rootScope.epgReminders[i].id;
      }
      httpService.deleteEpgReminder(reminder_id,true);
    }
    else
      httpService.addEpgReminder($scope.fullViewEpgSelectedChannel.id, item.epg_channel_id, item.id,configService.epgReminderMinutes, true);
  }
}]);
