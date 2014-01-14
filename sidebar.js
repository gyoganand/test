/**
 * Copyright (C) 2005, Intalio Inc.
 *
 * The program(s) herein may be used and/or copied only with
 * the written permission of Intalio Inc. or in accordance with
 * the terms and conditions stipulated in the agreement/contract
 * under which the program(s) have been supplied.
 */
	var responseData;
	var userCache;  

	$(document).ready(function () {
	var data = {
		action : "getModuleAccess"
	}
	$.ajax({
            url: "moduleAccess.json",
            cache: false,
            async: true,
            data:data,
            dataType: 'json',
            error: function (e) {
                bootbox.alert("<h5>Error Occured while getting modules access</h5>");
            },
            success: function (data) {
				responseData = data;
				updateDOM(data);
				displayHtmlOnModuleResponse(data);
            }
        });
		

    $(document).on('click', '#ace-settings-header', function () {
		
		if(responseData.currentUser!=undefined)
			userCache = $.jStorage.get(responseData.currentUser);
		
		if(this.checked && userCache!=undefined && userCache!=null)
			userCache.navBarFixed = true;
		else if(this.checked)
			userCache = new UserCache(false,false,true,"");
		else
			userCache = new UserCache(false,false,false,"");
		if(responseData.currentUser!=undefined)
		$.jStorage.set(responseData.currentUser, userCache);
		
	});
	
	$(document).on('click', '#ace-settings-sidebar', function () {
		
		if(responseData.currentUser!=undefined)
			userCache = $.jStorage.get(responseData.currentUser);
		
		if(this.checked && userCache!=undefined && userCache!=null)
			userCache.sidebarFixed = true;
		else if(this.checked)
			userCache = new UserCache(true,false,false,"");
		else
			userCache = new UserCache(false,false,false,"");
			
		if(responseData.currentUser!=undefined)
		$.jStorage.set(responseData.currentUser, userCache);

	});
	
	$(document).on('click', '#sidebar-collapse', function () {
		
		if(responseData.currentUser!=undefined)
			userCache = $.jStorage.get(responseData.currentUser);
		
		if($('body').find('#sidebar').hasClass('menu-min') && userCache!=undefined && userCache!=null)
			userCache.sidebarCollapsed = true;
		else if($('body').find('#sidebar').hasClass('menu-min'))
			userCache = new UserCache(false,true,false,"");
		else
			userCache = new UserCache(false,false,false,"");
		if(responseData.currentUser!=undefined)
		$.jStorage.set(responseData.currentUser, userCache);

	});
	
});

function updateDOM(data)
{
	if(data.currentUser!=undefined)
		userCache = $.jStorage.get(data.currentUser);

	if(userCache!=null && userCache!=undefined)
		{
			if(userCache.navBarFixed)
				{
					$('body').find('#ace-settings-header').prop('checked', true);
					$('body').addClass('navbar-fixed');
					$('body').find('#navbarHeader').addClass('navbar-fixed navbar-fixed-top');
				}
			if(userCache.sidebarFixed)
				{
					$('#ace-settings-sidebar').prop('checked', true);
					$('body').find('#sidebar').addClass('fixed');
				}
			if(userCache.sidebarCollapsed) 
					$('body').find('#sidebar').addClass('menu-min');
			if(userCache.lastPageOpened.length>0) 
				{
					var k=4
					for(var j=userCache.lastPageOpened.length;j>=1;j--)
						{
							
							if(userCache.lastPageOpened[j-1].split('~').length>0)
							{
								var lastPageArray = userCache.lastPageOpened[j-1].split('~');
								if(lastPageArray.length>0)
								{
									$('#btnShortcut'+k+' i').removeAttr("class").addClass(lastPageArray[1]);
									$('#btnShortcut'+k+'').removeAttr("onclick").attr("onclick",lastPageArray[2]);
									k--;
								}
							}
						}
				}
		}
}

function displayHtmlOnModuleResponse(data)
{
	if (data.currentUser == undefined || data.currentUser == null || $.trim(data.currentUser) == '')
                submitActionToURL('login.htm', 'logOut');
	else
	{
		$('body').find("#user_info").text(data.currentUserName);
		
		if ( data.moduleAccessList!=undefined) {
			$.each(data.moduleAccessList, function(key,obj){
				$.each(obj, function(idx, object){
				   if (object.moduleName != undefined) {
				       if (object.parent == undefined) {
				           var moduleName = object.moduleName.replace(/\ /g, "_");
				           if (moduleName == "bam" && data.bamAccess == "true")
				               $('body').find('#sidebar ul li#' + moduleName).css('display', 'block');
				           else if (moduleName != "bam") {
				               $('body').find('#sidebar ul li#' + moduleName).css('display', 'block');
				           }
				       } else {
				           var moduleName = object.moduleName.replace(/\ /g, "_");
				           var parentName = object.parent.replace(/\ /g, "_");
				           $('body').find('li#' + parentName + '  li#' + moduleName).css('display', 'block');
				       }
				   }
				});
			});
		}
	}

	//to open the first loaded page which ever user has access
/*
 var firstId;
 $('#sidebar li').each( function(idx, object){
  if (object.style.display == 'block'){
   if ($('#'+object.id).has('ul').length){
   return true;
   }
   else {
   firstId = object.id;
   return false;
   }
  }
 });
 $('body').find("#"+firstId+" a").click();
 window.location.href=$('body').find("#"+firstId+" a").attr('href');  */

 /* for removing un necessary list items in sidebar */

 $('#sidebar li').each(function(key,obj){
   if($(this).css('display') == 'none'){
    if ($(this).attr('id') !='processes'){
   $('#'+$(this).attr('id')).remove();
   }
   else{
	$('#'+$(this).parent().parent().attr("id")+' li#'+$(this).attr('id')).remove();
   }
   }
 });
 
/* //for counting total childs of submenus & create html to display count of submenu near parent tag.
 $('#sidebar ul li ul.submenu').each(function(key,obj){
   var totalSubCount  = $(this).children().filter(function() {
        return $(this).css('display') !== 'none';
        }).length;
   var CountHtml = "<span class='badge badge-primary'>"+totalSubCount+"</span> ";
   $(this).parent().children(':first-child').children(':nth-child(2)').append(CountHtml);
 });*/
}

