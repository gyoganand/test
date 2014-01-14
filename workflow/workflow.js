/**
 * Copyright (C) 2005, Intalio Inc.
 *
 * The program(s) herein may be used and/or copied only with
 * the written permission of Intalio Inc. or in accordance with
 * the terms and conditions stipulated in the agreement/contract
 * under which the program(s) have been supplied.
 */

var taskIconSet=[];
var notiIconSet=[];
var tmsService;
var tmpService;
var useToolBarIcon;
var participantToken;
var currentUser;
var taskTable;
var processTable;
var notificationTable;
var tempTable;
var updateFlag = false;
var currentTab;
var formURL;
var tableWidth;
var updateTaskData;
var processTasks;
var width = 2000;
var height = $(window).height()*0.8;
var speed = 500;
var proxy = '/scripts/plugin/workflow/proxy.jsp';
var userArray;
var taskOptions = 
{
	"bPaginate": true,
	"bStateSave": true,
	"bInfo": true,
	"bFilter": true,
	"bRetrieve":true,
	"oLanguage": { "sSearch": "" }, 
	"bAutoWidth": false,
	"aaSorting": [[ 0, "desc" ]],
	"aoColumns":[ 
		{"bSortable": false, "sWidth": width*0.025, "sClass": "center"},
		{"bSortable": true, "sClass": "alignLeft","sWidth": width*0.30},
		{"bSortable": false, "sWidth": width*0.025, "sClass": "center"},
		{"bSortable": true, "sClass": "alignLeft","sWidth": width*0.15},
		{"bSortable": true, "sClass": "alignLeft","sWidth": width*0.15},
		{"bSortable": true, "sClass": "alignLeft","sWidth": width*0.07,"iDataSort": 6},
		{"bVisible" : false,"bSearchable":false,"sWidth": width*0.03,"sType": "numeric"},
		{"bSortable": true, "sClass": "alignLeft","sWidth":width*0.15},
		{"bSortable": true, "sClass": "alignLeft","sWidth":width*0.15},
		{"bSortable": false, "sClass": "center"}]
}
var processesOptions = 
{
	"bPaginate": true,
	"bStateSave": true,
	"bInfo": true,
	"bFilter": true,
	"oLanguage": { "sSearch": "" },
	"bRetrieve":true,
	"bAutoWidth": false,
	"aaSorting": [[ 0, "desc" ]],
	"aoColumns":[ 
				{"bSortable": false, "sWidth": width*0.025, "sClass": "center"},
				{"bSortable": true, "sClass": "alignLeft","sWidth": width*0.3},
				{"bSortable": true, "sClass": "alignLeft","sWidth": width*0.13},
				{"bSortable": true, "sClass": "alignLeft","sWidth": width*0.13},
				{"bSortable": true, "sClass": "alignLeft","sWidth": width*0.13},
				{"bSortable": false, "sClass": "center","sWidth": width*0.13}]
}
var notificationOptions = 
{
	"bPaginate": true,
	"bStateSave": true,
	"bInfo": true,
	"bFilter": true,
	"oLanguage": { "sSearch": "" },
	"bRetrieve":true,
	"bAutoWidth": false,
	"aaSorting": [[ 0, "desc" ]],
	"aoColumns": [ 
		{"bSortable": false, "sWidth": width*0.025,"sClass": "center"},
		{"bSortable": true, "sClass": "alignLeft", "sWidth": width*0.3},
		{"bSortable": true, "sWidth": width*0.10,"sClass": "center","iDataSort": 3},
		{"bVisible" : false,"bSearchable":false,"sWidth": width*0.03,"sType": "numeric"},
		{"bSortable": true, "sWidth": width*0.13,"sClass": "alignLeft"},
		{"bSortable": true, "sWidth": width*0.15,"sClass": "alignLeft"},
		{"bSortable": true, "sWidth": width*0.15,"sClass": "alignLeft"}]
}
var taskData = 
{
	page:"1",
	qtype:"_description",
	query:"",
	rp:"40",
	sortname:"undefined",
	sortorder:"undefined",
	updateData:"true",
	type : "PATask",
	taskType : "PATask"
}
var processesData = 
{
	page:"1",
	qtype:"_description",
	query:"",
	rp:"40",
	sortname:"undefined",
	sortorder:"undefined",
	updateData:"true",
	type:"PIPATask"
}
var notificationData = 
{
	page:"1",
	qtype:"_description",
	query:"",
	rp:"40",
	sortname:"undefined",
	sortorder:"undefined",
	type:"Notification",
	updateData:"true"
}

function getTasksData()
{
	addLoading($('#workflow_tasks_wrapper'));
	delete taskData.formURL;
	$('#breadcrumbName').addClass('hide');
	sendAjaxCall("../ui-fw/updates.htm", "POST", false, true, "json",taskData, handleAjaxError, updateTasksData);
	setTimeout(function () {
		removeLoading($('#workflow_tasks_wrapper'));
	}, parseInt(Math.random() * 1000 + 1000));
}

