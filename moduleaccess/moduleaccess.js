/**
 * Copyright (C) 2005, Intalio Inc.
 *
 * The program(s) herein may be used and/or copied only with
 * the written permission of Intalio Inc. or in accordance with
 * the terms and conditions stipulated in the agreement/contract
 * under which the program(s) have been supplied.
 */
var insertArray = new Array();
var deleteArray = new Array();
var nestCheck = 1;
var parentId;
var elements = {};
var mElements = {};
var listIndex = {};
var childList = {};
var parentCheck;
var lastChild;
var lastChildId;
var subMenuCheck; 

$(document).ready(function () {
    var data = {
        actionName: "getRoles"
    }
    sendAjaxCall("../monitoring/rbacAdmin.htm", "POST", false, true, "json", data, errorCall, createOptions);
    $("#rolesCombo").bind("change", function () {
		if($("#rolesCombo").val() != 'select'){
        var data = {
            action: "getSelectedModuleAccess",
            role: $("#rolesCombo").val()
        }
        sendAjaxCall("moduleAccess.json", "POST", false, true, "json", data, errorCall, createTableData);
		} else {
			$('ol#module-list li').remove();
		}
    });

});

function createOptions(data) {
    var option;
    $('#rolesCombo option:not(:first)').remove();
    option = $('<option/>');
    option.attr('value', "").text("");
    $.each(data.properties, function (key, value) {
        option = $('<option/>');
        option.attr('value', key).text(key);
        $('#rolesCombo').append(option);
    });
    $('#rolesCombo').css('display', 'block');
    $('#rolesCombo').chosen();
    $('#rolesCombo_chzn').css('width', '260');
}

function errorCall(exception) {
	bootbox.alert(defaults.errorInGettingJSONData+e);
	return false;
}

/** @Function Name  : createTableData() 
 * @Description     : Create menu list li
 * @param           : json data
 * @returns         :
 * */

function createTableData(data) {
    var checkParent = 0;
    var checkSubList = 0;
    $('ol#module-list li').remove();
    $.each(data.modules, function (key, value) {
        var name = value.moduleName.charAt(0).toUpperCase() + value.moduleName.slice(1);
        var nameId = value.moduleName.replace(/\ /g, "_");
        if (value.parent == null) {
            if (checkParent) {
                $('ol#module-list li:last-child ol#subList').remove();
            }
            $('ol#module-list').append(getTemplate(4, value.id, name));
            $('#' + value.id + ' div.dd-handle').empty();
            $('#' + nameId + ' i:first').clone().appendTo('#' + value.id + ' div.dd-handle');
            $('#' + value.id + ' i:first').addClass('bigger-150');
            parentId = value.id;
            elements[parentId] = [];
            checkSubList = 1;
            checkParent = 1;
        } else { 
			if (lastChild == value.parent){
				if (subMenuCheck){
					mElements[lastChildId] = [];
					$('li#'+lastChildId).append(getTemplate(6, lastChildId, name));
					$('li#' + lastChildId + ' div.dd2-content:first').prepend(getTemplate(1, lastChildId, ''));
					subMenuCheck = false;
				}
				if(name.indexOf('monitoring') > 1){
					name = name.replace('monitoring','');
				}
				if(name.indexOf('auditing') > 1){
					name = name.replace('auditing','');
				}
				$('ol#module-list ol#subList' + lastChildId).append(getTemplate(5, value.id, name));
				mElements[lastChildId].push(value.id);
			} else {
				lastChildId = null;
				$('ol#module-list ol#subList' + parentId).append(getTemplate(5, value.id, name));
				elements[parentId].push(value.id);
				childList[value.id] = [];
				childList[value.id].push(parentId);
				if (checkSubList) {
					$('li#' + parentId + ' div.dd2-content:first').prepend(getTemplate(1, parentId, ''));

					checkSubList = 0;
				}
				
				lastChild = value.moduleName;
				lastChildId = value.id;
				subMenuCheck = true;
			}
			checkParent = 0;
        }
        listIndex[value.id] = 1;
    });
    if (checkParent) {
        $('ol#module-list li:last-child ol#subList').remove();
    }
    populateModuleAccess(data);
    $('ol#module-list').append(getTemplate(3, '', ''));
}




/** @Function Name  : getTemplate() 
 * @Description     : returns html content as required
 * @param           : caseid, id, module name
 * @returns         : html
 * */

function getTemplate(caseid, id, module) {
    var html;
    switch (caseid) {
    case 1:
        html = '<a class="accordion-toggle" data-toggle="collapse" href="#a' + id + '" style="text-decoration:none;"><i class="bigger-120 icon-angle-right"></i></a> &nbsp;';
        return html;
        break;
    case 2:
        html = "<tr><td>" + id + "</td><td>" + module + "</td><td></td></tr>";
        return html;
        break;
    case 3:
        html = '<li class="dd-item dd2-item"><div class=""><br><center><a onclick="javascript:updateAccess();"class="btn btn-primary btn-sm ">'+defaults.saveModuleState+'</a></center></div></li>';
        return html;
        break;
    case 4:
        html = '<li class="dd-item dd2-item" id="' + id + '"><div class="dd-handle dd2-handle"></i></div><div class="dd2-content"> ' + module + '<label class="pull-right inline" id="checkboxId"><input  type="checkbox" onclick="javascript:updateArray(this.checked,' + id + ');" class="ace ace-switch ace-switch-5" /><span class="lbl"></span></label></div><div id="a' + id + '" class="accordion-body collapse"><ol class="dd-list" id="subList' + id + '"></ol></div></li>';
        return html;
        break;
    case 5:
        html = '<li class="dd-item dd2-item " id="' + id + '"><div class="dd-handle dd2-handle "><i class="icon-double-angle-right"></i></div><div class="dd2-content">' + module + '<label class="pull-right inline" id="checkboxId"><input  type="checkbox" onclick="javascript:updateArray(this.checked,' + id + ',' + parentId + ',' + lastChildId +');" class="ace ace-switch ace-switch-5" /><span class="lbl"></span></label></div></li>';
        return html;
        break;
    case 6:
		html = '<div id="a' + id + '" class="accordion-body collapse"><ol class="dd-list" id="subList' + id + '"></ol></div>';
		return html;
        break;
    default:
        html = "";
    }
}
/** @Function Name  : populateModuleAccess() 
 * @Description     : Upadates the checkboxs as per data
 * @param           : data
 * @returns         :
 * */

