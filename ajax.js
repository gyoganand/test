/**
 * Copyright (C) 2005, Intalio Inc.
 *
 * The program(s) herein may be used and/or copied only with
 * the written permission of Intalio Inc. or in accordance with
 * the terms and conditions stipulated in the agreement/contract
 * under which the program(s) have been supplied.
 */
 
function sendAjaxCall(url,type,cache,async,dataType,data,errorCallBack,successCallback) {
$.ajax({
	url: url,
	type: type,
	cache: cache,
	async: async,
	dataType: dataType,
	data: data,
	beforeSend: function(xhr) {
	    
		xhr.setRequestHeader('ajax', 'true');
	},
	error: function (e) {
			errorCallBack(e);
	},
	success: function (data) {
			successCallback(data);
		}
	});
}

