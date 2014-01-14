/**
 * Copyright (C) 2005, Intalio Inc.
 *
 * The program(s) herein may be used and/or copied only with
 * the written permission of Intalio Inc. or in accordance with
 * the terms and conditions stipulated in the agreement/contract
 * under which the program(s) have been supplied.
 */

var PREFIX = "../social/comments/";
var SUFIX = ".json";
var SEPERATOR = "/";
var SAVE = "save";
var LIST = "list";
var COUNT = "count";
var DELETE = "delete";
var USER = SEPERATOR + "user";
var DATE = SEPERATOR + "date";
var AFTER_DATE = SEPERATOR + "afterDate";
var AFTER_ID = SEPERATOR + "afterId";

var def_data = {
    moduleId: undefined,
    threadId: undefined,
    orderCol: undefined, 
    orderAsc: true,
    start: 0, 
    max: 5,
    user:undefined,
    date:undefined,
    commentId:undefined,
    isAfter:undefined,
	type:333
    
}

function saveComments(divobj){
  var container = $('#'+$(divobj).attr("parentid"));
  var type = container.find("#newmoduleid").val();
  var id = container.find("#newthreadid").val();
  var user = $('body').find("#user_info").text();
  var comments = container.find("#newcomment").val();
  if(comments == ''){
    container.find("#errorid").removeClass("hide").css('display', 'block');
    return false;
  }

  addComment(container, type, id, user, comments);
}

//function to add comment
function addComment(container, type, id, user, comment) {
    var data = {
        refCommentTypeId: type,
        threadId: id,
	createdBy: user,
        comment: comment
    }
    var url = formURL(SAVE,data);
    //alert(url);
    sendAjaxCall(url, "POST", false, true, "html", data, errorCall, function(data1){
    addCommentSuccess(container, data1, type, id);
  });
}

//Success Function for getCommentsCount
function addCommentSuccess(container, data, type, id) {
	//nothing to do.
  //openModalWindow();
  container.find("#messageid").removeClass("hide").css('display', 'block');
  $('#'+container.attr('id')).find('.accordion-inner').empty();
  $('#'+container.attr('id')).find('span#successMsg').removeClass('hide');
  $('#'+container.attr('id')).find('.accordion-inner').append(showCommentsHtml(type,container.attr('id')).show());
  container.find('.active').removeClass('active');
  container.find('#listComments'+container.attr('id')).addClass('active');
  container.find('a[href = "#listComments'+container.attr('id')+'"]').parent().addClass('active');
  $('#'+container.attr('id')).find('#successMsg').removeClass('hide');
  setTimeout(function () {
        $('#'+container.attr('id')).find('#successMsg').addClass('hide');
    }, 4000);
}

function listComments(divobj,type, id,start){
	$(divobj).attr('endingComment',parseInt(start)+parseInt(def_data.max));
    var data = {
        moduleId: type,
        threadId: id,
		start:start,
		max:def_data.max
    }
  var url = formURL(LIST,data);
  get(url, data, function(data1){
				  getCommentsSuccess(divobj, data1,start);
				}
  );
}

//Success Function for getComments
function getCommentsSuccess(container, data,start) {
  //var comments = $(".comments");
  //comments.empty();
  var templet = container.find("#itemtempletid:first-child");
  if( start ==0 ){
    container.find(".commentsScroll").empty();
	}
	container.find("#loadMoreComments").remove();
	container.find(".commentsScroll").attr('id',container.attr('id')+'scroll');
	//$(templet).removeAttr('id');
	if (data.comments.length == 0 && start==0){
		container.find(".commentsScroll").append('<div class="text-error">No comments found.</div>');
	} else{
		$.each(data.comments, function(i, item) {    
			var itemdiv  =$(templet).clone();
			itemdiv.find( "#name" ).text(item.createdBy);
			itemdiv.find( "#time" ).text(timeDifference(new Date(), new Date(item.createdDate)));
			itemdiv.find( "#comment" ).text(item.comment);
			container.find(".commentsScroll").append(itemdiv);
		});
	}
 
	 if (data.comments.length == def_data.max ){
			container.find(".commentsScroll").append($('#loadMoreComments').clone());
		} 
  if($('#'+container.attr('id')+'scroll').height()>250){
  $('#'+container.attr('id')+'scroll').slimScroll({
					height: '250px'
			});
		}
}