function getProcessesData()
{
	addLoading($('#workflow_processes_wrapper'));
	sendAjaxCall("../ui-fw/updates.htm", "POST", false, true, "json",processesData, handleAjaxError,updateProcessesData);
	setTimeout(function () {
		removeLoading($('#workflow_processes_wrapper'));
	}, parseInt(Math.random() * 1000 + 1000));
}
function getNotificationData()
{
	addLoading($('#workflow_notifications_wrapper'));
	sendAjaxCall("../ui-fw/updates.htm", "POST", false, true, "json",notificationData, handleAjaxError,updateNotifData);
	setTimeout(function () {
		removeLoading($('#workflow_notifications_wrapper'));
	}, parseInt(Math.random() * 1000 + 1000));
}
function updateCustomColumn(data)
{
	participantToken = data.participantToken;
	currentUser      = data.currentUser;
	useToolBarIcon = data.toolbarIcons;
	tmsService = data.tmsService;
	tmpService = data.tmpEndPoint;
	$.each(data.taskIconSet, function(key,value){
		taskIconSet[key] = value;
	});
	taskOptions.aoColumns= taskOptions.aoColumns.slice(0,10);
	if(data.newColumnList.length==0)
		tableWidth = '100%'
	else {
		tableWidth = $(window).width()-224;	
		$.each(data.newColumnList, function(key,obj){
			$("#rowTaskHeader").append("<th>"+obj+"</th>");
			taskOptions.aoColumns[taskOptions.aoColumns.length] = {"bSortable": true,"sClass": "center","swidth":width*0.15};
			tableWidth = tableWidth + 150;
		});
	}
	
	taskTable = $('#workflow_tasks').dataTable(taskOptions);
	$('#workflow_tasks_length').remove();
	if(useToolBarIcon==true || useToolBarIcon=="true") {
		for(var i = 0; i < taskIconSet.length; i++){
			if(taskIconSet[i]!=null && taskIconSet[i]!=undefined){
				var taskButton = getToolbarIconsCodes(taskIconSet[i]);
				$('#workflow_tasks_wrapper .row .col-sm-6:first').append(taskButton);
			}
		}
	}
	customTable('workflow_tasks');
	updateData(data,taskTable);
	processTasks = false;
}
function customTable(tableId){
	$('#'+tableId).css('width',tableWidth);
	$('#'+tableId+'_wrapper .row .col-sm-6:first').removeClass('col-sm-6').addClass("col-sm-8 tableButtons");
	$('#'+tableId+'_wrapper .row .col-sm-6:first').removeClass('col-sm-6').addClass("col-sm-0 searchBoxTasks");
	$('#'+tableId+'_wrapper .row:first').css("background-color","#FFFFFF");
	$('#'+tableId+'_wrapper .row:last').css("background-color","#FFFFFF").css("border-bottom",0);
	$('#'+tableId+'_wrapper .row:first').css("padding","0");
	$('#'+tableId+'_wrapper .row:first').css("padding-bottom","8px");
	$('#'+tableId+'_wrapper .row:last .col-sm-6:first').addClass('rows_info');
	$('#'+tableId+'_wrapper .row:last .col-sm-6:last').addClass('table_pagination');
	$('#'+tableId+'_filter').find('input').attr('placeholder','Search..');
	$('#'+tableId+'_filter').append(getToolbarIconsCodes("viewAllTask"));
	$('.sorting_disabled').css('color','#707070');
}
/*
Populate the html select box with roles coming from the server 
*/
function populateRoles(data) 
{
	$("#fetchedRolesCombo").empty();
	$("#fetchedRolesCombo").removeAttr("class");
	$("#fetchedRolesCombo_chzn").remove();
	
	$("#fetchedUsersCombo").empty();
	$("#fetchedUsersCombo").removeAttr("class");
	$("#fetchedUsersCombo_chzn").remove();
	
	if(data.role instanceof Array) {
		$.each(data.role,function(key,obj) {
			$("#fetchedRolesCombo").append("<option value="+obj+">"+obj+"</option>");
				if(parseInt(key)==parseInt(data.role.length-1))
					executeRbacAction("getAssignedUsers",populateUsers,obj,true);
				else
					executeRbacAction("getAssignedUsers",populateUsers,obj,false);
			});
		}
	else {
			$("#fetchedRolesCombo").append("<option value="+data.role+">"+data.role+"</option>");
			executeRbacAction("getAssignedUsers",populateUsers,data.role,true);
		}
	
	$("#fetchedRolesCombo").chosen();
	$("#fetchedRolesCombo_chzn").css("width",240);
	modalShow('reassignTaskModal');
}
 
$('#fetchedRolesCombo').change(function() {
	//$('#fetchedUsersCombo_chzn ul li.search-choice').remove();
});

$('#fetchedUsersCombo').change(function() {
	//$('#fetchedRolesCombo_chzn ul li.search-choice').remove();
});


