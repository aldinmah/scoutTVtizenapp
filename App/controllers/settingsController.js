scoutTVApp.controller("settingsCtrl", ['$scope', '$rootScope','$timeout', 'focusController','nearestFocusableFinder','FocusConstant', 'configService', 'httpService', 'storageService', 'routingService', function ($scope, $rootScope, $timeout, focusController,nearestFocusableFinder,FocusConstant, configService, httpService, storageService, routingService) {

    $scope.settingsItems = [
        {id:1,name:'Account Information',template:'account_information'},
        {id:2,name:'Add New Account',template:'add_account'},
        {id:3,name:'Payment History',template:'payment_history'},
        //{id:4,name:'Change Password',template:'change_password'},
        {id:5,name:'Subscription',template:'subscription'},
        {id:6,name:'Billing Information',template:'billing_information'},
        {id:7,name:'Settings',template:'settings'},
        {id:8,name:'Devices',template:'devices'},
        {id:9,name:'Themes',template:'themes'},
    ];
    $rootScope.countriesList = []
    $scope.showCountryListPopup = false;
    $scope.accountData = angular.copy($rootScope.loggedUser);

    $scope.newAccountData = {
        first_name: '',
        last_name: '',
        email: '',
        username: '',
        age: 0,
        password: '',
        confirm_password: '',
        isKidAccount: false,
        pin: "0000"
    };

    $scope.purchase_pinErrorMessage = ""
    $scope.parental_pinErrorMessage = ""
    $scope.emailErrorMessage = ''
    $scope.confirm_password_error_message = ''
    
    $scope.account_information = true;
    $scope.add_account = false;
    $scope.payment_history = false;
    $scope.change_password = false;
    $scope.subscription = false;
    $scope.billing_information = false;
    $scope.settings = false;
    $scope.devices = false;
    $scope.themes = false;
    
    $scope.enableCreateBtn = false;
    $scope.enableBillingSaveBtn = false;
    
    $scope.validateAddAccountFields = function () {
        $scope.enableCreateBtn = false;
        var hasErrors = false;
        if(!$scope.newAccountData.first_name.length){
            hasErrors = true;
        }
        if(!$scope.newAccountData.last_name.length){
            hasErrors = true;
        }
        if(!$scope.newAccountData.email.length || !$scope.validateEmail($scope.newAccountData.email)){
            hasErrors = true;
        }
        if(!$scope.newAccountData.username.length){
            hasErrors = true;
        }
        if(!$scope.newAccountData.password.length){
            hasErrors = true;
        }
        if(!$scope.newAccountData.confirm_password.length){
            hasErrors = true;
        }
        if(!$scope.newAccountData.pin.length){
            hasErrors = true;
        }
        if($scope.newAccountData.password != $scope.newAccountData.confirm_password){
            hasErrors = true;
        }
    
        if($scope.accountData.account.billing_first_name.length>0 &&
            $scope.accountData.account.billing_email.length>0 &&
            $scope.accountData.account.billing_address.length>0 &&
            $scope.accountData.account.billing_last_name.length>0 &&
            $scope.accountData.account.billing_country_name.length>0){
                $scope.enableBillingSaveBtn = true
        }
        else{
            $scope.enableBillingSaveBtn = false
        }

        if(!hasErrors)
            $scope.enableCreateBtn = true;
    }
    
    $rootScope.$on('countriesLoaded',function (event, args) {
        if(args.response && args.response.length){
            $rootScope.countriesList = args.response
        }
    })
    $rootScope.$on('accountProfileCreated',function (event, args) {
        if(args.response && args.response.data){
            if(args.response.status == 0){
                if(typeof(args.response.data.email) != 'undefined'){
                    alert(args.response.data.email[0])
                }
                if(typeof(args.response.data.username) != 'undefined'){
                    alert(args.response.data.username[0])
                }
            }
            else
                alert('Profile successfully created')
        }
    })
    $rootScope.$on('accountDataUpdated',function (event, args) {
        var response = args.response;
        if(response && response.data){
            $rootScope.loggedUser.existingPassword = angular.copy($scope.accountData.password);
            $rootScope.loggedUser.profile.age = response.data.age
            $rootScope.loggedUser.profile.sex = response.data.sex
            $rootScope.loggedUser.profile.email = response.data.email
            $rootScope.loggedUser.profile.first_name = response.data.first_name
            $rootScope.loggedUser.profile.last_name = response.data.last_name
            $rootScope.loggedUser.profile.pin = response.data.pin
            $rootScope.loggedUser.account.purchase_pin = $scope.accountData.account.purchase_pin

            $rootScope.loggedUser.account.billing_address = $scope.accountData.account.billing_address
            $rootScope.loggedUser.account.billing_country_name = $scope.accountData.account.billing_country_name
            $rootScope.loggedUser.account.billing_email = $scope.accountData.account.billing_email
            $rootScope.loggedUser.account.billing_first_name = $scope.accountData.account.billing_first_name
            $rootScope.loggedUser.account.billing_last_name = $scope.accountData.account.billing_last_name

            $scope.accountData = angular.copy($rootScope.loggedUser);
            if(response.data.sex){
                $scope.femaleChecked = true;
                $scope.maleChecked = false;
            }
            else{
                $scope.femaleChecked = false;
                $scope.maleChecked = true;
            }
            alert('Account information successfully updated')
        }
    })
    
    $scope.saveAccountBillingInfoChanges = function () { 
        httpService.updateAccountData($scope.accountData)
    }
    $scope.saveAccountInfoChanges = function () { 
        if($scope.purchase_pinErrorMessage.length>0 || $scope.parental_pinErrorMessage.length>0 || $scope.emailErrorMessage.length>0) return;
            httpService.updateAccountData($scope.accountData)
    }
    $scope.saveAccountInfoChanges = function () { 
        if($scope.accountData.account.billing_first_name.length>0 || 
            $scope.accountData.account.billing_email.length>0 || 
            $scope.accountData.account.billing_address.length>0 || 
            $scope.accountData.account.billing_last_name.length>0 || 
            $scope.accountData.account.billing_country_name.length>0) return;
            httpService.updateAccountData($scope.accountData)
    }
    $scope.resetAccountInfoChanges = function () {
        $scope.accountData = angular.copy($rootScope.loggedUser);
        $scope.hideAllPanels()
        $timeout(function () {
            $rootScope.openInitSettingsPanel();
            $timeout(function () {
                focusController.focus('accountcancelbtn')
            }, 100);
        }, 10);
    }
    $rootScope.openInitSettingsPanel = function () {
        $scope.accountData = angular.copy($rootScope.loggedUser);
        $scope.hideAllPanels();
        $scope.account_information = true;
        $timeout(function () {
            focusController.focus('settingsItem0')
        },100)
    }
    $scope.hideAllPanels = function () {
        $scope.account_information = false;
        $scope.add_account = false;
        $scope.payment_history = false;
        $scope.change_password = false;
        $scope.subscription = false;
        $scope.billing_information = false;
        $scope.settings = false;
        $scope.devices = false;
        $scope.themes = false;
        $scope.purchase_pinErrorMessage = ""
        $scope.parental_pinErrorMessage = ""
        $scope.emailErrorMessage = ''
    }
    $scope.openSettingsPanel = function (template) {
        $scope.hideAllPanels();
        $scope[template] = true

        if(template=="account_information"){
            $scope.femaleChecked = $scope.accountData.sex?true:false;
            $scope.maleChecked = $scope.accountData.sex?false:true;
        }

        if(template=="devices"){
            httpService.getAllDevices();
        }

        if(template=="payment_history"){
            $scope.allPaymentHistory = []
            httpService.getPaymentHistory();
        }

        if(template=="billing_information"){
            $scope.validateAddAccountFields()
        }
    }
    $scope.onBlur = function ($event, $originalEvent) {
        $('.accountInfoWrapper, .addAccountPanel').removeClass('moveFieldsUp')
    }
    $scope.focusAndMoveFormUp = function ($event, $originalEvent) {
        $event.preventDefault()
        $('.accountInfoWrapper, .addAccountPanel').addClass('moveFieldsUp')
        $($event.currentTarget).find("input").focus();
        return false;
    }
    $scope.focus = function ($event, $originalEvent) {
        $event.preventDefault()
        $($event.currentTarget).find("input").focus();
        return false;
    }
    $rootScope.$on('forceParentalPinFocus',function (event, args) { 
        $timeout(function () {
            focusController.focus('field7')
        },100)
    })
    $scope.focusCheckbox = function ($event, $originalEvent) {
        if(focusController.getCurrentGroup()=='checkboxWrapper'){
            focusController.focus(nearestFocusableFinder.getNearest($(focusController.getCurrentFocusItem()), FocusConstant.DIRECTION.RIGHT));
        }
        $($event.currentTarget).find(".caph-checkbox").focus();
    }
    $scope.selectCheckbox = function($event, $checked,  $originalEvent ) {
        $scope.newAccountData.isKidAccount = $checked
    };
    $scope.selectRadioBtn = function name(selectedGenre) {
        $scope.accountData.profile.sex=selectedGenre
    }
    $scope.validateEmail = function (email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }
    
    $scope.change = function ($event, value) {
        switch ($event.target.parentNode.title) {
            case 'f_name':
                if($scope.add_account)
                    $scope.newAccountData.first_name = value;
                else
                    $scope.accountData.profile.first_name = value;
                break;
            case 'l_name':
                if($scope.add_account)
                    $scope.newAccountData.last_name = value;
                else
                    $scope.accountData.profile.last_name = value;
                break;
            case 'email':
                if (value) {
                    if($scope.validateEmail(value)){
                        if($scope.add_account)
                            $scope.newAccountData.email = value;
                        else
                            $scope.accountData.profile.email = value;
                        $scope.emailErrorMessage = ''
                    }
                    else
                        $scope.emailErrorMessage = 'Invalid email address!'
                }
                else
                    $scope.emailErrorMessage = 'Email address cannot be empty!'
                break;
            case 'username':
                if($scope.add_account)
                    $scope.newAccountData.username = value;
                else
                    $scope.accountData.profile.username = value;
                break;
            case 'password':
                    if($scope.add_account){
                        $scope.newAccountData.password = value;
                        if($scope.newAccountData.confirm_password && ($scope.newAccountData.password != $scope.newAccountData.confirm_password))
                            $scope.confirm_password_error_message = 'Password and confirm password does not match!'
                        else
                            $scope.confirm_password_error_message = ''
                    }
                    break;
            case 'confirm_password':
                if($scope.add_account){
                    $scope.newAccountData.confirm_password = value;
                    if($scope.newAccountData.password != $scope.newAccountData.confirm_password)
                        $scope.confirm_password_error_message = 'Password and confirm password does not match!'
                    else
                        $scope.confirm_password_error_message = ''
                }
                break;
            case 'age':
                if($scope.add_account)
                    $scope.newAccountData.age = value;
                else
                    $scope.accountData.profile.age = value;
                    break;
            case 'pin':
                if(value.length!=4){
                    if($scope.add_account)
                        $scope.newAccountData.pin = value;
                    else
                        $scope.accountData.profile.pin = value;
                    $scope.parental_pinErrorMessage = 'Parental PIN must contain 4 characters'
                }
                else{
                    $scope.parental_pinErrorMessage = ''
                    if($scope.add_account)
                        $scope.newAccountData.pin = value;
                    else
                        $scope.accountData.profile.pin = value;
                }
                $('.accountInfoWrapper').removeClass('moveFieldsUp')
                break;
            case 'purchase_pin':
                if(value.length!=5){
                    if($scope.add_account)
                        $scope.newAccountData.purchase_pin = value;
                    else
                        $scope.accountData.profile.purchase_pin = value;
                    $scope.purchase_pinErrorMessage = 'Purchase PIN must contain 5 characters'
                }
                else{
                    $scope.purchase_pinErrorMessage = ''
                    if($scope.add_account)
                        $scope.newAccountData.purchase_pin = value;
                    else
                        $scope.accountData.profile.purchase_pin = value;
                }
                $('.accountInfoWrapper').removeClass('moveFieldsUp')
                break;

            case 'billing_first_name':
                $scope.accountData.account.billing_first_name = value;
                break;
            case 'billing_email':
                $scope.accountData.account.billing_email = value;
                break;
            case 'billing_address':
                $scope.accountData.account.billing_address = value;
                break;
            case 'billing_last_name':
                $scope.accountData.account.billing_last_name = value;
                break;
            case 'billing_country_name':
                $scope.accountData.account.billing_country_name = value;
                break;
            default:
                break;
        }

        $scope.validateAddAccountFields()
    }
    $scope.resetNewAccountInfo = function () {
        $scope.newAccountData = {
            first_name: '',
            last_name: '',
            email: '',
            username: '',
            age: 0,
            password: '',
            confirm_password: '',
            isKidAccount: true,
            pin: ""
        };
        $scope.validateAddAccountFields()

        $scope.$apply();
    }
    $scope.createNewAccount = function () {
        var hasErrors = false
        if(!$scope.newAccountData.first_name.length){
            hasErrors = true;
            alert('First name can not be empty')
        }
        if(!$scope.newAccountData.last_name.length){
            hasErrors = true;
            alert('Last name can not be empty')
        }
        if(!$scope.newAccountData.email.length){
            hasErrors = true;
            alert('Email can not be empty')
        }
        if($scope.newAccountData.username.length<3){
            hasErrors = true;
            alert('Username must be at least 3 characters long')
        }
        if($scope.newAccountData.password.length<4){
            hasErrors = true;
            alert('Password must be at least 4 characters long')
        }
        if(!hasErrors)
            httpService.createProfile($scope.newAccountData)
    }
    $scope.changePasswordData = {
        existing_password: '',
        confirm_new_password: '',
        new_password: ''
    }
    $scope.resetChangePassword = function () {
        $scope.changePasswordData = {
            existing_password: '',
            confirm_new_password: '',
            new_password: ''
        }
    }
    $scope.saveNewPassword = function () {
        if($rootScope.loggedUser.existingPassword == $scope.changePasswordData.existing_password){
            if($scope.changePasswordData.new_password == $scope.changePasswordData.confirm_new_password){
                $scope.accountData.password = $scope.changePasswordData.new_password;
                httpService.updateAccountData($scope.accountData)
            }
            else{
                alert('Password and confirm password does not match!')
            }
        }
        else{
            alert('Wrong current password entered!')
        }
    }

    $scope.allDevices = []
    $scope.showDeviceList = true;
    $scope.noDevicesMessage = 'No devices available.'
    $rootScope.showDeviceDetailsPopup = false;
    $scope.selectedDevice = {};

    $rootScope.closeDevicePopup = function () {
        $rootScope.showDeviceDetailsPopup = false;
        focusController.setDepth(0)
        focusController.focus($rootScope.lastFocusedItem)
    }
    $scope.selectDeviceFromList = function (selectedDevice) {
        $scope.selectedDevice = selectedDevice;
        $rootScope.showDeviceDetailsPopup = true;
        $rootScope.lastFocusedItem = focusController.getCurrentFocusItem();
        focusController.setDepth(9)
        $timeout(function () {
            focusController.setDepth(9)
            $timeout(function () {
                focusController.focus('closedevicepopup')
            },100)
        },100)
    }
    $rootScope.$on('allDevicesLoaded',function (event, args) {
        if(args.response){
            $scope.noDevicesMessage = ''
            $scope.allDevices = args.response;
            $scope.showDeviceList = true;
            $timeout(function () {
                focusController.focus('deviceItem0')
            },100)
        }
        else{
            $scope.noDevicesMessage = 'No devices available.'
            $scope.showDeviceList = false;
        }
    })


    $scope.allPaymentHistory = []
    $scope.showPaymentList = true;
    $scope.noPaymentHistoryMessage = 'No payment history available.'
    $rootScope.showPaymentDetailsPopup = false;
    $scope.selectedPayment = {};

    $rootScope.closePaymentPopup = function () {
        $rootScope.showPaymentDetailsPopup = false;
        focusController.setDepth(0)
        focusController.focus($rootScope.lastFocusedItem)
    }
    $scope.selectPaymentFromList = function (selectedPayment) {
        $scope.selectedPayment = selectedPayment;
        $rootScope.showPaymentDetailsPopup = true;
        $rootScope.lastFocusedItem = focusController.getCurrentFocusItem();
        focusController.setDepth(9)
        $timeout(function () {
            focusController.setDepth(9)
            $timeout(function () {
                focusController.focus('closePaymentpopup')
            },100)
        },100)
    }
    $rootScope.$on('paymentHistoryLoaded',function (event, args) {
        if(args.response){
            $scope.noPaymentHistoryMessage = ''
            $scope.allPaymentHistory = args.response;
            $scope.showPaymentList = true;
        }
        else{
            $scope.noPaymentHistoryMessage = 'No payment history available.'
            $scope.showPaymentList = false;
        }
    })
    $scope.handleCountryListPopup = function () {
        $scope.showCountryListPopup = !$scope.showCountryListPopup
    }
    $rootScope.changeCountry = function($event, $originalEvent, selectedTrack){
        $scope.accountData.account.billing_country_name = selectedTrack.name
        $scope.accountData.account.billing_country_id = selectedTrack.value
        $scope.showCountryListPopup = false
        $scope.validateAddAccountFields()
        $timeout(function () {
            focusController.focus('countryselector')

            $scope.$apply()
        },100)
    };
}]);
