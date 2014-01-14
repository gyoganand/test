/**
 * Copyright (C) 2005, Intalio Inc.
 *
 * The program(s) herein may be used and/or copied only with
 * the written permission of Intalio Inc. or in accordance with
 * the terms and conditions stipulated in the agreement/contract
 * under which the program(s) have been supplied.
 */
var endingCommit;
var aday = 24 * 60 * 60;
var ahour = 60 * 60;
var execute = true;
var checkProject;
var defaultBranch;
var pathArray;
var projectName;
var repositoryName;
var currentBranch;
var sourceCheck;
var endingCommitProject;
var searchQuery = [];
var endingSearchCommmit;
var previousSVGevt;
var setRepoDelete;
var setFlag=true;
var folderArray=[];
var deleteRepoName;

/**@Function Name   : Jquery Ready Function 
 * @Description     : fetches the repositories & commits
 * @param           :
 * @returns         : list of Repositories & commits
 * */
 
$(document).ready(function () {
    alignColumn();
    fetchRepos();
    fetchCommits(0);
	$('[data-rel=tooltip]').tooltip();
	$('.ace-popover').popover();
});

/**@Function Name   : FetchRepos
 * @Description     : fetchs repositories list from server
 * @param           :
 * @returns         : list of Repositories
 * */

function fetchRepos() {
    var data = {};
    sendAjaxCall('../collaboration/fetchRepositories.json', "POST", false, true, "json", data, errorCallCollaboration, fetchReposSuccess);
    function fetchReposSuccess(data) {
        $('#repoList li').remove();
		$('#repoSearch').empty();
		$('#repoSearch').append('<option value="-1"> Select</option>');
        $.each(data.repositories, function (idx, repo) {
            $('#repoList').append('<li id="rlist"><a href="#" onclick="openProjectPage(\'' + repo + '\');return false;"><span onclick="confirmDeleteRepo(\'' + repo + '\');return false;" id="repo-delete" class="btn btn-minier btn-danger pull-right"><i class="icon-remove"></i></span>' + repo + '</a></li>');
            $('#repoSearch').append('<option value="' + repo + '"> ' + repo + '</option>');
        });
        openProjectPage(data.repositories[0]);
    }
}

/**@Function Name   : repoSearch Change
 * @Description     : fetches the projects for a selected repo
 * @param           :
 * @returns         : list of projects
 * */
 
$('#repoSearch').change(function () {
    searchQuery[0] = $(this).attr('value');
    var data = {
        repoName: $(this).attr('value')
    }
    sendAjaxCall('../collaboration/fetchProjects.json', "POST", false, true, "json", data, errorCallCollaboration, projectListSuccess);
});

/**@Function Name   : projectslist
 * @Description     : fetchs projects on select change and append it to select
 * @param           :
 * @returns         : list of projects
 * */
 
function projectListSuccess(data) {
    $('#projectsearch').empty();
    $('#projectsearch').append('<option value="-1"> Select</option>')
    $.each(data.projects, function (idx, value) {
        $('#projectsearch').append('<option value="' + value + '"> ' + value + '</option>');
    });
}

/**@Function Name   : projectsearch Change
 * @Description     : fetches the contributors list for a selected project
 * @param           :
 * @returns         : list of contributors
 * */
 
$('#projectsearch').change(function () {
    searchQuery[1] = $(this).attr('value');
    var data = {
        repoName: searchQuery[0],
        projectName: searchQuery[1]
    }
    sendAjaxCall('../collaboration/fetchProjectInfo.json', "POST", false, true, "json", data, errorCallCollaboration, userListSuccess);
});

/**@Function Name   : userListSuccess 
 * @Description     : fetchs users on select change and append it to select
 * @param           :
 * @returns         : list of users for a project
 * */
 
function userListSuccess(data) {
    $('#collaboratorSearch').empty();
    $('#collaboratorSearch').append('<option value="-1"> Select</option>')
    $.each(data.contributors, function (idx, value) {
        $('#collaboratorSearch').append('<option value="' + value + '"> ' + value + '</option>');
    });
}

/**@Function Name   : collaboratorSearch change 
 * @Description     : For a selected collaborator searches all commits
 * @param           :
 * @returns         : 
 * */
 
$('#collaboratorSearch').change(function () {
    searchQuery[2] = $(this).attr('value');
});

/**@Function Name   : fetchSearchcommits
 * @Description     : fetchs commits according to search
 * @param           :
 * @returns         : list of commits for a search
 * */

function fetchSearchcommits(start) {
	if(searchQuery[0]!= null && searchQuery[0]!="-1"){
		if(searchQuery[1]!=null && searchQuery[1]!="-1"){
			if(searchQuery[2]!=null && searchQuery[2]!="-1"){
				$('#loadingGifSearch').show();
				$('#loadingMoreSearch').hide();
				endingCommitSearch = start + 6;
				if(start==0){
					$('#searchCommits').empty();				
					$('#searchCommits').append('<div class="alert alert-warning" style="margin-bottom:25px;">Search results ..</div>');
				}
				$('#myIcon').removeClass('hide');
				if(searchQuery[2].indexOf('\\\\')==-1){
					searchQuery[2] = searchQuery[2].replace(/\\/g, '\\\\');
				}
				var data = {
					repoName: searchQuery[0],
					projectName: searchQuery[1],
					commitedBy: searchQuery[2],
					start: start,
					max: start+6
				}
				sendAjaxCall('../collaboration/searchCommit.json', "POST", false, true, "json", data, errorCallCollaboration, fetchSearchCommitsSuccess);
			} else {
				bootbox.alert(defaults.selectCollaborator);
			}
		}else{
			bootbox.alert(defaults.selectProject);
		}
	} else {
		bootbox.alert(defaults.selectRepository);
	}
}

