var scoutTVApp = angular.module('scoutTVApp', ['caph.ui', 'caph.focus']);

scoutTVApp.run(function (keyListenerService) {
    keyListenerService.setKeyListenerOnWindow();

    tizen.tvinputdevice.registerKey('ColorF0Red');//code 403
    tizen.tvinputdevice.registerKey('ColorF1Green');//code 404
    tizen.tvinputdevice.registerKey('ColorF2Yellow');//code 405
    tizen.tvinputdevice.registerKey('ColorF3Blue');//code 406

    tizen.tvinputdevice.registerKey('ChannelUp'); //code: 427
    tizen.tvinputdevice.registerKey('ChannelDown');//code 428

    tizen.tvinputdevice.registerKey('MediaPlayPause');//code 10252
    tizen.tvinputdevice.registerKey('MediaRewind');//code 412
    tizen.tvinputdevice.registerKey('MediaFastForward');//code 417
    tizen.tvinputdevice.registerKey('MediaPlay');//code 415
    tizen.tvinputdevice.registerKey('MediaPause');//code 19
    tizen.tvinputdevice.registerKey('MediaStop');//code 19
    tizen.tvinputdevice.registerKey('Teletext');//code 19
    tizen.tvinputdevice.registerKey('Info');
});
