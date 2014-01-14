/**
 * Copyright (C) 2005, Intalio Inc.
 *
 * The program(s) herein may be used and/or copied only with
 * the written permission of Intalio Inc. or in accordance with
 * the terms and conditions stipulated in the agreement/contract
 * under which the program(s) have been supplied.
 */
var tabCounter = 1;
var currentTab;
var startId = 100;
var currentDashboard;
var istabExist = false;
var isFirstTab = false;
var firstTabId;
var currentTabName;
var isConsoleAccessible;
var bamAccess;
var dashboardStateUrl = 'dsState.json';
var dsState;
var widgetArr = [];
var dashboardData;
var defaultData = {
    "result": {
        "layout": "layout2",
        "data": []
    }
};
var aObject;
var columnId = ".second";
$(document).ready(function () {
    $('*').click(function () {
        $(document).find('#tablist li').removeClass('open');
    });
    $('.ace-tooltip').tooltip();
    $('.ace-popover').popover();

    $(window).resize(debouncer(function (e) {
        resizeWindow();
    }));

    /*start----*/
    /*start----*/
    $('.select').each(function () {
        var id = ($(this).attr('id'));
        $('#' + id).removeClass('select');
        $('#' + id)
            .button({
                icons: {
                    secondary: "ui-icon-triangle-1-s"
                }
            })
            .click(function () {
                var menu = $(this).parent().next().show().position({
                    my: "left top",
                    at: "left bottom",
                    of: this
                });
                $(document).one("click", function () {
                    menu.hide();
                });
                return false;
            })
            .parent()
            .buttonset()
            .next()
            .hide()
            .menu();
    });

    /*-----end*/
    getStateWidgetData();



    /*dashboard function starts*/

    // load the templates
    $('body').append('<div id="templates"></div>');
    $("#templates").hide();
    $("#templates").load("templates.html", initDashboard);


    /**@Function Name   : initDashboard 
     * @Description     : init method for dashboard to initliaze the all the events
     * @param           :
     * @returns         :
     * */

    function initDashboard() {
        $("#tabs").tabs({
            cache: true
        });
        $('#tabs').removeClass('ui-tabs ui-widget ui-widget-content ui-corner-all');
        $('.dmsaveDashboard').click(function () {
            persistLayoutChange(currentDashboard.serialize(), true);
            return false;
        });

        $('.dmeditLayout').click(function () {
            // open the lightbox for active tab
            if (currentDashboard != null) {
                currentDashboard.element.trigger("dashboardOpenLayoutDialog");
            }
            return false;
        });

        //persist when widget dnd.
        $(document).on('widgetDropped', '.span6', function () {
            if (currentDashboard != null) {
                //showLoader();
                setTimeout(function () {
                    persistLayoutChange(currentDashboard.serialize(), false);
                    //hideLoader();
                }, 500);
            }
            return false;
        });

        //persist when layout changed.
        $(document).on('click', '.layoutchoice', function () {
            if (currentDashboard != null) {
                persistLayoutChange(currentDashboard.serialize(), false);
            }
            return false;
        });

        //persist when widget deleted.
        $(document).on('click', '.icon-remove', function () {
            if (currentDashboard != null) {
                //showLoader();
                setTimeout(function () {
                    persistLayoutChange(currentDashboard.serialize(), false);
                    //hideLoader();
                }, 500);
            }
        });

        $(document).on('click', '#tabs ul li a .icon-caret-down', function () {
            $(document).find('#tabs ul.dropdown-menu li').removeClass('active');
            if ($(document).find('#tabs ul.nav li.dropdown').hasClass('active')) {
                var id = $(this).parent().parent().attr('id');
                if (id == 'openId') {
                    $(this).parent().parent().removeAttr('id');
                    $(this).parent().parent().removeClass("open");
                } else {
                    $(this).parent().parent().addClass("open");
                    $(this).parent().parent().attr('id', 'openId');
                }
            }
        });


        $(document).on('click', '.dmopenaddwidgetdialog', function () {
            if (currentDashboard != null) {
                currentDashboard.element.trigger("dashboardOpenWidgetDialog");
                $('body').find('#addwidgetdialog').modal({
                    toggle: true,
                    show: true
                });
            }
            return false;
        });


        //Add and persist widget.
        $(document).on('click', '.addwidget', function () {
            //On a single click dashboardAddWidget event should be fired only once.
            var eventCount = 0;
            if (currentDashboard != null) {
                currentDashboard.element.on('dashboardAddWidget', function (e, obj) {
                    if (eventCount == 0) {
                        eventCount++;
                        var widget = obj.widget;
                        var accessible = "";
                        if (widget.accessible != null && widget.accessible != undefined) {
                            accessible = widget.accessible;
                        } else {
                            accessible = "false";
                        }
                        var widgetData;
                        if (accessible == "true") {
                            widgetData = {
                                "id": startId++,
                                "title": widget.title,
                                "url": widget.url,
                                "column": "first",
                                "open": true,
                                "accessible": "true",
                                "metadata": widget.metadata
                            }
                        } else {
                            widgetData = {
                                "id": startId++,
                                "title": widget.title,
                                "url": widget.url,
                                "column": "first",
                                "open": true,
                                "metadata": widget.metadata
                            }
                        }
                        if(columnId==".second") {
							currentDashboard.addWidget(widgetData, currentDashboard.element.find('.first'), accessible);
							columnId = ".first";
							widgetData.column = "first";
						}
                        else{
							currentDashboard.addWidget(widgetData, currentDashboard.element.find('.second'),accessible);
							columnId = ".second";
							widgetData.column = "second";
						}
                        if (accessible == "true" || isConsoleAccessible == "true") {
                            persistWidget(widgetData);
                        }
                    }
                    return false;
                });
            }
            return false;
        });

    }
    var tabTitle = $("#tab_title"),
        tabTemplate = "<li class='dropdown' name='#{label}'><a class='dropdown-toggle' data-toggle='dropdown' href='#{href}'>#{label} <i class='icon-caret-down'></i></a><ul id='user_menu' class='dropdown-menu dropdown-info dropdown-yellow'><li><a class='dmopenaddwidgetdialog headerlink' href='#' data-toggle='tab'> <i class='icon-user'></i>&nbsp;Add Widget</a></li><li><a href='#' class='removetab' data-toggle='tab'> <i class='icon-remove-sign'></i>&nbsp;Remove Tab</a></li></ul></li>";

    var tabs = $("#tabs").tabs();

    $("#tabs").css("border-bottom", "#ffffff");

    // modal dialog init: custom buttons and a "close" callback reseting the form inside

    $(document).on('click', '#addTabButton', function () {
        addTab(defaultData, $("#tab_title").val(), istabExist, isFirstTab, false,true);
    });

    // actual addTab function: adds new tab using the input from the form above

    function addTab(jsonData, tabName, istabExist, isFirstTab, isLoading, isCreateTab) {
        //dialog to show tab title mandatory

        if (tabName == "" || tabName == undefined) {
            bootbox.alert("<h5>" + defaults.tabTitleMessage1 + "</h5>");
            return false;
        } else {
            //check whether this name exist or not? It will make tabName unique. 
            var stateDataInJson = dsState;
            if (stateDataInJson != null && stateDataInJson != 'undefined') {
                var tabsArray = stateDataInJson.tabs;
                var isAlreadyPresent = false;
                for (var i = 0; i < tabsArray.length; i++) {
                    if (tabsArray[i] != null && tabsArray[i].tabName == tabName && !isLoading) {
                        bootbox.alert("<h5>" + defaults.tabTitleMessage2 + " " + tabName + " exists" + "</h5>");
                        $('#tab_title').val("");
                        return false;
                    }
                }
            }
        }
		
        var label = tabName || "Tab " + tabCounter,
        id = "dashboard" + tabCounter,
        li = $(tabTemplate.replace(/#\{href\}/g, "#" + id).replace(/#\{label\}/g, label));
        tabs.find("#tablist").append(li);
        tabs.append("<div id='" + id + "' class='dashboard' name='" + label + "'><div class='layout'><div class='column first column-first span6'></div><div class='column second column-second span6'></div><div class='third column-third span6'></div></div></div>");
        tabs.tabs("refresh");
        if(isCreateTab) {
			addNewDashboard(id, jsonData);
			$('#tabs').tabs('select', '#' + id + '');
		}
        //Increment the counter.
        tabCounter++;
        //Select the new tab added.
        if (isFirstTab) {
            addNewDashboard(id, jsonData);
            firstTabId = id;
        }
        
        if (!istabExist) {
            persistTab(label);
        }
    }

    // addtab just opens the dialog
    $('.addtab').click(function () {
        // open the lightbox for active tab
        $("#tab_title").val = "";
        $('#addTabModal').modal({
            toggle: true,
            show: true
        });
        return false;
    });

    // close icon: removing the tab on click
    $(document).on("click", "#tabs ul li a.removetab", function () {
        var curObj = $(this).parent().parent().parent();
        bootbox.confirm("<h5>" + defaults.deleteTabConfirmMessage + "</h5>", function (result) {
            if (result) {
                var tabName = curObj.closest("li").attr("name");
                removeTab(tabName);
                var panelId = curObj.closest("li").remove().attr("aria-controls");
                $("#" + panelId).remove();
                tabs.tabs("refresh");
            }
        });
    });
    /* For changing Name of the tab
	$(document).on("dblclick", "#tabs ul li a", function () {
		if($("#tabs ul li span").hasClass("input-icon"))
			return false;
		else
		{
			aObject = $("#tabs ul li.active a:first");
			$("#tabs ul li.active a:first").remove();
			$("#tabs ul li.active").prepend("<span class='input-icon'><input id='newtabName' type='text' value='"+aObject.text()+"'><i id='rightIconOk' class='icon-ok'></i>&nbsp;<i id='rightIconRemove' class='icon-remove'></i></span>");
		}
	});
  

	$(document).on('click', '.icon-ok', function () {
		var stateDataInJson = dsState;
		var tabsArray = stateDataInJson.tabs;
		var newName = $("#newtabName").val();
		newName = newName.replace(/\s/g,"_");
		if(newName!=undefined) 
		{
			for(var k = 0; k<tabsArray.length;k++)
				{
					if($.trim(tabsArray[k].tabName)==$.trim(aObject.text()))
					{
						tabsArray[k].tabName = newName;
						dsState = stateDataInJson;
						$("#tabs ul li.active span:first").remove();
						$("#tabs ul li.active").prepend(aObject);
						$("#tabs ul li.active a:first").html(newName.replace(/_/g," ")+"<i class='icon-caret-down'></i>");
						saveDashboardStateData(JSON.stringify(dsState), false);
						return false;
					}
				}
		}
			return false;
	});
	
	$(document).on('click', '.icon-remove', function () {
		$("#tabs ul li.active span:first").remove();
		$("#tabs ul li.active").prepend(aObject);
	});
		*/
    getDashboardStateData();

    /**@Function Name   : persistLayoutChange 
     * @Description     : persists the current dashboard object
     * @param           : tabinfo,message
     * @returns         :
     * */

    function persistLayoutChange(tabInfoResult, showMessage) {
        var stateDataInJson = dsState;
        var tabsArray = stateDataInJson.tabs;
        for (var i = 0; i < tabsArray.length; i++) {
            if (tabsArray[i] != null && tabsArray[i].tabName == currentTabName) {
                var tabInfoResultInJson = jQuery.parseJSON(tabInfoResult);
                //Before saving data adding rule: for widget 1 all column should be in first and for layout 2,3,4 all third columns should be in first.
                checkLayoutColumns(tabInfoResultInJson);
                tabsArray[i].info.result = tabInfoResultInJson;
                dsState = stateDataInJson;
                saveDashboardStateData(JSON.stringify(dsState), showMessage);
                break;
            }
        }
    }
    /**@Function Name   : persistWidget 
     * @Description     : persists the current widget added
     * @param           : widgetData
     * @returns         :
     * */

    function persistWidget(widgetData) {
        var stateDataInJson = dsState;
        var tabsArray = stateDataInJson.tabs;
        //Checking whether it is already added or not?
        var isAlreadyPresent = false;
        var url = widgetData.url;
        for (var i = 0; i < tabsArray.length; i++) {
            if (tabsArray[i] != null) {
                var widgets = tabsArray[i].info.result.data;
                for (var j = 0; j < widgets.length; j++) {
                    if (widgets[j].url == url && currentTabName == tabsArray[i].tabName) {
                        isAlreadyPresent = true;
                        break;
                    }
                }
            }
        }
        if (!isAlreadyPresent) {
            for (var i = 0; i < tabsArray.length; i++) {
                if (tabsArray[i] != null && tabsArray[i].tabName == currentTabName) {
                    tabsArray[i].info.result.data.push(widgetData);
                    dsState = stateDataInJson;
                    saveDashboardStateData(JSON.stringify(dsState));
                    break;
                }
            }
        }
    }
    /**@Function Name   : removeTab 
     * @Description     : removes the tab & persists the current state
     * @param           : tabName to remove
     * @returns         :
     * */

    function removeTab(tabName) {
        var stateDataInJson = dsState;
        var tabsArray = stateDataInJson.tabs;
        for (var i = 0; i < tabsArray.length; i++) {
            if (tabsArray[i] != null && tabsArray[i].tabName == tabName) {
                var tabData = tabsArray[i].info.result.data;
                for (var j = 0; j < tabData.length; j++) {
                    widgetArr.splice($.inArray(tabData[j].url, widgetArr), 1);
                }
                tabsArray.splice($.inArray(tabsArray[i], tabsArray), 1);
                dsState = stateDataInJson;
                saveDashboardStateData(JSON.stringify(dsState), false);
                break;
            }
        }
    }
    /**@Function Name   : persistTab 
     * @Description     : persists the newly aaded tab
     * @param           : tabName to persist
     * @returns         :
     * */

    function persistTab(tabName) {
        var newTab = {
            "tabName": tabName,
            "info": {
                "result": {
                    "layout": "layout2",
                    "data": []
                }
            }
        };
        var stateDataInString = JSON.stringify(dsState);
        if (typeof stateDataInString != "undefined" && stateDataInString != "" && stateDataInString != null) {
            var stateDataInJson = jQuery.parseJSON(stateDataInString);
            var tabsArray = stateDataInJson.tabs;
            tabsArray.push(newTab);
            dsState = stateDataInJson;
        } else {
            dsState = {
                "tabs": [newTab]
            }
        }
        saveDashboardStateData(JSON.stringify(dsState), false);
    }
    /**@Function Name   : saveDashboardStateData 
     * @Description     : saves the current state of the dashboard
     * @param           : jsonString to save , message
     * @returns         :
     * */

    function saveDashboardStateData(jsonString, showMessage) {
        $.ajax({
            url: dashboardStateUrl,
            cache: false,
            async: true,
            dataType: 'json',
            data: {
                action: "saveState",
                jsonString: jsonString
            },
            //beforeSend: showLoader(),
            error: function (e) {
                bootbox.alert("<h5>" + defaults.errorMessageOnSavingState + "</h5>");
            },
            success: function (data) {
                //hideLoader();
                if (data.response != undefined && data.response != "" && data.response != "OK")
                    bootbox.alert("<h5>" + defaults.errorMessageOnSavingState + "</h5>");
                else if (showMessage)
                    bootbox.alert("<h5>" + defaults.errorMessageOnSavingState + "</h5>");
            }
        });
    }



    JSON.stringify = JSON.stringify || function (obj) {
        var t = typeof (obj);
        if (t != "object" || obj === null) {
            // simple data type
            if (t == "string") obj = '"' + obj + '"';
            return String(obj);
        } else {
            // recurse array or object
            var n, v, json = [],
                arr = (obj && obj.constructor == Array);
            for (n in obj) {
                v = obj[n];
                t = typeof (v);
                if (t == "string") v = '"' + v + '"';
                else if (t == "object" && v !== null) v = JSON.stringify(v);
                json.push((arr ? "" : '"' + n + '":') + String(v));
            }
            return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
        }
    };

    /**@Function Name   : getStateWidgetData  
     * @Description     : will get the widget data of current state
     * @param           :
     * @returns         :
     * */


    function getDashboardStateData() {
        $.getJSON(dashboardStateUrl + '?action=getState&ignore_cache=' + new Date().getTime(), function (data) {
            var stateDataInString = data.dsState.ds_state;
            if (typeof stateDataInString != "undefined" && stateDataInString != "" && stateDataInString != null) {
                var stateDataInJson = jQuery.parseJSON(stateDataInString);
                dsState = stateDataInJson;
                var tabsArray = stateDataInJson.tabs;
                var j = 0;
                for (var i = 0; i < tabsArray.length; i++) {
                    if (tabsArray[i] != null) {
                        if (j == 0) {
                            j++;
								addTab(tabsArray[i].info, tabsArray[i].tabName, true, true, true);
                        } else {
								addTab(tabsArray[i].info, tabsArray[i].tabName, true, false, true);
                        }
                        //Initialize the startId.  
                        var widgetsData = tabsArray[i].info.result.data;
                        for (var k = 0; k < widgetsData.length; k++) {
                            if (widgetsData != null && widgetsData[k].id >= startId) {
                                startId = widgetsData[k].id;
                                startId++;
                            }
                        }
                    }
                }
            $('#tabs').tabs('select', '#' + firstTabId + '');
            
            }

        });
    }
});

/**@Function Name   : clickRefresh  
 * @Description     : Refresh Icon will display
 * @param           :
 * @returns         :
 * */

function clickRefresh(obj){
var e = $(obj).closest(".widget-box .widget-header");
var i = false;
if (!e.hasClass("position-relative")) {
  i = true;
  e.addClass("position-relative")
 }
 e.find('h5').after('<span id="ref-icon">&nbsp;&nbsp;&nbsp;&nbsp;<i class="icon-spinner icon-spin blue"></i></span>');
 setTimeout(function () {
  e.find("#ref-icon").remove();
  if (i) {
   e.removeClass("position-relative")
  }
 }, parseInt(Math.random() * 1000 + 1000));
}

/**@Function Name   : getStateWidgetData  
 * @Description     : will get the widget data of current state
 * @param           :
 * @returns         :
 * */

function getStateWidgetData() {
    var data = {
        action: "getStateWidgetData"
    }
    var url = './data.json';
    $.ajax({
        url: url,
        cache: false,
        async: false,
        dataType: 'json',
        data: data,
        error: function (e) {},
        success: function (data) {
            if (data.currentUser == undefined || data.currentUser == null)
                submitActionToURL('login.htm', 'logOut');
            else {
                dashboardData = data;
                isConsoleAccessible = data.isConsoleAccessible;
                bamAccess = data.bamAccess;
                $("#user_info").text(data.currentUserName);
                $("#accessible").val(isConsoleAccessible);
            }
        }

    });
}
/**@Function Name   : addNewDashboard 
 * @Description     : creates a new dashboard object with the help of jquery.dashboard.min.js
 * @param           : dashboardid,jsonData
 * @returns         :
 * */

function addNewDashboard(id, jsonData) {
    var dashboard1 = $('#' + id).dashboard({
        layoutClass: 'layout',
        json_data: jsonData,
        addWidgetSettings: {
            widgetDirectoryUrl: "jsonfeed/Widget_categories"
        },
        layouts: [{
            title: "Layout1",
            id: "layout1",
            image: "layouts/layout1.png",
            classname: 'layout-a'
        }, {
            title: "Layout2",
            id: "layout2",
            image: "layouts/layout2.png",
            classname: 'layout-aa row-fluid'
        }, {
            title: "Layout3",
            id: "layout3",
            image: "layouts/layout3.png",
            classname: 'layout-ba'
        }, {
            title: "Layout4",
            id: "layout4",
            image: "layouts/layout4.png",
            classname: 'layout-ab'
        }, {
            title: "Layout5",
            id: "layout5",
            image: "layouts/layout5.png",
            classname: 'layout-aaa'
        }]
    }); // end dashboard call


    dashboard1.init();
    dashboardManager.addDashboard(dashboard1);
}

// DashboardManager which contains the dashboards
var dashboardManager = function () {
    var dashboards = new Array();

    function addDashboard(d) {
        dashboards.push(d);
    }

    function getDashboard(id) {
        var r;
        for (i = 0; i < dashboards.length; i++) {
            if (dashboards[i].element.attr("id") == id) {
                r = dashboards[i];
            }
        }
        return r;
    }

    // Public methods and variables.
    return {
        addDashboard: addDashboard,
        getDashboard: getDashboard,
    }

}();

/**
 * @Function Name : checkLayoutColumns
 * @Description   : will check for columns for the selected layout
 * @param         : data of columns
 * @returns :
 */

function checkLayoutColumns(data) {
    //Layout 1  have 1 column
    //Layout 2, 3, and 4  have 2 column
    //Layout 3 have 3 columns
    var layout = data.layout;
    var data = data.data;
    if (layout == 'layout1') {
        //Change all columns to first. 
        for (var i = 0; i < data.length; i++) {
            if (data[i].column != 'first') {
                data[i].column = 'first';

            }
        }
    } else if (layout == 'layout2' || layout == 'layout3' || layout == 'layout4') {
        for (var i = 0; i < data.length; i++) {
            if (data[i].column == 'third') {
                data[i].column = 'first';

            }
        }
    }
}
/**
 * @Function Name : reDrawTabsData
 * @Description   : it will redraw the selected tab widgets
 * @param         : currentdashboard,tabNo to redraw
 * @returns :
 */

function reDrawTabsData(tabNo) {
    $('#tabs ul li').each(function (index) {
        $(this).removeClass('active');
    });
    $(document).find("#tabs ul li:nth-child("+parseInt(tabNo+1)+").dropdown").addClass('active');
}

/**
 * @Function Name : disableWidget
 * @Description : disable to add the widget if not accessible by the logged in user
 * @param :
 * @returns :
 */

function disableWidget(obj, value) {
    obj.attr('value', value);
    obj.attr('disabled', 'disabled');
}

/**
 * @Function Name : isObjectEmpty
 * @Description : to check if the json object is empty or not
 * @param :      object
 * @returns :
 */

function isObjectEmpty(object) {
    var isEmpty = true;
    for (keys in object) {
        isEmpty = false;
        break; // exiting since we found that the object is not empty
    }
    return isEmpty;
}

/**
 * @Function Name : debouncer @Description : debouncing guarantees that the
 * function will only ever be executed a single time (given a specified
 * threshhold) @param : func, timeout @returns :
 */

function debouncer(func, timeout) {
    var timeoutID, timeout = timeout || 200;
    return function () {
        var scope = this,
            args = arguments;
        clearTimeout(timeoutID);
        timeoutID = setTimeout(function () {
            func.apply(scope, Array.prototype.slice.call(args));
        }, timeout);
    }
}
/**
 * @Function Name 	: resizeWindow
 * @Description 	: this function changes the height of widget scrollBody dynamically and paints the data again. The function
 * 					  is bind to window.resize event in ready function
 * @param 			:
 * @returns 		:
 */

function resizeWindow() {
    currentDashboard.element.find(".widget").each(function () {
        var nWidget = currentDashboard.getWidget($(this).attr("id"));
        if(nWidget.url.indexOf("vacation_summary")>0) 
        {
			nWidget.element.trigger("widgetRefresh", {
				widget: nWidget
			});
		}
    });
}


/** all defaults messages to be declared here which are used more than once*/
defaults = {
    deleteTabConfirmMessage: "Are you sure you want to delete this tab ?",
    errorMessageOnSavingState: "Unable to save the dashboard state. Please refresh the browser.",
    chartNotAccessibleMessage: "Chart is not accessible to you",
    tabTitleMessage1: "Please enter tab title",
    tabTitleMessage2: "Please enter another title ",
    dashboardSaveMessage: "Dashboard saved succesfully.",
    infoDialogTitle: "Info",
    warningDialogTitle: "Warning",
    loaderDiv: "loaderDiv",
    chart1: "avg_comp_time",
    chart2: "process_ins_status_summary",
    chart3: "avg_ws_res_time",
    chart4: "ins_status_summary",
    chart5: "usr_task_cnt",
    chart6: "task_summary",
    chart7: "vacation_summary",
    swf1:"MSColumn3D.swf",
    swf2:"StackedColumn3D.swf",
	swf3:"Column3D.swf",
	swf4:"Pie3D.swf",
	swf5:"Doughnut3D.swf",
	swf6:"MSColumn3DLineDY.swf",
	swf7:"Column2D.swf",
	swf8:"Pie2D.swf",
	swf9:"Doughnut2D.swf",
	swf10:"MSColumn2D.swf",
	swf11:"StackedColumn2D.swf"
    
}