/**@Function Name   : fetchSearchCommitsSuccess
 * @Description     : populates commits based on search data
 * @param           :
 * @returns         : 
 * */
 
function fetchSearchCommitsSuccess(data) {
	if (data.error == null) {
    setTimeout(function () {
        $('#myIcon').addClass('hide');
    }, parseInt(Math.random() * 1000 + 1000));
	$('#loadingGifSearch').hide();
    $('#loadingMoreSearch').show();
    if (data.searchCommits.length == 6) {
        $('#loadmoreHideSearch').removeClass('hide');
    } else {
        $('#loadmoreHideSearch').addClass('hide');
    }
	var now = new Date();
	$.each(data.searchCommits, function (idx, commit) {
		var cDate = new Date(commit.commitedOn);
		var repProject = commit.repoName + '&nbsp;<i class="icon-angle-right"></i>&nbsp;' + commit.projectName;
		$('#searchCommits').append('<div id="commitsList">&nbsp;<i class="icon-time"></i> &nbsp;' + differDates(now - cDate, 3) + '<br> &nbsp;<a href="#">' + repProject + '</a><br>&nbsp;' + commit.commitMessage + '<br/>&nbsp;<s:message code="commit.commited.by" />' + commit.commitedBy + '<hr id="horizontalLine"></div>');
	});
    }
}

/**
 * @Function Name   : loadMoreSearch 
 * @Description     : Loads the next 10 Commits
 * @param           : 
 * @returns         : list of commits
 * */

function loadMoreSearch(){
	fetchSearchcommits(endingCommitSearch);
}

/**
 * @Function Name   : fetchCommits 
 * @Description     : Fetchs commits from server
 * @param           : starting number of commit
 * @returns         : list of commits
 * */

function fetchCommits(start) {
    $('#loadingGif').show();
    $('#loadingMore').hide();
    endingCommit = start + 8;
    var data = {
        start: start,
        max: 8
    }
    sendAjaxCall('../collaboration/fetchCommitsBasedOnTS.json', "POST", false, true, "json", data, errorCallCollaboration, fetchCommitsSuccess);

}

/**
 * @Function Name   : fetchCommitsSuccess 
 * @Description     : Populates the COmmits
 * @param           : json data
 * @returns         : 
 * */
 
function fetchCommitsSuccess(data) {
    $('#loadingGif').hide();
    $('#loadingMore').show();
    if (data.commitActivities.length == 8) {
        $('#loadmoreHide').removeClass('hide');
    } else {
        $('#loadmoreHide').addClass('hide');
    }
    if (data.error == null) {
        var now = new Date();
        $.each(data.commitActivities, function (idx, commit) {
            var cDate = new Date(commit.commitedOn);
			/* onclick="projectInformation(\'' + commit.repoName + ',' + commit.projectName + '\');return false;" add it to open project page */
            var repProject = '<a>' + commit.repoName + '</a>&nbsp;<i class="icon-angle-right"></i>&nbsp;<a href="#" >' + commit.projectName + '</a>';
            $('#commitList').append('<div id="commitsList"><div class="pull-right"><span class="pull-right visible-md visible-lg hidden-sm hidden-xs action-buttons"><a title="Comment on this commit" data-toggle="collapse"  href="#comments'+commit.commitId+'" onclick=openFile(\'' + commit.commitId + '\',"projectComments");><i class="icon-comments blue"></i></a></span></div>&nbsp;<i class="icon-time"></i> &nbsp;' + differDates(now - cDate, 4) + '<br> &nbsp;' + repProject + '<br>&nbsp;' + commit.commitMessage + '<br/>&nbsp;<fmt:message code="commit.commited.by" />' + commit.commitedBy + '<hr id="horizontalLine"></div><div id="comments'+commit.commitId+'" class="accordion-body collapse"><div class="accordion-inner comments"></div></div>');
        });
        $('commitsList:first-child').css('margin-top', '10');
    }
}

/** 
 * @Function Name   : differDates 
 * @Description     : Calculating the time difference for commits
 * @param           : difference of present time and commit created time
 * @returns         : string indicating the time difference
 * */

function differDates(diff, check) {
    var dstring = '';
    var secs = Math.round(diff / 1000);
    if (secs > aday & check > 0) {
        var ndays = Math.round(secs / aday);
        dstring += ndays + ' days ';
        secs = secs - aday * ndays;
    }
    check--;
    if (secs > ahour & check > 0) {
        var nhour = Math.round(secs / ahour);
        dstring += nhour + ' hours ';
        secs = secs - ahour * nhour;
    }
    check--;
    if (secs > 60 & check > 0) {
        var nmins = Math.round(secs / 60)
        dstring += nmins + ' mins ';
        secs = secs - nmins * 60;
    }
    check--;
    if (dstring.length != 0) {
        dstring += ' ago.. ';
    } else {
        dstring += 'just now...';
    }
    return dstring;
}