function loadMoreComments(obj){
	listComments($(obj).parent().parent().parent().parent(),def_data.type, $(obj).closest('.in').attr('id'),$(obj).parent().parent().parent().parent().attr('endingComment'));
}

//function to get comments count
function getCommentsCount(elementId,type, id, user, date, commentId, isAfter) {
    var data = {
        moduleId: type,
        threadId: id,
	user:user,
	date:date,
	commentId:commentId
    }
    var url = formURL(COUNT,data);
    get(url, data, function(data1){
			      commentsCountSuccess(elementId, data1);
			  });
}

//Success Function for getCommentsCount
function commentsCountSuccess(elementId, data) {
	elementId.find("span").html(data.total);
}

//function to handle ajax error
function errorCall(e) {
	bootbox.alert('Error occured in getting comment json data'+e);
	return false;
}

//function to form url for ajax call
function formURL(command, data) {
    var url = command;
    if(data.user != undefined && data.user != null){
      url += USER;
    }else if(data.date != undefined && data.date != null && data.isAfter != undefined && data.isAfter){
      url += AFTER_DATE;
    }else if(data.date != undefined && data.date != null){
      url += DATE;
    }else if(data.commentId != undefined && data.commentId != null && data.isAfter != undefined && data.isAfter){
      url += AFTER_ID;
    }
    return PREFIX+url+SUFIX;
}

//ajax call
function send(url,type,data,successCallback) {
	sendAjaxCall(url, type, false, true, "json", data, errorCall, successCallback);
}

//get ajax call
function get(url, data, successCallback) {
  send(url,"GET", data, successCallback);
}

//post ajax call
function post(url, data, successCallback) {
  send(url,"POST", data, successCallback);
}

function timeDifference(current, previous) {

    var msPerSeconds = 30 * 1000;
    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsed = current - previous;

    if (elapsed < msPerSeconds) {
         return 'Just now';   
    }
    
    else if (elapsed < msPerMinute) {
         return Math.round(elapsed/1000) + ' secs';   
    }

    else if (elapsed < msPerHour) {
         return Math.round(elapsed/msPerMinute) + ' mins';   
    }

    else if (elapsed < msPerDay ) {
         return Math.round(elapsed/msPerHour ) + ' hrs';   
    }

    else if (elapsed < msPerMonth) {
        return Math.round(elapsed/msPerDay) + ' days';   
    }

    else if (elapsed < msPerYear) {
        return Math.round(elapsed/msPerMonth) + ' months';   
    }

    else {
        return Math.round(elapsed/msPerYear ) + ' years';   
    }
}

function showCommentsHtml(typeid,id){
	var commentsHtml = $('#commentsContainerId').clone();
	commentsHtml.removeClass('hide');
	commentsHtml.find("#listCommentsHead").attr("parentid",id);
	commentsHtml.find("#savebutton").attr("parentid",id);
	commentsHtml.find("#addCommentHead").attr("href", "#addComment"+id);
	commentsHtml.find("#listCommentsHead").attr("href", "#listComments"+id);
	commentsHtml.find("#listComments").attr("id", "listComments"+id);
	commentsHtml.find("#addComment").attr("id", "addComment"+id);
	commentsHtml.find("#newthreadid").val(id);
	var countcontainer = commentsHtml.find("#listCommentsHead");
	var commentscontainer = commentsHtml.find("#listComments"+id);
	getCommentsCount(countcontainer,typeid, id);
	listComments(commentscontainer,typeid, id,0);
	return commentsHtml;
}