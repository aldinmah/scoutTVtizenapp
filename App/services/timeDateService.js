scoutTVApp.factory('timeDateService', function(globalService) {
    return {
        getCurrentTimeFormatedHHMM: function() {
            var d = new Date();
            var hours = '';
            var minutes = '';

            if(d.getMinutes()<10)
                minutes = "0"+ d.getMinutes();
            else
                minutes = d.getMinutes();

            if(d.getHours()<10)
                hours = "0"+ d.getHours();
            else
                hours = d.getHours();
            return hours +":"+ minutes;
        },
        getCurrentTimeFormatedDayddmmyyy : function() {
            var d = new Date();
            var curr_day = globalService.DaysOfWeekShort[d.getDay()];
            var curr_date = d.getDate();
            var curr_month = globalService.MonthNamesShort[d.getMonth()];
            var curr_year = d.getFullYear();
            return curr_day + ", " + curr_date + "." + curr_month + "." + curr_year;
        },
        getFormatedMonthddyyyy : function(d) {
            var curr_day = globalService.DaysOfWeekShort[d.getDay()];
            var curr_date = d.getDate();
            var curr_month = globalService.MonthNames[d.getMonth()];
            var curr_year = d.getFullYear();
            return curr_month + " " + curr_date + ", " + curr_year;
        },
        getCurrentTimeFormatedForEpg : function(addDays) {
            var d = new Date();
            if(addDays)
                d.setDate(d.getDate() + addDays);
            var curr_date = d.getDate();
            var curr_month = globalService.MonthNamesShort[d.getMonth()];
            var curr_year = d.getFullYear();
            return curr_date + "." + curr_month + "." + curr_year;
        },
        formatDateToMMYYYY : function(date) {
        	if(!date)
        		return "";
        	var d = new Date(date);
            return globalService.MonthNames[d.getMonth()] + " " + d.getFullYear();;
        },
        formatDateToHHMM: function(date, skipFormating){
            if(!skipFormating)
                date = date.replace(/\./g,' ').replace(/\s+/g, 'T');
            var d = new Date(date);
            var hours = '';
            var minutes = '';

            if(d.getMinutes()<10)
                minutes = "0"+ d.getMinutes();
            else
                minutes = d.getMinutes();

            if(d.getHours()<10)
                hours = "0"+ d.getHours();
            else
                hours = d.getHours();
            return hours +":"+ minutes;
        },
        createSafariDate: function(date){
            if(date){
              date = date.replace(/\./g,' ').replace(/\s+/g, 'T');
              return new Date(date);
            }
        },
        addHoursToDate: function(date, hours){
          return new Date(date.getTime() + hours*3600*1000);
        }
    };
});