/** 
 * @Function Name   : createRepo 
 * @Description     : Creates a repo in the server
 * @param           :
 * @returns         :
 * */

function createRepo() {
    var repoName = $("#repoName").val();
    var data = {
        repoName: repoName
    }
    if (repoName != '') {
        sendAjaxCall('../collaboration/createRepository.json', "POST", false, true, "json", data, errorCallCollaboration, function(data1){
			createRepoSuccess(data1,repoName);
		});
    } else {
		$('#empty_field').text('Please enter a Repositiory Name');
		$('#empty_field').removeClass('hide');
	}
}

/** 
 * @Function Name   : createRepoSuccess 
 * @Description     : fetches the repo list
 * @param           :
 * @returns         :
 * */
 
function createRepoSuccess(data,repo) {
    if (data.error == null) {
		$("#repoName").val('');
        fetchRepos();
        $('#createRepo').modal('hide');
		showNotification(data.message);
    } else {
		$('#empty_field').text(data.error);
		$('#empty_field').removeClass('hide');
	}
}
$('a[href="#createRepo"]').on('click',function(){
	$('#empty_field').addClass('hide');
});

function confirmDeleteRepo(repo){
	deleteRepoName =repo;
	modalShow('deleteRepo');
}
/** 
 * @Function Name   : deleteRepo 
 * @Description     : Deletes selected repo in the server
 * @param           : repoName
 * @returns         :
 * */

function deleteRepo() {
    var data = {
        repoName: deleteRepoName
    }
    if (deleteRepoName != '') {
        sendAjaxCall('../collaboration/deleteRepository.json', "POST", false, true, "json", data, errorCallCollaboration, deleteRepoAjax); 
    }
}

function deleteRepoAjax(data) {
    if (data.error == null) {
        fetchRepos();
		showNotification(data.message);
    } else {
		bootbox.alert(data.error);
	}
}

function showNotification(msg){
	if(msg != null){
			$('#notificationMessage').text(msg).removeClass('hide');
			setTimeout(function () {
				$('#notificationMessage').addClass('hide');
			}, 4000);
		}
}
/** @Function Name  : openProjectPage() 
 * @Description     : Opens list of projects in give Repository
 * @param           : repoName
 * @returns         : list of projects
 * */

function openProjectPage(repo) {
	if(repo.length < 12){
		$('#repository').text(repo);
		$('#repository').removeAttr('data-content');
	} else{
		var tempRepo=repo.slice(0,12);
		tempRepo += '..';
		$('#repository').text(tempRepo);
		$('#repository').attr('data-content',repo);
	}
	if(repo != null){
		repositoryName = repo;
		if (execute) {
			var data = {
				repoName: repositoryName
			}
			sendAjaxCall('../collaboration/fetchProjects.json', "POST", false, true, "json", data, errorCallCollaboration, openProjectPageAjax);
		} else {
			execute = true;
		}
	}
	
}

function openProjectPageAjax(data) {
	if(data.error == null){
		$('#proList li').remove();
		if (data.projects.length === 0) {
			$('#proList').empty();
			$('#proList').append('<li id="plist" ><a class="text-danger">' + defaults.noProjectsInRepository + '</a></li>');
		} else {
			$.each(data.projects, function (idx, project) {
				var pname = project;
				$('#proList').append('<li id="plist"><a  class="text-info" href="#" id=' + pname + ' data-dismiss="modal" aria-hidden="true" data-toggle="modal" >' + pname + '<span class="btn btn-minier btn-danger pull-right" id="repo-close" > <i id="projectDelete" class="icon-remove"></i></span></a></li>');
			});
		}
		$("#plist a").on('click',function(e) {
				if($(e.target).hasClass("text-info"))
					projectInformation($(this).attr("id"));
			});
		if(setFlag) {
			$("span#repo-close").on('click',function(e) {
				var projectId = $(this).parent().attr("id");
				modalShow("deleteProject");
				$("#deleteProjectYes").on('click',function(e) {
					projectDelete(projectId);
				});
			});
		}
	} else{
		bootbox.alert(data.error);
	}
}

function projectInformation(project) {
	$('#proList li').removeClass('active-class');
	projectName = project;
    $('#'+project).parent().addClass('active-class');
    $('#collab-content').empty();
    $('#collab-tabs').remove();
    $('#project-page').clone().appendTo('#collab-content');
    projectBranch();
}

function projectDelete(project) {
	var data= {
		repoName : repositoryName,
		projectName:project
	}
	sendAjaxCall('../collaboration/deleteProject.json', "POST", false, true, "json", data, errorCallCollaboration,projectDeleteSuccess);	
}

function projectDeleteSuccess(data)
{
	if(data.message!=null && data.message!="") {
		showNotification(data.message);
		openProjectPage();
	}else if(data.error!=null && data.error!="")
		bootbox.alert(data.error);
	return false;
}
/** @Function Name  : openProject()
 * @Description     : Displays data in the project
 * @param           : repoName,projectName,version
 * @returns         :
 * */