function updateTask(obj,bol) {	
	if(bol==false) 
	{
		updateTaskData = $(obj).closest('tr').find('.task_name');
		var vall=$(obj).closest('tr').find('.priority').attr('value');		
		if(vall>=parseInt(51))													/* priority checkbox checked according to the task priority */
			$('#priority_form').find('input:eq(0)').prop('checked','checked');
		else if(parseInt(vall)>=parseInt(31) && parseInt(vall)<=parseInt(50))
			$('#priority_form').find('input:eq(1)').prop('checked','checked');
		else if(parseInt(vall)>=parseInt(11) && parseInt(vall)<=parseInt(30))
			$('#priority_form').find('input:eq(2)').prop('checked','checked');
		else if(parseInt(vall)<=parseInt(10))
			$('#priority_form').find('input:eq(3)').prop('checked','checked');
		$("#updateDescription").val("");
		$("#updateDescription").val($(updateTaskData).text());
		modalShow('updateTaskModal');
	}
	else {
			executeAction("update",$(updateTaskData).attr('tid'),"",true);
	}
}

function reassignTask(bol) {
	 userArray =  new Array();
	 var columnsData = getSelectedRows(tempTable);
	 if(columnsData.length<=0)
		bootbox.alert("Please select at least one task");
	 else if(bol==false && columnsData.length>0)
	 {
		executeRbacAction("getAssignedRoles",populateRoles,"",true);
	 }
	 else if(bol && $("#fetchedRolesCombo").val()==null && $("#fetchedUsersCombo").val()==null) {
		reassignError();
	 }
	 else if(columnsData.length>0 && bol && $("#fetchedRolesCombo").val()!="" || $("#fetchedUsersCombo").val()!="") {
		  $.each(columnsData, function(key,obj){
			   if($(obj).attr('tid')!=undefined && $(obj).attr('tid')!=null && parseInt(columnsData.length-1)==parseInt(key))
					executeAction("reassign",$(obj).attr('tid'),"",true);
			   else if($(obj).attr('tid')!=undefined && $(obj).attr('tid')!=null)
					executeAction("reassign",$(obj).attr('tid'),"",false);
		  });
	 }
}

function deleteTask(bol) {
	var columnsData = getSelectedRows(tempTable);
	if(columnsData.length<=0)
		bootbox.alert("Please select at least one task");
	else if(bol=="false" || bol==false) {
		if(currentTab == "tasks") {
			$("#deleteTasks .modal_heading").text("Delete Task(s)");
			$("#deleteTasks .modal-body p").text("Are you sure you want to delete "+columnsData.length + " task(s) ?");
			$("#deleteTasks .modal-footer btn-danger").attr("onclick","javascript:deleteTask(true)");
		}
		else if(currentTab == "notifications")
		{
			$("#deleteTasks .modal_heading").text("Delete Notification(s)");
			$("#deleteTasks .modal-body p").text("Are you sure you want to delete "+columnsData.length + " notification(s) ?");
		}
		else if(currentTab == "processes")
		{
			$("#deleteTasks .modal_heading").text("Delete Processes");
			$("#deleteTasks .modal-body p").text("Are you sure you want to delete "+columnsData.length + " processes ?");
		}
		modalShow("deleteTasks");
	}
	else if(bol) {
		$.each(columnsData, function(key,obj){
			if($(obj).attr('tid')!=undefined && $(obj).attr('tid')!=null && parseInt(columnsData.length-1)==parseInt(key))
				executeAction("delete",$(obj).attr('tid'),"",true);
			else if($(obj).attr('tid')!=undefined && $(obj).attr('tid')!=null)
				executeAction("delete",$(obj).attr('tid'),"",false);
		});
	}
}
function claimORRevokeTask() {
	var count = 0;
	var flag = false;
	var keyCount = 0;
	var trueLength = 0;
	var columnsData = getSelectedRows(tempTable);
	if(columnsData.length<=0)
		bootbox.alert("Please select at least one task");
	else 
	{
		$.each(columnsData, function(key,obj){
			if($(obj).attr('istaskowner')=="true")
				trueLength++;
			else
				count=count+1;
		});
		$.each(columnsData, function(key,obj){
			if($(obj).attr('istaskowner')=="true") 
			{
				keyCount++;
				if(parseInt(trueLength)==parseInt(keyCount))
					flag = true;
				if($(obj).attr('tid')!=undefined && $(obj).attr('tid')!=null)
					executeAction("claim/revoke",$(obj).attr('tid'),$(obj).attr('state'),flag);
			}
		});
		if (count!=0){
			var errorMessage="<fmt:message key='org_intalio_uifw_toolbar_button_claim_error'/>";
			bootbox.alert(errorMessage.replace("{0}", count));
		}
		setTimeout(function () {
			removeLoading($('#workflow_tasks_wrapper'));
		}, parseInt(Math.random() * 1000 + 1000));
	}
}

