scoutTVApp.service('routingService', function ($rootScope) {
    var routeStack = [];

    function addRouteToStack(data) {
        if (routeStack.length > 10)
            routeStack.shift();
        if (routeStack.length == 0)
            routeStack.push(data);
        else if (routeStack[routeStack.length - 1] != data)
            routeStack.push(data);
    };
    function clearTemplateStack(){
       routeStack = [];
     }
    function removeLastTemplate() {
        routeStack.pop();
    }

    function getStackItem() {
        if (routeStack.length > 1)
            return routeStack[routeStack.length - 2];
        else
            return routeStack[0];
    }

    function getAllStackItems() {
        return routeStack;
    }

    function openPreviousTemplate() {
        var lastTemplate = getStackItem();
        if((lastTemplate == "openLoginScreen" && $rootScope.loginWelcomeTemplate)){
          $rootScope.$broadcast("triggerOpenExitAppPopup");
          return false;
        }
        if (routeStack.length > 1)
            routeStack.pop();
        //removeLastTemplate();
        $rootScope.$broadcast("Invoke-" + lastTemplate, {
            skipRouteStack: true
        });
    }
    return {
        addRouteToStack: addRouteToStack,
        getStackItem: getStackItem,
        getAllStackItems: getAllStackItems,
        openPreviousTemplate: openPreviousTemplate,
        clearTemplateStack: clearTemplateStack
    }
});