function openProject(branchId) {
    checkProject = 0;
    pathArray = [];
    pathIndex = 0;
    $('#project-page-branch').empty();
    $('#project-page-head h4').remove();
    $('#project-page-head').append('<h4 class="text-info">' + repositoryName + '&nbsp; <i class="icon-angle-right"></i>&nbsp; ' + projectName + '</h4>');
    $('#project-page-branch').append('Branch: &nbsp;' + branchId + '');
	currentBranch = branchId;
    totlaLockFiles();
    totalProjectCommits();
    fetchDescription();
    fetchTags();
}

/** 
 * @Function Name  : fetchTags
 * @Description     : this function will get the tags for the selected project
 * @param           : 
 * @returns         : return tags of a project
 * */

function fetchTags() {
	var data = {
		repoName    : repositoryName,
		projectName : projectName
	}
	sendAjaxCall('../collaboration/fetchTags.json', "POST", false, true, "json", data, errorCallCollaboration, fetchTagsSuccess);
}

/**
 * @Function Name   : fetchTagsSuccess()
 * @Description     : populates the tags received
 * @param           : json data
 * @returns         : 
 * */
function fetchTagsSuccess(data)
{
	$("#collabProjectTagsBody").empty();
	var row='<tr>';
	var downloadFlag = "download";
	if(data.tags.length>0){
		$.each(data.tags, function (key, obj) {
			var tagName = obj.tagName.replace(/\ /g,"_");
			var currentDate = new Date();
			var date = new Date(obj.createdOn);
			row+='<td>'+obj.tagName+'</td><td>'+obj.createdBy+'</td><td>'+differDates(currentDate - date,2)+'</td><td><span class="pull-right visible-md visible-lg hidden-sm hidden-xs action-buttons"><a onclick=openFile("'+tagName+'","zipDownload"); href="#" title="Download"><i class="icon-download-alt green"></i></a><a onclick=tagDelete("'+tagName+'"); href="#" title="Delete"><i class="icon-remove red"></i></a></span><td></tr>';
		});
		$("#collabProjectTagsBody").append(row);
	}
	else
		$("#collabProjectTagsBody").append("<tr><td colspan='4'>No Tags Found</td></tr>");
}


/**@Function Name   : totlaLockFiles()
 * @Description     : gives total number of lock files in a project
 * @param           : repoName,projectName,version
 * @returns         : Total locks
 * */

function totlaLockFiles() {
    var data = {
        repoName: repositoryName,
        projectName: projectName,
        branch: currentBranch
    }
    sendAjaxCall('../collaboration/fetchLockCount.json', "POST", false, true, "json", data, errorCallCollaboration, totlaLockFilesAjax);
}

function totlaLockFilesAjax(response) {
    $('#total-locks').empty();
    $('#total-locks').append(response.lockResourceCount);
}

/** @Function Name  : totalProjectCommits()
 * @Description     : gives total number of commits in a project
 * @param           : repoName,projectName,version
 * @returns         : Total commits
 * */

function totalProjectCommits() {
    var data = {
        repoName: repositoryName,
        projectName: projectName,
        branch: currentBranch
    }
    sendAjaxCall('../collaboration/fetchCommitCount.json', "POST", false, true, "json", data, errorCallCollaboration, totalProjectCommitsAjax);

}

function totalProjectCommitsAjax(response) {
    $('#total-commits').empty();
    $('#total-commits').append(response.totalCommits);
}
/** @Function Name  : fetchLockFiles()
 * @Description     : dispalys the locked files in a project
 * @param           : repoName,projectName,version
 * @returns         :
 * */

function fetchLockFiles() {
    var data = {
        repoName: repositoryName,
        projectName: projectName,
        branch: currentBranch
    }
    sendAjaxCall('../collaboration/fetchLocks.json', "POST", false, true, "json", data, errorCallCollaboration, fetchLockFilesAjax);
}