function skipTask(bol)
{	
	var count= 0;
	var flag = false;
	var keyCount = 0;
	var trueLength = 0;
	var columnsData = getSelectedRows(tempTable);
	if(columnsData.length<=0)
		bootbox.alert("Please select at least one task");
	else {
		if(bol=="false" || bol==false) {
			$("#deleteTasks .modal_heading").text("Skip Task(s)");
			$("#deleteTasks .modal-body p").text("Are you sure you want to skip "+columnsData.length + " task(s) ?");
			$("#deleteTasks .modal-footer .btn-danger").attr("onclick","javascript:skipTask(true)");
			modalShow("deleteTasks");
		}
		else if(bol)
		{
			$.each(columnsData, function(key,obj){
				if($(obj).attr('istaskowner')=="true")
					trueLength++;
				else
					count=count+1;
			});
			$.each(columnsData, function(key,obj){
				if($(obj).attr('istaskowner')=="true") 
				{
					keyCount++;
					if(parseInt(trueLength)==parseInt(keyCount))
						flag = true;
					if($(obj).attr('tid')!=undefined && $(obj).attr('tid')!=null)
						executeAction("skipTask",$(obj).attr('tid'),"",flag);
				}
			});
			if (count!=0){
				var errorMessage="<fmt:message key='org_intalio_uifw_toolbar_button_skip_error'/>";
				bootbox.alert(errorMessage.replace("{0}", count));
			}
		}
	}
}

function exportTask(type)
{
	var format = type;
	var type = 'PATask';
	var export_url = "ui-fw/"+format+"?";
	export_url += "type="+type;
	var rp = 40;
	var page = 1;
	export_url += "&rp="+rp+"&page="+page;   
	window.open(export_url,"_new");
}
function viewAllTasks()
{
	if(currentTab == "tasks"){
		addLoading($('#workflow_tasks_wrapper'));
		delete taskData.formURL;
		sendAjaxCall("../ui-fw/updates.htm", "POST", false, true, "json",taskData, handleAjaxError, updateTasksData);
		$('#breadcrumbName').addClass('hide');
		setTimeout(function () {
			removeLoading($('#workflow_tasks_wrapper'));
		}, parseInt(Math.random() * 1000 + 1000));
	}
	else if(currentTab == "notifications"){
		addLoading($('#workflow_notifications_wrapper'));
		sendAjaxCall("../ui-fw/updates.htm", "POST", false, true, "json",notificationData, handleAjaxError,updateNotifData);
		setTimeout(function () {
			removeLoading($('#workflow_notifications_wrapper'));
		}, parseInt(Math.random() * 1000 + 1000));
	}
	else if(currentTab == "processes"){
		addLoading($('#workflow_processes_wrapper'));
		sendAjaxCall("../ui-fw/updates.htm", "POST", false, true, "json",processesData, handleAjaxError,updateProcessesData);
		setTimeout(function () {
			removeLoading($('#workflow_processes_wrapper'));
		}, parseInt(Math.random() * 1000 + 1000));
	}
}

function updateTasksData(data)
{
	$("#taskTableDiv").removeClass("hide");
	$("#taskform").contents().find("body").html('');
	$("#rowProcessesHeader th:gt(8)").remove();
	taskTable.fnClearTable();
	$.each(data.newColumnList, function(key,obj){
		$("#rowProcessesHeader").append("<th>"+obj+"</th>");
		taskOptions.aoColumns[taskOptions.aoColumns.length] = {"bSortable": true,"sWidth": width*0.12}
	});
	taskTable = $("#workflow_tasks").dataTable(taskOptions);
	updateData(data,taskTable);
}

function handleAjaxError(exception) {
return false;
}