function selectMenuAndChangepage(curObj, menuId, url) {
	if($(curObj).parent().attr('id')!="sidebar-shortcuts-large")
	{
		var iconObject = "";
		var iconEvent;
		$('#sidebar ul li').removeClass('active');
		if ($(curObj).parent().parent().hasClass('submenu')) 
		{
			$(curObj).parent().parent().parent().addClass('active');
			if($(curObj).parent().parent().parent().parent().hasClass('submenu'))
				$(curObj).parent().parent().parent().parent().parent().addClass('active');
			$(curObj).parent().parent().parent().addClass('active');
			$(curObj).closest("li").addClass('active');
			iconObject = $(curObj).parent().parent().parent().children(':first-child').children(':first-child').attr('class');
			iconEvent = $(curObj).parent().parent().parent().children(':first-child').attr('onclick');
		}
		else 
		{
			$('#sidebar ul li').removeClass('open');
			$('.submenu').css('display', 'none');
			$(curObj).closest("li").addClass('active');
			iconObject = $(curObj).parent().children(':first-child').children(':first-child').attr('class');
			iconEvent = $(curObj).parent().children(':first-child').attr('onclick');
		}
		$("#menu-toggler").removeClass('display');
		$("#sidebar").removeClass('display');
		
		if(responseData.currentUser!=undefined)
			userCache = $.jStorage.get(responseData.currentUser);
		
		var id = $(curObj).parent()[0].attributes[0].nodeValue;
		
		var lastPageOpened = new Array();
		
		if(userCache!=undefined && userCache!=null && id!=null && id!=undefined)
		{
			var lastPageOpened = userCache.lastPageOpened;
			if(lastPageOpened!=null && lastPageOpened!=undefined && lastPageOpened.length < 4 && parseInt($.inArray(id+"~"+iconObject+"~"+iconEvent,lastPageOpened))==-1)
				userCache.lastPageOpened[userCache.lastPageOpened.length] = id+"~"+iconObject+"~"+iconEvent;
			
			else if(parseInt($.inArray(id+"~"+iconObject+"~"+iconEvent,lastPageOpened))==-1 && lastPageOpened.lenght < 4) 
			{
				lastPageOpened[lastPageOpened.length] = id+"~"+iconObject+"~"+iconEvent;
				userCache = new UserCache(false,false,false,lastPageOpened);
			}
		}

		else if(id!=null && id!=undefined) 
		{   
			lastPageOpened[lastPageOpened.length] = id+"~"+iconObject+"~"+iconEvent;
			userCache = new UserCache(false,false,false,lastPageOpened);
		}
		if(responseData.currentUser!=undefined)
		$.jStorage.set(responseData.currentUser, userCache);
		updateBtns(iconObject,iconEvent);
	}
		changePage(menuId,url);		
		return false;
	}

function changePage(id,url)
{
		$("#main-content").load(url);
}

function updateBtns(iconClass,iconEvent)
{
	var btn1ClassName    = $('#btnShortcut1 i').attr("class");
	var btn2ClassName    = $('#btnShortcut2 i').attr("class");
	var btn3ClassName    = $('#btnShortcut3 i').attr("class");
	var btn4ClassName    = $('#btnShortcut4 i').attr("class");
	
	var btn1Event = $('#btnShortcut1').attr("onclick");
	var btn2Event = $('#btnShortcut2').attr("onclick");
	var btn3Event = $('#btnShortcut3').attr("onclick");
	var btn4Event = $('#btnShortcut4').attr("onclick");
	
	$('#btnShortcut4 i').removeAttr("class").addClass(iconClass);
	$('#btnShortcut3 i').removeAttr("class").addClass(btn4ClassName);
	$('#btnShortcut2 i').removeAttr("class").addClass(btn3ClassName);
	$('#btnShortcut1 i').removeAttr("class").addClass(btn2ClassName);
	
	$('#btnShortcut4').removeAttr("onclick").attr("onclick",iconEvent);
	$('#btnShortcut3').removeAttr("onclick").attr('onclick',btn4Event);
	$('#btnShortcut2').removeAttr("onclick").attr('onclick',btn3Event);
	$('#btnShortcut1').removeAttr("onclick").attr('onclick',btn2Event);
}
