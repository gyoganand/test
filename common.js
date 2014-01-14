/**
 * Copyright (C) 2005, Intalio Inc.
 *
 * The program(s) herein may be used and/or copied only with
 * the written permission of Intalio Inc. or in accordance with
 * the terms and conditions stipulated in the agreement/contract
 * under which the program(s) have been supplied.
 */
 
/** @Function Name : submitActionToURL 
 * @Description     :
 * @param           : url,actionName example : logout.htm , logout
 * @returns         :
 * */

function submitActionToURL(url, actionName) {
    formObj = document.getElementById('dashform');
    formObj.action = url;
    document.getElementById('actionName').value = actionName;
    formObj.submit();
}
/** function for fade in and fadeout of back to top button * */
$(function () {
    $(window).scroll(function () {
	    $('#scroll-up-btn').removeClass('hide');
        if ($(this).scrollTop() > 0) {
            $('#btn-scroll-up').fadeIn();
        } else {
            $('#btn-scroll-up').fadeOut();
        }
    });
});
function modalShow(elemId) {
    $('#' + elemId + '').modal({
        toggle: true,
        show: true
    });
}
function userSettings(){
    modalShow('profileSettings');
}
function errorCall(e) {
	bootbox.alert(defaults.errorInGettingJSONData+e);
	return false;
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
 * @Function Name   : getSelectedRows 
 * @Description     : This function returns the selected rows data
 * @param           : Datatable reference
 * @returns         : selected row data
 * */
function getSelectedRows(oTableLocal) {
    "use strict";
    var aReturn = new Array();
    if(oTableLocal!=undefined)	{
		var aTrs = oTableLocal.fnGetNodes();
		for (var i = 0; i < aTrs.length; i++) {
			 if ($(aTrs[i]).hasClass("row_selected")) {
				var col = oTableLocal.fnGetData(aTrs[i]);
					aReturn.push(col[1]);
				}
			}
	}
    return aReturn;
}
/* function to update Checkbox of header and sidebar */
function updateSettings(checked,value){
	if(parseInt(value)==1){
		if(!checked){
			$('#profileSettings').find('#ace-settings-sidebar').removeProp('checked'); /* sidebar unchecked when header unchecked */
		}
	}else {
		if(checked){
			$('#profileSettings').find('#ace-settings-header').prop('checked','checked') /* header checked when sidebar checked */
		}
	}
}
/* Applying user settings */
function user_settings(){
	if($('#profileSettings').find('#ace-settings-header').prop('checked')){
		$('body').addClass('navbar-fixed');						
		$('#navbar-top').addClass('navbar-fixed-top');
		if($('#profileSettings').find('#ace-settings-sidebar').prop('checked')){
			$('#sidebar').addClass('sidebar-fixed');
		} else {
			$('#sidebar').removeClass('sidebar-fixed');
		}
	} else {
		$('body').removeClass('navbar-fixed');	
		$('#navbar-top').removeClass('navbar-fixed-top');
		$('#sidebar').removeClass('sidebar-fixed');	
	}
}
/* This function changes the opacity of element and adds loading gif icon */
function addLoading(elm){
	$(elm).find('table').addClass('shadow');
	$(elm).prepend('<div id="loading"><i class="icon-spinner icon-spin icon-2x orange"></i></div>')
	$('#loading').css('margin-left',($('.page-content').width())/2);
	$('#loading').css('margin-top',($('table').height() + 30)/2);
}
/* This function removes opacity and loading gif icon */
function removeLoading(elm){
	$(elm).find('.shadow').removeClass('shadow');
	$(elm).find('#loading').remove();
}