function isTaskOwnerCheck(data,obj)
{
	var isTaskOwner   = true; 
	var showAnchorTag = true;
	if(data.isWorkflowAdmin)
	{
		$.each(data.userRoles,function(key,value){
			if($.inArray(value,obj.task.roleOwners)>=0)
				showAnchorTag = false;
		});
		if(showAnchorTag && $.inArray(currentUser,obj.task.userOwners)==-1)
			isTaskOwner = false;
	}
	return isTaskOwner;
}
function showAlert()
{
	bootbox.alert('<fmt:message key="com_intalio_bpms_workflow_admin_tasks_retrieve_error"/>');
	return false;
}
function updateData(data,taskTable)
{
	currentTab = "tasks";
	var oSettings = taskTable.fnSettings();
    taskTable.fnClearTable();
	var check=1;
    if (data.tasks!=undefined && data.tasks.length>0) {
	$.each(data.tasks,function(key,obj){
		var items = [];
		var html = "";
		var isTaskOwner =  isTaskOwnerCheck(data,obj);
		items[items.length] = "<input type='checkbox' class='ace taskSelected' id='taskSelected'> <span class='lbl'></span>";
		
		if(obj.task.description!="" && obj.task.description!=null) {
			if(isTaskOwner)
				items[items.length] = "<a class='task_name' href="+obj.formManagerURL+" istaskowner="+isTaskOwner+" description="+obj.task.description+" priority="+obj.task.priority+" target='taskform' tid="+obj.task.iD+" state="+obj.task.state.stateName+">"+obj.task.description+"</a>";
			else
				items[items.length] = "<a class='task_name' onclick=javascript:showAlert(); istaskowner="+isTaskOwner+" description="+obj.task.description+" priority="+obj.task.priority+" target='taskform' tid="+obj.task.iD+" state="+obj.task.state.stateName+">"+obj.task.description+"</a>";
		}
		else {
			if(isTaskOwner)
				items[items.length] = "<a class='task_name' href="+obj.formManagerURL+" istaskowner="+isTaskOwner+" description='' priority="+obj.task.priority+" target='taskform' tid="+obj.task.iD+" state="+obj.task.state.stateName+">No Description</a>";
			else
				items[items.length] = "<a class='task_name' onclick=javascript:showAlert(); istaskowner="+isTaskOwner+" description="+obj.task.description+" priority="+obj.task.priority+" target='taskform' tid="+obj.task.iD+" state="+obj.task.state.stateName+">No Description</a>";
		}
		if(obj.task.state.stateName=="CLAIMED")
			items[items.length]=returnHtmlStr("CLAIMED");
		else
			items[items.length]=returnHtmlStr("READY");
		if(obj.task.creationDate!="" && obj.task.creationDate!=null)
			items[items.length]=$.format.date(obj.task.creationDate, "MM/dd/yy hh:mm a");
		else
			items[items.length]=" ";
		if(obj.task.deadline!="" && obj.task.deadline!=null)
			items[items.length]=$.format.date(obj.task.deadline, "MM/dd/yy hh:mm a");
		else
			items[items.length]=" ";		
		if(obj.task.priority!="" && obj.task.priority!=null) {
			if(parseInt(obj.task.priority)>=parseInt(51))
				items[items.length]="<span class='label arrowed-in-right label-danger priority' value='"+obj.task.priority+"'>Critical</span>";
			else if(parseInt(obj.task.priority)>=parseInt(31) && parseInt(obj.task.priority)<=parseInt(50))
				items[items.length]="<span class='label label-warning arrowed-in-right priority' value='"+obj.task.priority+"'>Important</span>";
			else if(parseInt(obj.task.priority)>=parseInt(11) && parseInt(obj.task.priority)<=parseInt(30))
				items[items.length]="<span class='label label-success arrowed-in-right priority' value='"+obj.task.priority+"'>Normal</span>";
			else if(parseInt(obj.task.priority)<=parseInt(10))
				items[items.length]="<span class='label label-info arrowed-in-right priority' value='"+obj.task.priority+"'>Low</span>";
		}
		else
			items[items.length]="<span class='label label-success arrowed-in-right priority'  value='15'>Normal</span>";
		if(obj.task.priority!="" && obj.task.priority!=null)
			items[items.length]= parseInt(obj.task.priority);
		else
			items[items.length]=parseInt(15);
		
		if(obj.task.userOwners!=null && obj.task.userOwners.length>0)
			items[items.length]=obj.task.userOwners;
		else
			items[items.length]=" ";
		if(obj.task.roleOwners!=null && obj.task.roleOwners.length>0)
			items[items.length]=obj.task.roleOwners;
		else
			items[items.length]=" ";
		if(!isObjectEmpty(obj.task.state)) 
		{
			if($.inArray('update',taskIconSet)>=0) {
					html+="<span class='action-buttons'><a class='text-purple iconCursor'><i class='icon-zoom-in icon-edit bigger-120' title='Edit Task' onclick='updateTask(this,false);return false;'></i></a></span>";
					check=2;
				}
			if(obj.task._attachments!=null && obj.task._attachments!="") {
				$.each(obj.task._attachments,function(key,obj){
					html+="<span class='action-buttons'><a href="+key+" onclick='window.open("+key+",newwindow)' target='_blank' class='text-info iconCursor'><i class='icon-zoom-in icon-paper-clip bigger-140' title='Attachments'></i></a></span>";
					check+=1
				});
			}
			items[items.length]=html;
		}
		else
			items[items.length]=" "
		//custom column data
		$.each(data.newColumnList, function(columnKey,columnObj){
			if(obj.task.customMetadata[columnObj]!=null && obj.task.customMetadata[columnObj]!=undefined)
				items[items.length]=obj.task.customMetadata[columnObj];
			else
				items[items.length]="NA";
		});
			taskTable.fnAddData(items, false);
		});
		$('#workflow_tasks thead tr th:empty').width(check*35);
		taskTable.fnDraw(true);
        //taskTable.fnAdjustColumnSizing();
        tempTable = taskTable;       
        taskTable.fnFilter('');
    }
    else{
		$('.dataTables_empty').html("No tasks found.");
		$("#rowProcessesHeader th:gt(8)").remove();
	}
        $('#workflow_tasks thead tr th').removeClass("sorting");
		$('table thead th input:checkbox').prop('checked','');
}

/**
 * executes all tms soap calls from here
 * 
 * 
 * 
 * */
