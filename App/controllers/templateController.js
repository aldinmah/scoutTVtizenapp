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
    $rootScope.showSearchTemplateItems = false;
    $rootScope.showSearchTemplate = false;
    $rootScope.loadChannelCategoriesView = false;
    $rootScope.favoriteChannelsExist = false;
    $rootScope.loadLiveTVChannelList = false;
    $rootScope.loadSearchChannelList = false;
    $rootScope.showSideChannelList = false;
    $rootScope.showChannelInfoBar = false;
    $rootScope.moreControlsActive = false;
    $rootScope.showAudioTrackPopup = false;
    $rootScope.showEpgTemplate = false;
    $rootScope.showEpgListLoader = false;
    $rootScope.lastFocusedItem = false;
    $rootScope.popupIsOpen = false;
    $rootScope.showEpgReminderPopup = false;
    $rootScope.showSettingsTemplate = false;
    $rootScope.showParentalPINPopup = false;
    $rootScope.showPurchasePINPopup = false;
    $rootScope.purchasePin = ''
    $rootScope.activeTemplate = '';
    $rootScope.focusedSideChannelName = 'sideChannelItem0';
    
    /*Help bar buttons*/
    $rootScope.showHelpBar = false;
    $rootScope.addToFavoritesHelpButton = true;
    $rootScope.removeFromFavoritesHelpButton = false;

    $scope.openLoginScreen = function (skipRouteStack) {
        if (!skipRouteStack)
            routingService.addRouteToStack("openLoginScreen");
        $rootScope.removeLoginScreen = false;
        $rootScope.showLoginTemplate = true;
        $rootScope.showLoginForm = true;
        $rootScope.activeTemplate = 'Login';
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
        $rootScope.showSearchTemplateItems = false;
        $rootScope.showSearchTemplate = false;
        $rootScope.loadChannelCategoriesView = false;
        $rootScope.loadLiveTVChannelList = false;
        $rootScope.loadSearchChannelList = false;
        $rootScope.showSideChannelList = false;
        $rootScope.showChannelInfoBar = false;
        $rootScope.moreControlsActive = false;
        $rootScope.showAudioTrackPopup = false;
        $rootScope.showEpgTemplate = false;
        $rootScope.showEpgListLoader = false;
        $rootScope.showSettingsTemplate = false;
        $rootScope.showSettingsVerticalItems = false;
        $rootScope.showParentalPINPopup = false;
        $rootScope.showPurchasePINPopup = false;
        
        if($rootScope.showPlayerTemplate)
          $rootScope.hidePlayerTemplate();
    }
    $rootScope.forceOpenTemplateByName = function (templateName) {
        $scope.openTemplate(false, false, templateName);
    }
    $scope.openTemplate = function ($event, $originalEvent, forceTemplate) {
        var selectedTemplate = ''
        if(forceTemplate)
            selectedTemplate = forceTemplate
        else 
            selectedTemplate = $($event.currentTarget).data("template");

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
            case 'epg':
                $rootScope.showLoader = true;
                $scope.openEpgTemplate(false);
                break;
            case 'settings':
                $rootScope.showLoader = true;
                $scope.openSettingsTemplate(false);
                break;
            case 'search':
                $rootScope.showLoader = true;
                $scope.openSearchTemplate(false);
                break;
                search
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
    $rootScope.showMoreOptions = function ($event, $originalEvent) {
        $rootScope.moreControlsActive = true;
        $timeout(function () {
            focusController.setDepth(5)
            focusController.focus('moreInfoBtnBack0') 
        },100)
        
    }
    $rootScope.hideMoreOptions = function ($event, $originalEvent) {
        $rootScope.moreControlsActive = false;
        $timeout(function () {
            focusController.setDepth(4)
            focusController.focus('infoBarAnchor')
        },100)
    }

    $scope.beforeEventBound = false
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
        else if($rootScope.showEpgTemplate){
            $rootScope.showHelpBar = false;
        }
        else
          $rootScope.showHelpBar = false;

        var dataFocusableGroup = focusController.getCurrentGroup()
        var dataFocusableDepth = focusController.getCurrentDepth()

        //console.log(activeItem.html())
        //console.log(dataFocusableDepth);
        //console.log(dataFocusableGroup);
        //console.log('event.keyCode = ',event.keyCode);
        //console.log('$rootScope.lastFocusedDepth ',$rootScope.lastFocusedDepth);
        //console.log('$rootScope.lastFocusedItem ',$rootScope.lastFocusedItem);
        
        if($rootScope.activeTemplate == "Settings"){
            if(activeItem.attr('data-focusable-name')=='field8' && event.keyCode==37){
                $rootScope.$broadcast('forceParentalPinFocus')
            }
        }

        if($rootScope.showEpgReminderPopup && dataFocusableDepth !=20){
            focusController.setDepth(20)
            $timeout(function () {
                focusController.focus("remindergochannelbtn");
            },100)
        }

        if($rootScope.activeTemplate == 'EPG' && dataFocusableDepth !=10 && dataFocusableDepth !=7){
            if($rootScope.showEpgReminderPopup){
                if(dataFocusableDepth !=20){
                    focusController.setDepth(20)
                    $timeout(function () {
                        focusController.focus("remindergochannelbtn");
                    },100)
                }
                
            }
            else{
                focusController.setDepth(10)
                $timeout(function () {
                    focusController.focus("chitem0");
                },100)
            }
            
        }
        if($rootScope.activeTemplate == "Settings" && dataFocusableDepth !=7){
            if($rootScope.showPurchasePINPopup){
                focusController.setDepth(7)
                    $timeout(function () {
                        focusController.focus("proceed-purchase-btn");
                    },100)
            }
        }

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
                    if(dataFocusableGroup=="infoBarAnchor")
                        $rootScope.$broadcast('updateNextEpgData');
                    break;
                case 37:
                    if(dataFocusableGroup=="infoBarAnchor")
                        $rootScope.$broadcast('updatePreviousEpgData');
                    break;
                case 38:
                    $timeout(function () {
                        if($rootScope.moreControlsActive){
                            focusController.setDepth(5)
                            focusController.focus('moreInfoBtnBack0')
                        }
                        else
                            focusController.focus('moreInfoBtn0')
                    },0)
                    //$rootScope.moreControlsActive = true;
                    break;
                case 427:
                    if(dataFocusableGroup=="infoBarAnchor"){
                        $rootScope.$broadcast('selectedEpgChannelUp');
                        $rootScope.openChannel(false,false,$rootScope.currentFocusedChannel.id);
                    }
                    break;
                case 40:
                    $timeout(function () {
                        if($rootScope.moreControlsActive){
                            focusController.setDepth(5)
                            focusController.focus('moreInfoBtnBack0')
                        }
                        else{
                            focusController.setDepth(4)
                            focusController.focus('infoBarAnchor')
                        }
                    },0)
                    //$rootScope.moreControlsActive = false;
                    break;
                case 428:
                    if(dataFocusableGroup=="infoBarAnchor"){
                        $rootScope.$broadcast('selectedEpgChannelDown');
                        $rootScope.openChannel(false,false,$rootScope.currentFocusedChannel.id);
                    }
                    break;
                default:
                    break;
            }
        }
        else if(dataFocusableDepth==10){
            switch (event.keyCode) {
                case 39:
                    
                    break;
                case 40:
                    
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
                if(dataFocusableDepth==7){
                    $scope.closeParentalPinPopup()
                    //if($rootScope.showPurchasePINPopup)
                        //$scope.closePurchasePinPopup()
                }
                else if ($rootScope.showSideChannelList){
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
                    if(dataFocusableDepth==5 || dataFocusableDepth==4){
                        $rootScope.moreControlsActive = false;
                        $rootScope.showAudioTrackPopup = false;
                        $rootScope.showChannelInfoBar = false;
                        focusController.setDepth(2)
                        focusController.focus("playerFocusAnchor");
                    }
                    else if(dataFocusableDepth==10 && dataFocusableGroup=="epgListItem"){
                        focusController.focus('epgplaychannel')
                    }
                    else if(dataFocusableDepth==20){
                        $rootScope.deleteReminderFromPopup($rootScope.activeEpgReminder.id)
                    }
                    else if(dataFocusableDepth==9){
                        $rootScope.closeDevicePopup()
                    }
                    else{
                        if($rootScope.activeTemplate == 'Home'){
                            $scope.exitApp()
                            //$rootScope.logout()
                        }
                        
                        if($rootScope.activeTemplate == "Search"){
                            if(!$rootScope.keyBoardActive)
                                routingService.openPreviousTemplate();
                        }
                        else if($rootScope.activeTemplate != "Settings" && $rootScope.activeTemplate!='Login'){
                            routingService.openPreviousTemplate();
                        }
                        else{
                            if(dataFocusableGroup=='settingsitem'){
                                routingService.openPreviousTemplate();
                            }
                            
                        }
                    }
                }
                break;
            case tizen.tvinputdevice.getKey('ColorF0Red').code:
                if(activeItem.data("channelitem")){
                    httpService.handleFavoriteChannel($(activeItem).find(".channelId").html(),$(activeItem).find(".isFavorite").html());
                }
                break;
            case tizen.tvinputdevice.getKey('ColorF1Green').code:
                //console.log("green pressed");
                break;
            case tizen.tvinputdevice.getKey('ColorF2Yellow').code:
                //console.log("yellow pressed");
                break;
            case tizen.tvinputdevice.getKey('ColorF3Blue').code:
                //console.log("blue pressed");
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

        if ($rootScope.showEpgTemplate) {
            var currentFocusedItem = focusController.getCurrentFocusItem();

            if ($(currentFocusedItem).data("focustype") == "epgtitle") {
                if (event.keyCode == 39) {
                    //angular.element(currentFocusedItem).triggerHandler('keydown');
                    $rootScope.$broadcast("triggerRightKey", {
                        myelem: $(currentFocusedItem)
                    })
                } else if (event.keyCode == 37) {
                    //angular.element(currentFocusedItem).triggerHandler('keydown');
                    $rootScope.$broadcast("triggerLeftKey", {
                        myelem: $(currentFocusedItem)
                    })
                }
                else if(event.keyCode == tizen.tvinputdevice.getKey('ColorF2Yellow').code){
                  var epgchannelid = $rootScope.currentFocusedEpgElement.data("epgchannelid");
                  var epgprogrammeid = $rootScope.currentFocusedEpgElement.data("epgprogrammeid");
                  var hasReminder = $rootScope.currentFocusedEpgElement.data("hasreminder");
                  var reminderstringid = $rootScope.currentFocusedEpgElement.data("reminderstringid");
                  var channelid = 0;
                  var reminder_id = 0;
                  var reminderMinutes = configService.epgReminderMinutes;

                  for(var i=0;i<$rootScope.channels.length;i++){
                    if($rootScope.channels[i].epg_channel_id == epgchannelid)
                      channelid = $rootScope.channels[i].id;
                  }
                  if(channelid && epgprogrammeid && ($rootScope.addReminderBtn || $rootScope.removeReminderBtn)){
                    if(hasReminder){
                      for(var i=0;i<$rootScope.epgReminders.length;i++){
                        if($rootScope.epgReminders[i].string_id == reminderstringid)
                          reminder_id = $rootScope.epgReminders[i].id;
                      }
                      httpService.deleteEpgReminder(reminder_id,true,epgprogrammeid);
                    }
                    else
                      httpService.addEpgReminder(channelid, epgchannelid, epgprogrammeid,configService.epgReminderMinutes, true);
                  }


                }
                else if(event.keyCode == tizen.tvinputdevice.getKey('ColorF3Blue').code){
                  var channel = 0;
                  var epgchannelid = $rootScope.currentFocusedEpgElement.data("epgchannelid");
                  $rootScope.goToChannelSelection = $rootScope.getChannelByEpgChannelId(epgchannelid);
                  //$scope.openPlayerTemplate(true,true,channel);
                  if($rootScope.goToChannelSelection.parental_rating && $rootScope.goToChannelSelection.parental_rating.require_pin)
                  {
                    $scope.openParentalPinPopup(true);
                  }else{
                    $rootScope.$broadcast('Invoke-openPlayerTemplate', {
                        skipRouteStack: true
                    });
                    $rootScope.playChannel($rootScope.goToChannelSelection);
                  }
                }
            }
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
        $rootScope.activeTemplate = 'Home';
        $rootScope.showLoader = false;
        $rootScope.$broadcast('refreshCurrentTime');
        $rootScope.$broadcast('refreshEpgData');
        $rootScope.hidePlayerTemplate();
        if($rootScope.favoriteChannelsExist){
            $rootScope.loadFavoriteChannelsView = true;
        }
        $rootScope.loadChannelsView = true;

        $timeout(function () {
            $rootScope.showActiveTemplateInMenuBox = false;
            $rootScope.showMainMenu = true;
            focusController.setDepth(0);
        }, 50);
        $timeout(function () {
            focusController.focus("menuitem0");
            $('.mainContentBox').css({top:0})
        }, 150);
    };
    $rootScope.$on('Invoke-openHomeTemplate', function (event, args) {
        var skipRouteStack = false;
        if (args && args.skipRouteStack)
            skipRouteStack = args.skipRouteStack;
        $scope.openHomeTemplate(skipRouteStack);
    });

    $scope.openLiveTVTemplate = function (skipRouteStack) {
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
    $rootScope.$on('Invoke-openLiveTVTemplate', function (event, args) {
        var skipRouteStack = false;
        if (args && args.skipRouteStack)
            skipRouteStack = args.skipRouteStack;
        $scope.openLiveTVTemplate(skipRouteStack);
    });
    $rootScope.$on('Invoke-openPlayerTemplate', function (event, args) {
        var skipRouteStack = false;
        if (args && args.skipRouteStack)
            skipRouteStack = args.skipRouteStack;
        $scope.openPlayerTemplate(skipRouteStack);
    });
    $scope.openPlayerTemplate = function (skipRouteStack,focusOnChannel,channel) {
        if (!skipRouteStack)
            routingService.addRouteToStack("openPlayerTemplate");
        $scope.hideAllTemplates();

        $rootScope.activeTemplate = 'Player';
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
        $rootScope.moreControlsActive = false;
        $rootScope.showAudioTrackPopup = false;
        $timeout(function () {
            focusController.setDepth(4);
            focusController.focus("infoBarAnchor")
        }, 200);
    };
    $rootScope.openEpgReminderPopup = function (){
        $rootScope.showEpgReminderPopup = true;
        $rootScope.lastFocusedItem = focusController.getCurrentFocusItem();
        $rootScope.lastFocusedDepth = focusController.getCurrentDepth();
        $rootScope.popupIsOpen = true;
        $timeout(function () {
          focusController.setDepth(20);
          focusController.focus("remindergochannelbtn");
        }, 300);
      }
    $scope.openEpgTemplate = function (skipRouteStack) {
        if (!skipRouteStack)
            routingService.addRouteToStack("openEpgTemplate");
        
        $rootScope.showEpgTemplate = true;
        $rootScope.showEpgTemplateTodayBox = true;
        $rootScope.activeTemplate = 'EPG';
        $rootScope.showHelpBar = false;
        $rootScope.addToFavoritesHelpButton = false;
        $rootScope.removeFromFavoritesHelpButton = false;
        $timeout(function () {
            focusController.setDepth(10);
            focusController.focus("chitem0");
            $rootScope.initEpgLoadDetails()
        }, 500);
    };
    $rootScope.showEpgTemplateTodayBox = false;
    $rootScope.refreshEPGTemplate = function () {
        $rootScope.showEpgTemplateTodayBox = true;
    }

    $scope.openSettingsTemplate = function (skipRouteStack) {
        if (!skipRouteStack)
            routingService.addRouteToStack("openSettingsTemplate");
        focusController.setDepth(0);
        $scope.hideAllTemplates();
        $rootScope.showLoader = false;
        $rootScope.showMainTemplate = true;
        $rootScope.showSettingsTemplate = true;
        $rootScope.activeTemplate = 'Settings';
        $rootScope.$broadcast('refreshCurrentTime');
        $rootScope.openInitSettingsPanel()
        $timeout(function () {
            $rootScope.showActiveTemplateInMenuBox = false;
            $rootScope.showMainMenu = true;
            focusController.focus('settingsItem0')
        }, 50);
    };
    $rootScope.$on('Invoke-openSettingsTemplate', function (event, args) {
        var skipRouteStack = false;
        if (args && args.skipRouteStack)
            skipRouteStack = args.skipRouteStack;
        $scope.openSettingsTemplate(skipRouteStack);
    });
    $scope.openParentalPinPopup = function(channel,fromList,fullscreen){
        $rootScope.parentalPin = null;
        $rootScope.showParentalPinError = false;
        $rootScope.showParentalPINPopup = true;
        $rootScope.previusFocusDepth = focusController.getCurrentDepth();
        $rootScope.lastFocusedItem = focusController.getCurrentFocusItem();
        $timeout(function () {
          focusController.setDepth(7);
          if(!$rootScope.popupInFullscreen){
            focusController.focus("parentalPin-input");
          }
          else
          {
            focusController.focus("close-parental-btn");
          }
  
        }, 300);
    }
    $scope.closeParentalPinPopup = function($event, $originalEvent){
        $rootScope.showParentalPINPopup = false;
        $rootScope.showParentalPinError = false;
        $timeout(function () {
            focusController.setDepth($rootScope.previusFocusDepth);
            focusController.focus($($rootScope.lastFocusedItem).data("focusable-name"));
        }, 100);
    };
    $rootScope.openPurchasePinPopup = function(){
        $rootScope.purchasePin = null;
        $rootScope.showPurchasePinError = false;
        $rootScope.showPurchasePINPopup = true;
        $rootScope.previusFocusDepth = focusController.getCurrentDepth();
        $rootScope.lastFocusedItem = focusController.getCurrentFocusItem();
        $timeout(function () {
          focusController.setDepth(7);
          if(!$rootScope.popupInFullscreen){
            focusController.focus("purchasePin-input");
          }
          else
          {
            focusController.focus("close-purchase-btn");
          }
  
        }, 300);
    }
    $scope.closePurchasePinPopup = function($event, $originalEvent){
        $rootScope.showPurchasePINPopup = false;
        $rootScope.showPurchasePinError = false;
        $timeout(function () {
            focusController.setDepth($rootScope.previusFocusDepth);
            focusController.focus($($rootScope.lastFocusedItem).data("focusable-name"));
        }, 100);
    };
    $scope.checkPurchasePin = function($event, $originalEvent){
        if($rootScope.loggedUser.account.purchase_pin == $rootScope.purchasePin){
            $scope.closePurchasePinPopup();
            httpService.updateSubscription($rootScope.selectedSubForPurchase)
        }
        else{
            $rootScope.showPurchasePinError = true;
        }
    }
    $scope.setPurchasePin = function ($event, value) {
        if ($event.target.parentNode.title == "purchasePin") {
            $rootScope.purchasePin = value;
        }
    };
    $scope.checkParentalPin = function($event, $originalEvent){
        if($rootScope.loggedUser.profile.pin == $rootScope.parentalPin){
          $scope.closeParentalPinPopup();
          $rootScope.showPlayerLoader = true;
            $timeout(function () {
            $rootScope.$broadcast('Invoke-openPlayerTemplate', {
                skipRouteStack: true
            });
            $rootScope.playChannel($rootScope.channelToPlay);
            }, 10);
        }
        else{
          $rootScope.showParentalPinError = true;
        }
    }
    $scope.setParentalPin = function ($event, value) {
        if ($event.target.parentNode.title == "parentalPin") {
            $rootScope.parentalPin = value;
        }
    };
    $scope.focusInputField = function ($event, $originalEvent) {
        $($event.currentTarget).find("input").focus();
    }

    $scope.openSearchTemplate = function (skipRouteStack) {
        if (!skipRouteStack)
            routingService.addRouteToStack("openSearchTemplate");
        $scope.hideAllTemplates();

        $rootScope.showMainTemplate = true;
        $rootScope.showSearchTemplate = true;
        $rootScope.showSearchTemplateItems = true;
        $rootScope.loadSearchChannelList = true;
        $rootScope.activeTemplate = 'Search';
        $rootScope.hidePlayerTemplate();
        focusController.setDepth(0);
        $rootScope.currentFocusDepth = 0;
        $rootScope.$broadcast('loadSearchTemplateInit');
        $('.mainContentBox').css({top:0})
        $timeout(function () {
            focusController.focus("searchinputfield");
        }, 1000);
    };
    $rootScope.$on('Invoke-openSearchTemplate', function (event, args) {
        var skipRouteStack = false;
        if (args && args.skipRouteStack)
            skipRouteStack = args.skipRouteStack;
        $scope.openSearchTemplate(skipRouteStack);
    });
    $scope.exitApp = function(){
      tizen.application.getCurrentApplication().exit();
    }
}]);