function fetchLockFilesAjax(response) {
    var now = new Date();
    $('#lock-table tr').remove();
    if (response.lockResources.length == 0) {
        $('#lock_table_head').addClass('hide');
        $('#lock-table').append('<tr><td  class="alert alert-warning"> <h4> ' + defaults.noFileIsLocked + '</h4></td></tr>');
    } else {
        $('#lock_table_head').removeClass('hide');
        $.each(response.lockResources, function (idx, source) {
            var cDate = new Date(source.lockedDate);
			$('#lock-table').append('<tr id='+source.resourceName.replace('.','').replace(/\//g, '')+' class="projectLockRow"><td id="tab-td" class="text-info" ><i class="icon-lock"></i>   &nbsp;' + source.resourceName + '<td id="tab-td"><span class="text-info"> ' + source.lockedBy + '</span></td><td id="tab-td" class="text-info" >' + differDates(now - cDate, 2) + '</td><td id="tab-td"><span class="pull-right visible-md visible-lg hidden-sm hidden-xs action-buttons"><a title="Comments" data-toggle="collapse"  href="#tableComments'+source.resourceName.replace('.','').replace(/\//g, '')+'" onclick=openFile(\'' + source.resourceName + '\',"tableComments");><i class="icon-comments blue"></i></a></span></td></tr>');
        });
		if($('#lock_table').find('.sorting_asc').length==0){
			$('#lock_table').dataTable({
				"sDom": "<'row'<'col-md-8'l><'col-md-4'f>r>t<'row'<'col-md-8'i><'col-md-4'p>>",
				"bInfo": false,
				"bPaginate": false,
				"aoColumnDefs": [{
					'bSortable': false,
					'aTargets': [3]
				}]
			});
			$('#lock_table').find('tr').removeClass('even');
			$('#lock_table').find('tr').removeClass('odd');
			$('#lock_table_length').parent().remove();
			$('#lock_table_filter').parent().addClass('pull-right');
			$('#lock_table_wrapper div.row:last-child').remove();
		}
    }
}
/** @Function Name  : fetchCommitFiles()
 * @Description     : fetch the commits in a project
 * @param           : repoName,projectName,version
 * @returns         :
 * */

function fetchCommitFiles(start) {
    $('#loadingGifCommits').show();
    $('#loadingMoreCommits').hide();
    endingCommitProject = start + 5;
    var data = {
        repoName: repositoryName,
        projectName: projectName,
        branch: currentBranch,
        start: start,
        max: start + 5
    }
    if (start == 0) {
        $('#projectCommitList').empty();
        $('#projectCommitList').append();
    }
    sendAjaxCall('../collaboration/fetchCommits.json', "POST", false, true, "json", data, errorCallCollaboration, fetchCommitFilesAjax);
}

function fetchCommitFilesAjax(response) {
    var now = new Date();
    $('#loadingGifCommits').hide();
    $('#loadingMoreCommits').show();
    if (response.commits.length == 5) {
        $('#loadmoreCommits').removeClass('hide');
    } else {
        $('#loadmoreCommits').addClass('hide');
    }
    $.each(response.commits, function (idx, commit) {
        var cDate = new Date(commit.commitedOn);
        var repProject = commit.repoName + '&nbsp;<i class="icon-angle-right"></i>&nbsp;' + commit.projectName;
        $('#projectCommitList').append('<div class="projectCommitsList"><div class="pull-right"><span class="pull-right visible-md visible-lg hidden-sm hidden-xs action-buttons"><a title="Comment on this commit" data-toggle="collapse"  href="#comments'+commit.commitId+'" onclick=openFile(\'' + commit.commitId + '\',"projectComments");><i class="icon-comments blue"></i></a></span></div>&nbsp;<i class="icon-time"></i> &nbsp;' + differDates(now - cDate, 4) + '<br> &nbsp;<a href="#">' + repProject + '</a><br>&nbsp;' + commit.commitMessage + '<br/>&nbsp;<s:message code="commit.commited.by" />' + commit.commitedBy + '<hr id="horizontalLine"></div><div id="comments'+commit.commitId+'" class="accordion-body collapse"><div class="accordion-inner comments"></div></div>');
    });
}
/* fetch commit source
function fetchCommitSource(id, msg) {
    var data = {
        commitId: id
    }
    sendAjaxCall('../collaboration/fetchCommitsResources.json', "POST", false, true, "json", data, errorCallCollaboration, fetchCommitSourceAjax);
}

function fetchCommitSourceAjax(data) {

}
*/
/** @Function Name  : projectBranch()
 * @Description     : returns all the branchs in a project
 * @param           : repoName,projectName
 * @returns         : branchs
 * */

function projectBranch() {
    var data = {
        repoName: repositoryName,
        projectName: projectName
    }
    sendAjaxCall('../collaboration/fetchProject.json', "POST", false, true, "json", data, errorCallCollaboration, projectBranchAjax);
}

function projectBranchAjax(response) {
	if(response.project.error == null){
		$.each(response.project, function (idx, branch) {
			defaultBranch = branch[0];
			openProject(defaultBranch);
			$.each(branch, function (i, branchId) {
				$('#dropdown-branch').append('<li><a href="#" onclick="openProject(\'' + branchId + '\');">' + branchId + '&nbsp; &nbsp;</a></li>');
			});
		});
	} else {
		bootbox.alert(response.project.error);
	}
}
/** @Function Name  : fetchDescription()
 * @Description     : fetches Description for a project
 * @param           :
 * @returns         :
 * */

function fetchDescription() {
    var data = {
        repoName: repositoryName,
        projectName: projectName
    }
    sendAjaxCall('../collaboration/fetchProjectInfo.json', "POST", false, true, "json", data, errorCallCollaboration, fetchDescriptionAjax);
}

function fetchDescriptionAjax(data) {
    if (data.description != null) {
	$('#description').empty();
        $('#description').append('<p>' + data.description + '</p>');
    }
	$('#contributors-list').empty();
    $.each(data.contributors, function (idx, value) {
        $('#contributors-list').append('<div class="itemdiv memberdiv"><div class="user"><img src="images/avatar2.png"></img></div><div class="body"><div><a>' + value + '</a></div></div></div>');
    });
}
/** @Function Name  : fetchResources()
 * @Description     : fetch the resources of a project
 * @param           : repoName,projectName, branch ,path
 * @returns         : branchs
 * */

function fetchResources(path) {
    var newpath;
    var data = {
        repoName: repositoryName,
        projectName: projectName,
        branch: currentBranch,
        path: path
    }
    sendAjaxCall('../collaboration/fetchResources.json', "POST", false, true, "json", data, errorCallCollaboration, fetchResourcesAjax);
    $('#source-table').empty();
    if (pathIndex != 0) {
		templateHtml = $('#sources_template').clone();
		templateHtml.find('.source_row').empty().html('<a href="#" ><i class="icon-reply"></i></a>');
		templateHtml.find('.source_row').attr('onclick','backFolder();');
		templateHtml.find('a[title="Documentation"]').parent().remove();
		templateHtml.find('.documentation').parent().remove();
		templateHtml.find('.comments').parent().remove();
		templateHtml.removeAttr('id');
		$('#source-table').append(templateHtml);
    }
}

function fetchResourcesAjax(response) {
	var templateHtml;
    $.each(response.resources, function (idx, source) {
        if (source.hasChild == "yes") {
            var newpath = source.path;
            var nn = newpath.replace(/\\/g, '\\\\');
			templateHtml = $('#sources_template').clone();
			templateHtml.find('.source_row span:first-child').html('<i class="icon-folder-close"></i>&nbsp;'+idx);
			templateHtml.find('.source_row').attr('onclick','tempFolder("' + nn + '","'+idx+'");');
			templateHtml.find('.source_row').css('cursor','pointer');
			templateHtml.find('a[title="Documentation"]').parent().remove();
			templateHtml.find('.documentation').parent().remove();
			templateHtml.find('.comments').parent().remove();
			templateHtml.removeAttr('id');
			$('#source-table').append(templateHtml);
        } else {
            if (idx.indexOf(".bpm") > 0) {
                templateHtml = $('#sources_template').clone();
				templateHtml.find('.source_row span:first-child').append(idx);
				templateHtml.find('a[title="Documentation"]').attr('href','#documentation'+idx.replace(/\./gi, ""));
				templateHtml.find('a[title="Documentation"]').attr('onclick','openFile("' + idx + '","SVG");');
				templateHtml.find('a[title="Comments"]').attr('href','#comments'+idx.replace(/\./gi, ""));
				templateHtml.find('a[title="Comments"]').attr('onclick','openFile("' + idx + '","comments");');
				templateHtml.find('a[title="Download"]').empty();
				templateHtml.find('.documentation').parent().remove();
				templateHtml.find('.comments').parent().attr('id','comments'+idx.replace(/\./gi, ""));
				templateHtml.removeAttr('id');
				$('#source-table').append(templateHtml);
            }
            else if(idx.indexOf(".gi") > 0)
            {
				templateHtml = $('#sources_template').clone();
				templateHtml.find('.source_row span:first-child').append(idx);
				templateHtml.find('a[title="Documentation"]').attr('href','#documentation'+idx.replace(/\./gi, ""));
				templateHtml.find('a[title="Documentation"]').attr('onclick','openFile("' + idx + '","documentation");');
				templateHtml.find('a[title="Comments"]').attr('href','#comments'+idx.replace(/\./gi, ""));
				templateHtml.find('a[title="Comments"]').attr('onclick','openFile("' + idx + '","comments");');
				templateHtml.find('a[title="Download"]').empty();
				templateHtml.find('.documentation').parent().attr('id','documentation'+idx.replace(/\./gi, ""));
				templateHtml.find('.comments').parent().attr('id','comments'+idx.replace(/\./gi, ""));
				templateHtml.removeAttr('id');
				$('#source-table').append(templateHtml);
			}
            else if(idx.indexOf(".xsd") > 0  || idx.indexOf(".sql") > 0 || idx.indexOf(".wsdl") > 0 || idx.indexOf(".gi") > 0 || idx.indexOf(".xsl") > 0 ){ 
				templateHtml = $('#sources_template').clone();
				templateHtml.find('.source_row span:first-child').append(idx);
				templateHtml.find('a[title="Documentation"]').attr('href','#documentation'+idx.replace(/\./gi, ""));
				templateHtml.find('a[title="Documentation"]').attr('onclick','openFile("' + idx + '","documentation");');
				templateHtml.find('a[title="Comments"]').attr('href','#comments'+idx.replace(/\./gi, ""));
				templateHtml.find('a[title="Comments"]').attr('onclick','openFile("' + idx + '","comments");');
				templateHtml.find('a[title="Download"]').attr('onclick','openFile("' + idx + '","download");');
				templateHtml.find('.documentation').parent().attr('id','documentation'+idx.replace(/\./gi, ""));
				templateHtml.find('.comments').parent().attr('id','comments'+idx.replace(/\./gi, ""));
				templateHtml.removeAttr('id');
				$('#source-table').append(templateHtml);
			}
			else if(idx.indexOf(".xml") > 0)
			{
				templateHtml = $('#sources_template').clone();
				templateHtml.find('.source_row span:first-child').append(idx);
				templateHtml.find('a[title="Documentation"]').empty();
				templateHtml.find('a[title="Comments"]').attr('href','#comments'+idx.replace(/\./gi, ""));
				templateHtml.find('a[title="Comments"]').attr('onclick','openFile("' + idx + '","comments");');
				templateHtml.find('a[title="Download"]').attr('onclick','openFile("' + idx + '","download");');
				templateHtml.find('.documentation').parent().remove();
				templateHtml.find('.comments').parent().attr('id','comments'+idx.replace(/\./gi, ""));
				templateHtml.removeAttr('id');
				$('#source-table').append(templateHtml);
			}
			else {
				templateHtml = $('#sources_template').clone();
				templateHtml.find('.source_row span:first-child').html('<i class="icon-file"></i>&nbsp;'+idx);
				templateHtml.find('a[title="Documentation"]').parent().remove();
				templateHtml.find('.documentation').parent().remove();
				templateHtml.find('.comments').parent().remove();
				templateHtml.removeAttr('id');
				$('#source-table').append(templateHtml);
            }
        }
    });
}

function tempFolder(path,name) {
    pathIndex++;
    fetchResources(path);
    pathArray.push(path);
	folderArray.push(name);
}

function backFolder() {
    if (pathIndex <= 0) {
        fetchResources();
    } else {
        pathIndex--;
        fetchResources(pathArray[pathIndex - 1]);
        pathArray.pop();
		folderArray.pop();
    }
}

/** @Function Name  : loadMore() 
 * @Description     : Loads more commits from server
 * @param           :
 * @returns         :
 * */

function loadMore() {
    fetchCommits(endingCommit);
}

function loadMoreCommits() {
    fetchCommitFiles(endingCommitProject);
}
/** function for animating to top of the page */
$('#btn-scroll-up').click(function () {
    $('body,html').animate({
        scrollTop: 0
    }, 800);
});


var accordionCheck=0;
var currentDocumentation;
function openFile(path, flag) {
    var data = {
        repoName: repositoryName,
        projectName: projectName,
        branch: currentBranch,
        resourceName: path
    }
    if (flag == "documentation") {
		data.resourceName=folderPath() + path;
		currentDocumentation = $('#documentation' + path.replace(/\./gi, '')).find('.accordion-inner');
		sendAjaxCall('../collaboration/showDocumentation.json', "POST", false, true, "json", data, errorCallCollaboration, showDocumentation);
		sendAjaxCall('../collaboration/fetchResource.json', "POST", false, true, "json", data, errorCallCollaboration, function(response){
		$('#comments' + response.resource).removeClass('in');
		$('#comments' + response.resource).css('height', '0');  
		$('#documentation' + path.replace(/\./gi, '')).attr('id','documentation' + response.resource );
		$('a[href=#documentation'+path.replace(/\./gi, '')+']').attr('href','#documentation' + response.resource);
		accordionCheck = 1;
		});
    } else if (flag == "download"){	   
		path = folderPath() + path;
        window.location.href = "../collaboration/fileDownload?repoName=" + repositoryName + "&projectName=" + projectName + "&branchName=" + currentBranch + "&resourceName=" + path + "";
		}
    else if (flag == "SVG"){
		data.resourceName=folderPath() + path;	
        sendAjaxCall('../collaboration/showSVG.json', "POST", false, true, "xml", data, errorCallCollaboration, function(response){
		if(response.error==null){
			showSVG(response,path);
			} else {
			bootbox.alert(response.error);
			}
		});
		}
    else if (flag == "comments") {
		data.resourceName=folderPath() + path;
		sendAjaxCall('../collaboration/fetchResource.json', "POST", false, true, "json", data, errorCallCollaboration, function(response){
		if(response.error==null){
		$('#documentation' + response.resource).removeClass('in');
		$('#documentation' + response.resource).css('height', '0');
		currentDocumentation = $('#comments' + path.replace(/\./gi, '')).find('.accordion-inner');
		$('#comments' + path.replace(/\./gi, '')).attr('id','comments' + response.resource );
		$('a[href=#comments'+path.replace(/\./gi, '')+']').attr('href','#comments' + response.resource);
		currentDocumentation.empty();
		currentDocumentation.append(showCommentsHtml("333", "comments" + response.resource).show());
		accordionCheck = 2;
		} else {
			bootbox.alert(response.error);
		}
		});
		}
	else if (flag == "tableComments"){
		var tempPath=path.replace('.','');
		tempPath=tempPath.replace(/\//g, '');
		data.resourceName=path;
		sendAjaxCall('../collaboration/fetchResource.json', "POST", false, true, "json", data, errorCallCollaboration, function(response){
		if(response.error==null){
			if($('#lock_table').find('#'+tempPath).length >0){
				$('#lock_table').find('#'+tempPath).attr('id',response.resource);
				$('#lock_table').find('a[href=#tableComments'+tempPath+']').attr('href','#tableComments'+response.resource);
				$('#lock_table').find('#'+response.resource).after('<tr class="comments-row"><td colspan = "4"><div id="tableComments'+response.resource+'" class="accordion-body collapse"><div class="accordion-inner comments"></div></div></td></tr>');
				$('#lock_table').find('#tableComments'+response.resource).addClass('in');
			}
			currentDocumentation = $('#tableComments' + response.resource).find('.accordion-inner');
			currentDocumentation.empty();
			currentDocumentation.append(showCommentsHtml("333", "tableComments" + response.resource).show());
			if(lockCheck){
				$('#lock_table').find('#'+response.resource).next().hide(600);
				lockCheck=0;
			} else{
				$('#lock_table').find('#'+response.resource).next().show();
				lockCheck=1;
			}
		} else {
			bootbox.alert(response.error);
			}
		});
	}
	else if (flag == "projectComments"){
		currentDocumentation=$('#comments'+path).find('.accordion-inner');
		currentDocumentation.empty();
		currentDocumentation.append(showCommentsHtml("333", "comments" + path).show());
	}
	else if(flag=="zipDownload") {
		window.location.href = "../collaboration/fileDownload?repoName="+repositoryName+"&projectName="+projectName+"&tagName="+path.replace(/\_/g," ")+".zip";
		}

}
var lockCheck=0;
function  folderPath(){
		var newPath='';
		if(folderArray.length !=0){
				$.each(folderArray,function(idx,value){
					newPath += value +'/';
				});
		}
		return newPath ;
}

function showDocumentation(data){
currentDocumentation.empty();
currentDocumentation.append('<span class="orange">Documentation</span><br>');
if(data.documentation !=undefined && data.documentation.Content!=undefined)
	currentDocumentation.append(data.documentation.Content);
else if(data.documentation !=undefined)
	currentDocumentation.append(data.documentation);
}

function showSVG(data,fileName){
 $('#svg_container').empty();
 $('#svg-description').addClass('hide');
 var svgFile=$(data).find('svg').clone();
 $('#showSVG').find('#fileName').html(fileName);
 modalShow('showSVG');
 $('#showSVG').css('width',$( window ).width()*0.9);
 $('#showSVG').css('margin-left',$( window ).width()*0.05);
 $('#svg_container').append(svgFile);
 $('#svgInfo').empty();
}

$('#zoom-in').click(function () {
	 $("#testing svg").attr('width',$("#testing svg").attr('width') * 1.2);
	 $("#testing svg").attr('height',$("#testing svg").attr('height') * 1.2);
});
$('#zoom-out').click(function () {
	$("#testing svg").attr('width',$("#testing svg").attr('width') * 0.85);
	$("#testing svg").attr('height',$("#testing svg").attr('height') * 0.85);
});

function executeEvent(evt)  {
	$('#svg-description').removeClass('hide');
	$('#svgInfo').empty();
	var object = $(evt.target);	
    if(object.attr("xml:space")){
		object.css('fill','blue');
	    $('#svgInfo').append(object.attr('bpmn:activity-documentation'));
	}
	else{
		$('#svgInfo').append(object.attr('bpmn:activity-documentation'));
		object.css('fill','#87B87F');
		if(previousSVGevt != null){
			previousSVGevt.css('fill','white');
		}
		previousSVGevt = object;
	} 
}
/** function for aligning columns in the page on screen size change */

function alignColumn() {
    var wid = $(window).width();
    if (wid > 770 & wid < 1170) {
        $('#collb-column1').width(450);
    }
    if (wid < 770) {
        $('#collb-column2').css('float', 'none');
    }
}

function editDescription()
{
	var description = $("#description p").text();
	$("#description p").remove();
	if($("#description textarea")[0]==undefined)
		$("#description").append("<textarea id='descriptionText' maxlength='400' id='form-field-8' class='form-control'>"+description+"</textarea><button onclick='javascript:updateDescription()'class='pull-right btn btn-success btn-xs' type='button'>Update</button>")
}

function updateDescription()
{
	var data = {
		repoName   : repositoryName,
		projectName: projectName,
		description: $("#descriptionText").val()
	}
	sendAjaxCall('../collaboration/updateDescription.json', "POST", false, true, "json", data, errorCallCollaboration, updateDescriptionSuccess);
}

function updateDescriptionSuccess(data)
{
	$("#descSuccessMessage").text(data.message).removeClass("hide");
	setTimeout(function () {
        $("#descSuccessMessage").addClass('hide');
    }, 4000);
	fetchDescription();
}

function tagDelete(tagName)
{
	var data = {
		repoName   : repositoryName, 
		projectName: projectName,
		tagName    : tagName
	}
	sendAjaxCall('../collaboration/deleteTag.json', "POST", false, true, "json", data, errorCallCollaboration, tagDeleteSuccess);
}

function errorCallCollaboration(e)
{
	if(e!=null && e.status!=null && e.status!="")
		bootbox.alert(defaults.errorInGettingJSONData+" Status = "+ e.status + " " + defaults.afterMessage);
	else
		bootbox.alert(defaults.errorInGettingJSONData+" " +defaults.afterMessage);
}
function tagDeleteSuccess(data)
{
    $('#success-msg').removeClass('hide');
	fetchTags();
	setTimeout(function () {
		$('#success-msg').addClass('hide');
	},4000);
	
}

function clearSearch()
{
	$("#repoSearch").val("-1");
	$("#projectsearch").val("-1");
	$("#collaboratorSearch").val("-1");
	$("#searchCommits").empty();
}

function openSourcesTab(){
    fetchResources();
}
function openLockTab(){
	fetchLockFiles();
}
function openCommentsTab(){
	fetchCommitFiles(0);
}
defaults = {
    noProjectsInRepository: "Empty repository",
    noFileIsLocked: "No file is locked in this project!!",
    errorInGettingJSONData: "Error occured in getting json data",
    afterMessage:"Please check the log file for error",
	selectRepository:"please select a Repository",
	selectProject:"please select a project",
	selectCollaborator:"please select a collaborator"
}