function executeAction(actionName,taskid,state,flag)
{
	var soapBody;
	var metaElement;
	var taskId;
	var sr;
	if(actionName=="update") 
	{
		soapBody    = new SOAPObject(actionName);
		soapBody.ns = defaults.tmsNameSpace;
		metaElement = soapBody.appendChild(new SOAPObject("taskMetadata"));
		metaElement.appendChild(new SOAPObject("taskId")).val(taskid);
		metaElement.appendChild(new SOAPObject("description")).val($('#updateDescription').val());
		metaElement.appendChild(new SOAPObject("priority")).val($('input[name=form-field-radio]:checked', '#priority_form').val());
		soapBody.appendChild(new SOAPObject("participantToken")).val(participantToken);
	}
	else if(actionName=="reassign")
	{
		soapBody = new SOAPObject(actionName);
		soapBody.ns = defaults.tmsNameSpace;
		soapBody.appendChild(new SOAPObject("taskId")).val(taskid);
		soapBody.appendChild(new SOAPObject("userOwner")).val($("#fetchedUsersCombo").val());
		soapBody.appendChild(new SOAPObject("roleOwner")).val($("#fetchedRolesCombo").val());
		soapBody.appendChild(new SOAPObject("taskState")).val('READY');
		soapBody.appendChild(new SOAPObject("participantToken")).val(participantToken);
		soapBody.appendChild(new SOAPObject("userAction")).val('REASSIGN');
	}
	else if(actionName=="delete")
	{
		soapBody = new SOAPObject(actionName);
		soapBody.ns = defaults.tmsNameSpace;
		soapBody.appendChild(new SOAPObject("taskId")).val(taskid);
		soapBody.appendChild(new SOAPObject("participantToken")).val(participantToken);
	}
	else if(actionName=="claim/revoke")
	{
		soapBody = new SOAPObject("reassign");
		soapBody.ns = defaults.tmsNameSpace;
		soapBody.appendChild(new SOAPObject("taskId")).val(taskid);
		soapBody.appendChild(new SOAPObject("userOwner")).val(currentUser);
		
		if(state == "READY") 
			soapBody.appendChild(new SOAPObject("taskState")).val('CLAIMED');
		else 
			soapBody.appendChild(new SOAPObject("taskState")).val('READY');
		
		soapBody.appendChild(new SOAPObject("participantToken")).val(participantToken);
		
		if(state == "READY") 
			soapBody.appendChild(new SOAPObject("userAction")).val('CLAIMED');
		else 
			soapBody.appendChild(new SOAPObject("userAction")).val('REVOKE');
	}
	else if(actionName=="skipTask")
	{
		var soapBody = new SOAPObject(actionName+"Request");
		soapBody.ns  = defaults.skipTaskNameSpace;
		soapBody.appendChild(new SOAPObject("taskId")).val(taskid);
		soapBody.appendChild(new SOAPObject("participantToken")).val(participantToken);
		
	}
	if(actionName=="claim/revoke")
		sr = new SOAPRequest(defaults.tmsNameSpace+"/reassign",soapBody);
	else
		sr = new SOAPRequest(defaults.tmsNameSpace+"/"+actionName,soapBody);
	
	SOAPClient.Proxy = proxy;
	
	if(actionName=="skipTask")
		SOAPClient.SOAPServer = tmpService;
	else
		SOAPClient.SOAPServer = tmsService;
	SOAPClient.SendRequest(sr, function(response)
	{ 
		if(flag) 
		{
			if(currentTab == "tasks")
				getTasksData();
			else if(currentTab == "notifications")
				getNotificationData();
			else if(currentTab == "processes")
				getProcessesData();
		}
	});
}


function executeRbacAction(actionName,sucessCallBack,role,bol)
{
	var data;
	if(actionName=="getAssignedRoles") {
		data = {user:currentUser}
		sendAjaxCall("axis2/services/RBACQueryService/"+actionName+"?response=application/json", "POST", false, true, "json",data, handleAjaxError, sucessCallBack);
	}
	else if(actionName=="getAssignedUsers") {
		data = {role:role} 
		sendAjaxCall("axis2/services/RBACQueryService/"+actionName+"?response=application/json", "POST", false, true, "json",data, handleAjaxError, function(response){
			populateUsers(response,bol);
		});
		
		
	}
}


function populateUsers(data,bol) {
	if(!isObjectEmpty(data.user)) {
		if(data.user instanceof Array){
			$.each(data.user,function(key,obj) {
				if($.inArray($.trim(obj),userArray)==-1) {
					$("#fetchedUsersCombo").append("<option value="+obj+">"+obj+"</option>");
					userArray[userArray.length] = $.trim(obj);
				}
			});
		}
		else if($.inArray($.trim(data.user),userArray)==-1){
			$("#fetchedUsersCombo").append("<option value="+data.user+">"+data.user+"</option>");
			userArray[userArray.length] = $.trim(data.user);
		}
	}
	if(bol) {
		$("#fetchedUsersCombo").chosen();
		$("#fetchedUsersCombo_chzn").css("width",240);
		$("#fetchedUsersCombo_chzn ul li input").removeAttr("style");
		$("#fetchedRolesCombo_chzn ul li input").removeAttr("style");
	}
}