function populateModuleAccess(data) {
    $.each(data.moduleAccessList, function (id, value) {
        $.each(value, function (id, mod) {
            $('li#' + mod.id + ' input:first').attr('checked', 'checked');
            if (mod.parent != null) {
                $('li#' + childList[mod.id] + ' input:first').attr('checked', 'checked');
            }
        });
    });
    updateParent(mElements);
    updateParent(elements); 
}
/** @Function Name  : updateParent() 
 * @Description     : Update parent module when all children unchecked
 * @param           :
 * @returns         :
 * */

function updateParent(arr) {
    $.each(arr, function (index, parent) {
        parentCheck = 0;
        if (parent.length != 0) {
            $.each(parent, function (id, child) {
                if ($('li#' + child + ' input:first').prop('checked') == true) {
                    parentCheck++;
                }
            });
            if (parentCheck == 0) {
                $('li#' + index + ' input:first').removeAttr('checked');
            }
        } 
    });
}
/** @Function Name  : updateParentOnClick() 
 * @Description     : Update parent when all childs are un checked
 * @param           : parentID
 * @returns         :
 * */

function updateParentOnClick(parentID,check) {
	var parent;
	if (check ==  1)
		parent = elements[parentID];
    else if (check ==  2)
		parent = mElements[parentID];
    parentCheck = 0;
    if (parent != null) {
        $.each(parent, function (id, child) {
            if ($('li#' + child + ' input:first').prop('checked') == true) {
                parentCheck++;
            }
        });
        if (parentCheck == 0) {
            $('li#' + parentID + ' input:first').removeAttr('checked');
            deleteFunction(parentID);
        }
    }

}
/** @Function Name  : updateArray() 
 * @Description     : Update arrays insertArray,deleteArray which are checked and unchecked
 * @param           : checked, id, parentID
 * @returns         :
 * */

function updateArray(checked, id, parentID,mParentId) {
    if (checked) {
        if (parentID != null) {
            if ($('li#' + parentID + ' input:first').prop('checked') != true) {
                $('li#' + parentID + ' input:first').prop('checked', 'checked');
            }
			insertFunction(parentID);
       }
       if(mParentId != null){
		   if ($('li#' + mParentId + ' input:first').prop('checked') != true) {
					$('li#' + mParentId + ' input:first').prop('checked', 'checked');
			}
			insertFunction(mParentId);
		}
		insertFunction(id);              
    } else {
		$('li#' + id + ' input:first').removeAttr('checked');
		deleteFunction(id); 
		if (mElements[id] != null) {			
			checkBoxUpdate(mElements[id]);
		}
		if (mParentId != null) {
			updateParentOnClick(mParentId,2);
		}
        if (elements[id] != null) {
            checkBoxUpdate(elements[id]);
        }
        if (parentID != null) {
			updateParentOnClick(parentID,1);
		}  
    }
}
function checkBoxUpdate(arr){
	$.each(arr, function(j,val){
		if ($('li#' + val + ' input:first').prop('checked') == true ){
			deleteFunction(val);
			$('li#' + val + ' input:first').removeAttr('checked');
		}
		if (mElements[val] != null){
			checkBoxUpdate(mElements[val]);
		} 
	});
}
function deleteFunction(id){
	if ($.inArray(parseInt(id), deleteArray) == -1) {
				if ($.inArray(parseInt(id), insertArray) == -1) {
					deleteArray[deleteArray.length] = parseInt(id);
				} else {
					insertArray.splice($.inArray(parseInt(id), insertArray), 1);
					deleteArray[deleteArray.length] = parseInt(id);
				}
			}
}
function insertFunction(id){
   if ($.inArray(parseInt(id), insertArray) == -1) {
            if ($.inArray(parseInt(id), deleteArray) == -1) {
                insertArray[insertArray.length] = parseInt(id);
            } else {
                deleteArray.splice($.inArray(parseInt(id), deleteArray), 1);
                insertArray[insertArray.length] = parseInt(id);
            }
        }
}
/** @Function Name  : updateAccess() 
 * @Description     : Uadate the changings in the checkboxs in database
 * @param           :
 * @returns         :
 * */

function updateAccess() {
    var data = {
        action: "updateModuleAccess",
        moduleid_insert: insertArray,
        moduleid_delete: deleteArray,
        role: $("#rolesCombo").val()
    }
    sendAjaxCall("moduleAccess.json", "POST", false, true, "json", data, errorCall, successUpdateAccess);
    insertArray = [];
    deleteArray = [];
}

function successUpdateAccess(data) {
    bootbox.alert("<h5>" + data.modules.charAt(0).toUpperCase() + data.modules.slice(1) + "</h5>");
}
/** function for animating to top of the page */
$('#btn-scroll-up').click(function () {
        $('body,html').animate({
            scrollTop: 0
        }, 800);
 });
 
 
defaults = {
    errorInGettingJSONData : "Error occured in getting json data",
	saveModuleState : "Save"
	
}