function loadIFrame(id,div){
	if($("#"+id).contents().find("body").html().length >0){
		if($("#"+div).hasClass("hide")==false) {
			$("#"+div).addClass("hide");
			$("#"+id).removeClass('hide');
			$('#'+id).animate({height:height},speed);
		}
		else
		{
			$("#"+div).removeClass("hide");
			$("#"+id).addClass('hide');
			$("#"+id).contents().find("body").html('');
			$('#'+id).attr('height',0);
			if(currentTab == "tasks")
				sendAjaxCall("../ui-fw/updates.htm", "POST", false, true, "json",taskData, handleAjaxError, updateTasksData);
			else if(currentTab == "notifications")
				sendAjaxCall("../ui-fw/updates.htm", "POST", false, true, "json",notificationData, handleAjaxError, updateNotifData);
			else if(currentTab == "processes")
				sendAjaxCall("../ui-fw/updates.htm", "POST", false, true, "json",processesData, handleAjaxError, updateProcessesData);
			//sendAjaxCall("../ui-fw/updates.htm", "POST", false, true, "json",taskData, handleAjaxError, updateTasksData);
		}		
	} else {
		$('#'+id).attr('height',0);
		$("#"+id).addClass('hide');
	}
}


function updateProcesses(data)
{
	participantToken = data.participantToken;
	currentUser      = data.currentUser;
	$.each(data.notificationIconSet, function(key,value){
		notiIconSet[key] = value;
	});
	useToolBarIcon = data.toolbarIcons;
	tmsService = data.tmsService;
	tmpService = data.tmpEndPoint;
	processTable = $('#workflow_processes').dataTable(processesOptions);
	$('#workflow_processes_length').remove();
	var processesButton = getToolbarIconsCodes("delete");
	$('#workflow_processes_wrapper .row .col-sm-6:first').append(processesButton);
	tableWidth ='100%';
	customTable('workflow_processes');
	updateProcessesData(data);
}

function updateProcessesData(data)
{
	if($("#processesTableDiv").hasClass("hide"))
	{
		$("#processesTableDiv").removeClass("hide");
		$("#processesform").contents().find("body").html('');
	}
	currentTab = "processes";
	var oSettings = processTable.fnSettings();
    processTable.fnClearTable();
    if (data.tasks!=undefined && data.tasks.length>0) {
	$.each(data.tasks,function(key,obj){
		var items = [];
		items[items.length] = "<input type='checkbox' class='ace taskSelected' id='taskSelected'> <span class='lbl'></span>";
		if(obj.task.description!="" && obj.task.description!=null)
			items[items.length] = "<a class='task_name' href="+obj.formManagerURL+" istaskowner='true' description="+obj.task.description+" target='processesform' tid="+obj.task.iD+">"+obj.task.description+"</a>";
		else
			items[items.length] = "<a class='task_name' href="+obj.formManagerURL+" istaskowner='true' description='' target='processesform' tid="+obj.task.iD+">No Description</a>";
		if(obj.task.creationDate!="" && obj.task.creationDate!=null)
			items[items.length]=$.format.date(obj.task.creationDate, "MM/dd/yy hh:mm a");
		else
			items[items.length]=" ";
		if(obj.task.userOwners!=null && obj.task.userOwners.length>0)
			items[items.length]=obj.task.userOwners;
		else
			items[items.length]=" ";
		if(obj.task.roleOwners!=null && obj.task.roleOwners.length>0)
			items[items.length]=obj.task.roleOwners;
		else
			items[items.length]=" ";
			
		items[items.length]='<span class="action-buttons"><a class="text-purple iconCursor" onclick="setFormURL(\''+ obj.task._formURL +'\',\''+obj.task.description+'\');"><i class="icon-search"></i></a></span>';	
		processTable.fnAddData(items, false);
		});
		processTable.fnDraw(true);
        processTable.fnAdjustColumnSizing();
        tempTable = processTable;
        processTable.fnFilter('');
    }
    else{
		$('.dataTables_empty').html("No tasks found.");
		$("#rowProcessesHeader th:gt(7)").remove();
	}
        $('#workflow_processes thead tr th').removeClass("sorting");
		$('table thead th input:checkbox').prop('checked','');
}

function populateNotificationsData(data)
{
	participantToken = data.participantToken;
	$.each(data.notificationIconSet, function(key,value){
		notiIconSet[key] = value;
	});
	useToolBarIcon = data.toolbarIcons;
	tmsService = data.tmsService;
	tmpService = data.tmpEndPoint;
	notificationTable = $('#workflow_notifications').dataTable(notificationOptions);
	$('#workflow_notifications_length').remove();
	for(var i = 0; i < notiIconSet.length; i++){
		if(notiIconSet[i]!=null && notiIconSet[i]!=undefined){
			var notificationButton = getToolbarIconsCodes(notiIconSet[i]);
			$('#workflow_notifications_wrapper .row .col-sm-6:first').append(notificationButton);
		}
	}
	tableWidth ='100%';
	customTable('workflow_notifications');
	updateNotifData(data);
}
function updateNotifData(data) 
{ 
	if($("#notificationTableDiv").hasClass("hide")) {
		$("#notificationTableDiv").removeClass("hide");
		$("#notificationform").contents().find("body").html('');
	}
	currentTab = "notifications";
	notificationTable.fnClearTable();
	if (data.tasks!=undefined && data.tasks.length>0) {
		$.each(data.tasks,function(key,obj){
			var items = [];
			items[items.length] = "<input type='checkbox' class='ace taskSelected' id='taskSelected'> <span class='lbl'></span>";
			if(obj.task.description!="" && obj.task.description!=null)
				items[items.length] = "<a class='task_name' href="+obj.formManagerURL+" istaskowner='true' description="+obj.task.description+" priority="+obj.task.priority+" target='notificationform' tid="+obj.task.iD+" state="+obj.task.state.stateName+">"+obj.task.description+"</a>";
			else
				items[items.length] = "<a class='task_name' href="+obj.formManagerURL+" istaskowner='true' description='' priority="+obj.task.priority+" target='notificationform' tid="+obj.task.iD+" state="+obj.task.state.stateName+">No Description</a>";
			if(obj.task.priority!="" && obj.task.priority!=null) {
				if(parseInt(obj.task.priority)>=parseInt(51))
					items[items.length]="<span class='label arrowed-in-right label-danger priority'>Critical</span>";
				else if(parseInt(obj.task.priority)>=parseInt(31) && parseInt(obj.task.priority)<=parseInt(50))
					items[items.length]="<span class='label label-warning arrowed-in-right priority'>Important</span>";
				else if(parseInt(obj.task.priority)>=parseInt(11) && parseInt(obj.task.priority)<=parseInt(30))
					items[items.length]="<span class='label label-success arrowed-in-right priority'>Normal</span>";
				else if(parseInt(obj.task.priority)<=parseInt(10))
					items[items.length]="<span class='label label-info arrowed-in-right priority'>Low</span>";
			}
			else
				items[items.length]="<span class='label label-success arrowed-in-right priority'>Normal</span>";
			if(obj.task.priority!="" && obj.task.priority!=null) 
				items[items.length]= parseInt(obj.task.priority);
			else
				items[items.length]=parseInt(15);
			if(obj.task.creationDate!="" && obj.task.creationDate!=null)
				items[items.length]=$.format.date(obj.task.creationDate, "MM/dd/yy hh:mm a");
			else
				items[items.length]=" ";
			if(obj.task.userOwners!=null && obj.task.userOwners!="string" && obj.task.userOwners.length>0)
				items[items.length]=obj.task.userOwners;
			else
				items[items.length]=" ";
			if(obj.task.roleOwners!=null && obj.task.roleOwners.length>0)
				items[items.length]=obj.task.roleOwners;
			else
				items[items.length]=" ";
			
			notificationTable.fnAddData(items, false);
		});
			notificationTable.fnDraw(true);
			notificationTable.fnAdjustColumnSizing();
			tempTable = notificationTable;
			
			 notificationTable.fnFilter('');
	}
	else{
		$('.dataTables_empty').html("No tasks found.");
		//$("#rowProcessesHeader th:gt(7)").remove();
	}
	$('#workflow_notifications thead tr th').removeClass("sorting");
}
function executeActionNotif(columnValues,actionName,successCallBack)
{
	$.each(columnValues, function(key,obj)
	{
		var soapBody = null;
		var sr;
		if($(obj).attr('tid')!=undefined && $(obj).attr('tid')!=null && actionName=="delete") 
		{
			soapBody = new SOAPObject(actionName);
			soapBody.ns = defaults.tmsNameSpace;
			soapBody.appendChild(new SOAPObject("taskId")).val($(obj).attr('tid'));
			soapBody.appendChild(new SOAPObject("participantToken")).val(participantToken);
		}
		if(soapBody!=null) 
		{
			sr = new SOAPRequest(defaults.tmsNameSpace+"/"+actionName,soapBody);
			SOAPClient.Proxy = proxy;
			SOAPClient.SOAPServer = tmsService;
			SOAPClient.SendRequest(sr, successCallBack);
		}
	});
}

defaults = {
	tmsNameSpace      : "http://www.intalio.com/BPMS/Workflow/TaskManagementServices-20051109/",
	skipTaskNameSpace : "http://www.intalio.com/bpms/workflow/ib4p_20051115",
	rbacNameSpace     : "http://tempo.intalio.org/security/RBACQueryService/"
}

function setFormURL(url,name) {
    var k = url.indexOf("/gi/apppath/");
    if (k >= 0) {
        var length = "/gi/apppath/".length;
        length = k + length;
        url = url.substring(length, length + url.substring(length).indexOf("/"));
    } else {
        url = url.substring(url.indexOf(":") + 1, url.length);
        url = url.substring(0, url.indexOf(".xform"));
        var values = url.split("/");
        var temp = "";
        for (var i = 0; i < values.length; i++) {
            if (values[i] != "") {
                temp = temp + values[i];
                break;
            }
        }
        url = temp;
    }
    formURL = name;
    processTasks = true;
    taskData.formURL = url;
    taskData.taskType = "PATask";
	$("#main-content").load('tasks.htm');
	$('#processes').removeClass('active');
	$('#tasks').addClass('active');	
}
/* Ajax Error function */
function handleAjaxError(exception) {
	console.log(exception);
	return false;
}
$('.modal').keyup(function(e) {
  if (e.keyCode == 13) { console.log('enter') }     // enter
  if (e.keyCode == 27) { console.log('chekc') }   // esc
});
