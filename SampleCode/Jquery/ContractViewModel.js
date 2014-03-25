/// <reference path = "jquery-1.7.1-vsdoc.js" />
var selectedContractTab = "";
var ContractData, ContractDataCopy, cDataBs, acWorkItem = null, tdWorkItem = null;
var stWorkItem = null, usWorkItem = null, flWorkItem = null, doWorkItem = null;
var permissions = null;
var role = null;
var isModified = false;
var columnsHiddenItem = false;
var cancelChangesAppMode = false;
var getEventTypesForItemsTab = false;

var deletedContractAlerts = [];
var deletedContractAuthEntities = [];
var contractID = null;
var deletedContractFields = [];

//var parentContractsIDList = []; // Not used it yet, but will be used soon.
var combinedContractTodos = [];
var combinedContractAuthEntities = [];
var combinedContractFields = [];
var DocumentList = [];
var actID = 0;
var addactbtnID;
var docID = 0;
var addDocbtnID;
var usrID = 0;
var addusrbtnID;
var addmultipleDocs = [];
var addmultipleAct = [];

var galleryImagedUploaded = [];
var ContrId = null;
var selectedFieldGroupTabID = "";

var displayParentRecords = false;

var initialheight = 0; // Variable required to set initial height of the side tabs
var linkedCheck = false;

var contractOwnCacheTimestamp;

$(document).ready(function () {
    contractID = getURLParameter("contractID");
    //selectedRecordId = null; //On page refresh, the selected recordId of a grid need to be restored to default value(null);
    initCacheIfBlank(); // Initialize client side cache if it is blank.
    initEventBinding();
    initUi();
    initBindingSources();
    initGridProps();
    SelectTab("tabSummary");
    TopicId = "9a7cd955-409d-467e-b4fc-eccdc36c9623";
    getData(false);
});

function initEventBinding() {
    $('#btnPrefsEdit').button().live('click', function () {
        //        if (compareContractDisplayCacheTicks() == false) {
        //            buildUpdateCacheDialog(environmentVars.resx.UpdateContractStructureWhileContractEdit, function () {
        //                reFetchContract();
        //            }, 'center');
        //        }
        //        else {
        //            toggleContractEditMode(true);
        //            if (selectedContractTab == "tabSummary")
        //                SelectTab("tabProperties");
        //        }


        if (compareContractTimestamps(contractOwnCacheTimestamp, CacheTypes.Display) == true) {
            toggleContractEditMode(true);
            if (selectedContractTab == "tabSummary")
                SelectTab("tabProperties");
        }
    });

    $('#btnAddNewContract').button().live('click', function () {
        buildActionDialog("NewContractDialog", function () { CreateNewContract() }, null, false, "7d086925-4a36-4d44-a776-a9e51290be5b");
    });

    $('#btnCreateReport').button().live('click', function () {
        gotoReports();
    });

    $('#btnDeleteContract').button().live('click', function () {
        buildYesNoCancelDialog($("#DeleteContractDialog"), function () { deleteContract() }, null, null);
    });

    $('#btnCopyContract').button().live('click', function () {
        $("#cmbCopyContractType").val(ContractData.Properties.ContractTypeID);
        ccInit();
    });

    $('#btnShowParent').button().die('click');
    $('#btnShowParent').button().live('click', function () {
        //toggleParentContractRecordsVisibility(true);
        ShowWaitDialog();
        displayParentRecords = true;
        toggleParentContractRecordsVisibility();
    });

    $('#btnHideParent').button().die('click');
    $('#btnHideParent').button().live('click', function () {
        //toggleParentContractRecordsVisibility(false);
        ShowWaitDialog();
        displayParentRecords = false;
        toggleParentContractRecordsVisibility();
    });

    $('#btnPrefsSaveStay').button().live('click', function () {
        var dataTable = $('#divProperties');
        if (!validator.validate(dataTable))
            return;

        //        if (compareContractStructureCacheTicks() == false) {
        //            buildUpdateCacheDialog(environmentVars.resx.UpdateContractStructureWhileSave, function () { reFetchContract(); }, 'center');
        //        }
        //        else {
        if (compareContractTimestamps(contractOwnCacheTimestamp, CacheTypes.Structural) == true) {
            $('#btnPrefsSaveEnd, #btnPrefsCancelEdit, #btnPrefsSaveStay').button({ 'disabled': true });
            selectedRecordId = null; //For inactive enteries in combo's
            saveSingleFieldGroups();
            contractDataSave(false);
            //toggleContractEditMode(false, false);
            clearDeletedEnteries();
        }
    });

    $('#btnPrefsSaveEnd').button().live('click', function () {
        var dataTable = $('#divProperties, .SingleFieldGroups');
        if (!validator.validate(dataTable))
            return;

        //        if (compareContractStructureCacheTicks() == false) {
        //            buildUpdateCacheDialog(environmentVars.resx.UpdateContractStructureWhileSave, function () { reFetchContract(); }, 'center');
        //        }
        //        else {
        if (compareContractTimestamps(contractOwnCacheTimestamp, CacheTypes.Structural) == true) {
            $('#btnPrefsSaveEnd, #btnPrefsCancelEdit, #btnPrefsSaveStay').button({ 'disabled': true });
            selectedRecordId = null; //For inactive enteries in combo's
            saveSingleFieldGroups();
            contractDataSave(true);
        }
    });

    $('#btnPrefsCancelEdit').button().live('click', function () {
        //$('#btnPrefsSaveEnd, #btnPrefsCancelEdit, #btnPrefsSaveStay').button({ 'disabled': true });
        selectedRecordId = null; //For inactive enteries in combo's
        var test = checkModifications("#txtName_2, #txtDescription_2,#selParentContractName_2, #selStatusName_2, #selDisplayCurrencyName_2");
        if (test)
            buildYesNoCancelDialog($("#CancelWarningDialog"), function () { cancelAddEdits() }, null, null);
        else
            cancelAddEdits();
    });
    $('#Tab_Help').live("click", function () {
        if (TopicId == null)
            TopicId = "2c27f837-209a-411c-b5b0-f5acdbc34dc2";
        var URL = urlHelp + environmentVars.culture + "?topic=html/" + TopicId + ".htm";
        window.open(URL, "_newtab");
    });
    initAcEventBinding();
    initTdEventBinding();
    initUsEventBinding();
    initFlEventBinding();
    initDoEventBinding();
    initPrEventsBinding();
    initCgEventsBinding();
}
function initUi() {
    $("#Tab_Contracts").css("background-image", "url('" + eContractsImagePath + "Contracts_Selected.jpg')");
    $('#btnDeleteContract').button({ 'disabled': !(environmentVars.user.deleteContracts) });
    $('#btnAddNewContract').button({ 'disabled': !(environmentVars.user.addContracts) });
    $('#btnCopyContract').button({ 'disabled': !(environmentVars.user.addContracts) });
}

function checkModifications(selectors) {
    var result = isModified;
    var container = selectors;
    if (typeof (container) != 'object')
        container = $(selectors);

    if (container == null)
        return null;

    $.each(container, function (i, cont) {
        cont = $(cont);
        if (result || cont.val() != cont.attr('orgVal')) {
            result = true;
        }
        else {
            result = false;
        }
    });
    //Arkady - we compare two arrays of ContractData.Applications vs ContractDataCopy.Applications
    //ContractData.ContractApplications
    //ContractDataCopy.ContractApplications
    if (ContractData.ContractApplications != null && ContractDataCopy.ContractApplications != null) {
        if (ContractData.ContractApplications.length != ContractDataCopy.ContractApplications.length)
            result = true;
        else {
            $.each(ContractData.ContractApplications, function (i, app) {
                $.each(ContractDataCopy.ContractApplications, function (iCopy, appCopy) {
                    if (app.EntryId == appCopy.EntryId)
                        return false;
                    if (ContractDataCopy.ContractApplications.length == iCopy + 1)
                        result = true;
                });
                if (result)
                    return false;
            });
        }
    }
    return result;
}

function deleteContract() {
    ShowWaitDialog(environmentVars.resx.DeletingContract);

    $.ajax({
        type: 'POST',
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        url: urlDeleteContract,
        data: JSON.stringify({ "ContractID": ContractData.Properties.ContractID }),
        success: function (successData) {
            HideWaitDialog();
            if (successData.hasOwnProperty("ErrorCause")) //The function returned an error...
            {
                ShowErrorDialog(successData);
                return;
            }
            else {
                window.location.href = successData;
            }
        },
        error: function (jqXHR, errorStatus, errorThrown) {     // Error Clause added by Viplav on 12 August 2013
            var excTitle = getExeptionMessageFromjqXHR(jqXHR);
            HandleClientSideError(jqXHR.status, errorThrown, excTitle, "ContractViewModel", "deleteContract");
        }
    });
}

function SelectTab(selectedTab) {

    var relDivName = "";
    if (selectedContractTab != "") {
        $("#" + selectedContractTab).parent().find("td:eq(0)").removeClass("vertical_tab_Selected_left");
        $("#" + selectedContractTab).parent().find("td:eq(2)").removeClass("vertical_tab_Selected_edge");
        $("#" + selectedContractTab).parent().find("td:eq(2)").addClass("vertical_tab_unselected_edge");
        $("#" + selectedContractTab).parent().find("td:eq(3)").removeClass("vertical_tab_Selected_right");
        $("#" + selectedContractTab).parent().find("td:eq(3)").addClass("vertical_tab_unselected_right");
        $("#" + selectedContractTab).removeClass("vertical_tab_Selected_middle");
        $("#" + selectedContractTab).addClass("vertical_tab_unselected");
        relDivName = "#div" + selectedContractTab.substr(3, selectedContractTab.length - 3);
        $(relDivName).hide();
    }

    $("#" + selectedTab).parent().find("td:eq(0)").addClass("vertical_tab_Selected_left");
    $("#" + selectedTab).parent().find("td:eq(2)").addClass("vertical_tab_Selected_edge");
    $("#" + selectedTab).parent().find("td:eq(2)").removeClass("vertical_tab_unselected_edge");
    $("#" + selectedTab).parent().find("td:eq(3)").addClass("vertical_tab_Selected_right");
    $("#" + selectedTab).parent().find("td:eq(3)").removeClass("vertical_tab_unselected_right");
    $("#" + selectedTab).removeClass("vertical_tab_unselected");
    $("#" + selectedTab).addClass("vertical_tab_Selected_middle");

    relDivName = "#div" + selectedTab.substr(3, selectedTab.length - 3);
    $(relDivName).show();

    selectedContractTab = selectedTab;
}

function initGridProps() {
    initContractActivitiesGridProps();

    if (contractTodosGrid != null) {
        $.each(contractTodosGrid.headers, function (i, value) {
            if (jQuery.inArray(i, [0, 1]) > -1)
                cDataBs.contractTodos.headers.push({ headerText: value, key: i + '', width: '70px' });
            else if (i == 4)
                cDataBs.contractTodos.headers.push({ headerText: value, key: i + '', width: '130px' });
            else
                cDataBs.contractTodos.headers.push({ headerText: value, key: i + '', width: 'auto' });
        });
        cDataBs.contractTodos.labels = contractTodosGrid.labels;
    }

    if (contractUsersGrid != null) {
        $.each(contractUsersGrid.headers, function (i, value) {
            if (i == 0)
                cDataBs.contractUsers.headers.push({ headerText: value, key: i + '', width: '70px' });
            else if (jQuery.inArray(i, [1, 3]) > -1)
                cDataBs.contractUsers.headers.push({ headerText: value, key: i + '', width: '150px' });
            else
                cDataBs.contractUsers.headers.push({ headerText: value, key: i + '', width: 'auto' });
        });
        cDataBs.contractUsers.labels = contractUsersGrid.labels;
    }

    // Mohit - Commented to display Contract Fields under Special Information tab basic edition.
    //if (license.AllowContractFields)
    if (contractFieldsGrid != null) {
        $.each(contractFieldsGrid.headers, function (i, value) {
            if (i == 0)
                cDataBs.contractFieldGroups.headers.push({ headerText: value, key: i + '', width: '70px' });
            else
                cDataBs.contractFieldGroups.headers.push({ headerText: value, key: i + '', width: 'auto' });
        });
        cDataBs.contractFieldGroups.labels = contractFieldsGrid.labels;
    }

    initContractDocsGridProps();

    if (contractGalleryImagesGrid != null) {
        $.each(contractGalleryImagesGrid.headers, function (i, value) {
            if (i == 0)
                cDataBs.contractGalleryImages.headers.push({ headerText: value, key: i + '', width: '70px' });
            else if (jQuery.inArray(i, [1]) > -1)
                cDataBs.contractGalleryImages.headers.push({ headerText: value, key: i + '', width: '120px' });
            else
                cDataBs.contractGalleryImages.headers.push({ headerText: value, key: i + '', width: 'auto' });
        });
        cDataBs.contractGalleryImages.labels = contractGalleryImagesGrid.labels;
    }

}

function getData(isRebindingAllGrids) {
    $('#btnPrefsEdit').button({ 'disabled': true });
    $('#btnCopyContract').button({ 'disabled': true });
    $('#btnDeleteContract').button({ 'disabled': true });
    $('#btnAddNewContract').button({ 'disabled': true });
    $.ajax({
        type: 'POST',
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        url: "GetData",
        //        data: null,
        data: JSON.stringify({ "contractID": contractID }),
        success: function (data) {
            if (data == null)
                return;

            if (data.hasOwnProperty("ErrorCause")) //The function returned an error...
            {
                ShowErrorDialog(data);
                return;
            }

            setContractFieldGroupsData(data.Contract);
            var cacheDataByKey = getCacheData(CacheKeys.ContractDataKeyName);
            contractOwnCacheTimestamp = cacheDataByKey.CacheTimeStamps;

            ContractData = data.Contract;
            permissions = data.Permissions;
            role = data.Role;
            initTabPermissions();
            initUIwithData();
            setDates();
            ContractDataCopy = new Object();
            if (ContractData.ParentContract != null) {
                LoadedContractHasParents = true;
                ParentsContractsInHierarchy = [];
                mergeParentContractsData(ContractData.ParentContract);
                removeUnecessaryParentContractData();
                //displayParentContractRecords = true;
                //$("#divHideParent").show();
                $("#divShowParent").show();
            }
            else {
                //displayParentContractRecords = false;
                $("#divShowParent, #divHideParent").hide();
            }
            $.extend(true, ContractDataCopy, ContractData);
            setContractProperties();
            setContractPropertiesSummary();
            if (ContractData.ChildContracts != null && ContractData.ChildContracts.length > 0) {
                ChildContracts();
            }
            else {
                $('#ChildContractTable').hide();
            }
            if (isRebindingAllGrids) {//in case of saving
                resetContractGrids();
                SelectTab(selectedContractTab);
                toggleContractEditMode(isEditMode);
            }
            else {//first time coming to contract
                setContractGrids();
                SelectTab("tabSummary");
                if (environmentVars.user.deleteContracts) {
                    $('#btnDeleteContract').button({ 'disabled': isEditMode });
                }
                if (environmentVars.user.addContracts) {
                    $('#btnAddNewContract').button({ 'disabled': isEditMode });
                    $('#btnCopyContract').button({ 'disabled': isEditMode });
                }
            }

            if (role.CanEdit == false)
                $('#btnPrefsEdit').button({ 'disabled': true });
            else
                $('#btnPrefsEdit').button({ 'disabled': false });

            if (startEdit)
                $('#btnPrefsEdit').trigger("click");
            else
                toggleContractApps(isEditMode); //changed from false

            hideUnauthorizedSummaryGrids();

            showCompletionMsgs();
        },
        error: function (jqXHR, errorStatus, errorThrown) {     // Error Clause added by Viplav on 12 August 2013
            var excTitle = getExeptionMessageFromjqXHR(jqXHR);
            HandleClientSideError(jqXHR.status, errorThrown, excTitle, "ContractViewModel", "getData");
        },
        complete: function (jqXHR, textStatus) {
            $("#waitContract").hide();
            //            $('#btnCopyContract').button({ 'disabled': !(environmentVars.user.addContracts) });
            //            $('#btnDeleteContract').button({ 'disabled': !(environmentVars.user.deleteContracts) });
            //            $('#btnAddNewContract').button({ 'disabled': !(environmentVars.user.addContracts) });
        }
    });

}

function mergeParentContractsData(ContractData) {
    ParentsContractsInHierarchy.unshift(ContractData);
    //    $.merge(combinedContractActivities, (ContractData.ContractActivities != null ? ContractData.ContractActivities : []));
    //    $.merge(combinedContractTodos, (ContractData.ContractTodos != null ? ContractData.ContractTodos : []));
    //    $.merge(combinedContractFields, (ContractData.ContractFieldGroups != null ? ContractData.ContractFieldGroups : []));
    //    $.merge(combinedContractDocs, (ContractData.ContractDocs != null ? ContractData.ContractDocs : []));
    //    $.merge(combinedContractAuthEntities, (ContractData.ContractUsers != null ? ContractData.ContractUsers : []));
    if (ContractData.ParentContract != null) {
        //LoadedContractHasParents = true;
        //parentContractsIDList.push(ContractData.ParentContract.ID); // It is not used yet, but will be used soon.
        mergeParentContractsData(ContractData.ParentContract);
    }
}

function removeUnecessaryParentContractData() {
    for (var i = 0; i < ParentsContractsInHierarchy.length; i++) {
        delete ParentsContractsInHierarchy[i].ParentContract;
    }
}

function initUIwithData() {
    var pageTitle = "[#" + ContractData.Properties.ContractID + "] " + ContractData.Properties.Name;
    $("#AppHeader").text(pageTitle);
    $(document).attr('title', pageTitle);
    $("#AppHeaderExtension").text("[" + role.EntryTexts[0].DescShort + "]");
    if (role != null) {
        if (role.EditActivities == false) {
            $("#activitiesReadOnly").show();
        }
        if (role.EditApps == false) {
            $("#appsReadOnly").show();
        }
        if (role.EditDocs == false) {
            $("#docsReadOnly").show();
        }
        if (role.EditGallery == false) {
            $("#galleriesReadOnly").show();
        }
        if (permissions != null) {
            if (permissions.AllowEditFields == false) {
                $("#fieldsReadOnly").show();
            }
        }

        if (role.ViewGallery == false) {
            $("#accordion").hide();
        }

        if (role.EditProperties == false) {
            $("#propertiesReadOnly").show();
        }

        if (role.EditTodos == false) {
            $("#todosReadOnly").show();
        }
        if (role.EditAuth == false) {
            $("#usersReadOnly").show();
        }
    }
}

function initTabPermissions() {
    if (role.ViewProperties)
        $("#tabProperties").attr("class", "vertical_tab_unselected");
    if (role.ViewTodos)
        $("#tabAlerts").attr("class", "vertical_tab_unselected");
    if (role.ViewActivities)
        $("#tabEvents").attr("class", "vertical_tab_unselected");
    if (role.ViewAuth)
        $("#tabAuth").attr("class", "vertical_tab_unselected");
    if (role.ViewDocs)
        $("#tabDocs").attr("class", "vertical_tab_unselected");
    if (role.ViewGallery)
        $("#tabGallery").attr("class", "vertical_tab_unselected");
    if (role.ViewApps)
        $("#tabApps").attr("class", "vertical_tab_unselected");
    if (permissions.AllowViewFields)
        $("#tabFields").attr("class", "vertical_tab_unselected");

    $('#ContractTabs').find('.vertical_tab_unselected').live("click", function () {

        selectedRecordId = null; //When tab changes, the selected recordId of a grid need to be restored to default value(null);
        SelectTab($(this).attr("id"));

        if ($(this).parent().hasClass("advanceTab")) {
            selectedFieldGroupTabID = $(this).attr("id");
        }
        else {
            selectedFieldGroupTabID = "";
        }

        //Arkady - start 
        if ($(this).attr("id") == "tabEvents") {
            TopicId = "2c27f837-209a-411c-b5b0-f5acdbc34dc2";
        }
        if ($(this).attr("id") == "tabAlerts") {
            TopicId = "bbafdcf7-85cf-4b6e-b20d-f13befb568ca";
        }
        if ($(this).attr("id") == "tabAuth") {
            TopicId = "bbafdcf7-85cf-4b6e-b20d-f13befb568ca";
        }
        if ($(this).attr("id") == "tabDocs") {
            TopicId = "2c27f837-209a-411c-b5b0-f5acdbc34dc2";
        }
        if ($(this).attr("id") == "tabFields") {
            TopicId = "2c27f837-209a-411c-b5b0-f5acdbc34dc2";
        }
        if ($(this).attr("id") == "tabApps") {
            TopicId = "bbafdcf7-85cf-4b6e-b20d-f13befb568ca";
        }
        if ($(this).attr("id") == "tabProperties") {
            TopicId = "2c27f837-209a-411c-b5b0-f5acdbc34dc2";
        }
        //Arkady - end
    });

    $('#tabSummary').click(function () {
        SelectTab("tabSummary");
        TopicId = "2c27f837-209a-411c-b5b0-f5acdbc34dc2";
    });
}

function hideUnauthorizedSummaryGrids() {
    if (role.ViewTodos == false)
        $("#tblContractToDosSummGrid").hide();
    if (role.ViewActivities == false)
        $("#tblContractActivitiesSummGrid").hide();
    if (role.ViewAuth == false)
        $("#tblContractUsersSummGrid").hide();
    if (role.ViewDocs == false)
        $("#tblContractDocsSummGrid").hide();
    //    if (role.ViewApps)
    //        $("#tabApps").attr("class", "vertical_tab_unselected");
    if (permissions.AllowViewFields == false)
        $("#tblContractFieldsSummGrid").hide();
}

function setContractGrids() {
    var activitiesInitialized = initBsAc();

    var todosInitialized = initBsTd();

    var usersInitialized = initBsUs();
    //    if (usersInitialized)
    //    {
    renderCommonGrid("#usGrid", cDataBs.contractUsers);
    renderSummaryGrid('#usSummaryGrid', cDataBs.contractUsers, [0, 1]);
    //    }

    // Mohit - Commented to display Contract Fields under Special Information tab basic edition.
    //    if (license.AllowContractFields)
    //    {
    var fieldsInitialized = initBsFl();
    //}

    var docsInitialized = initBsDo();

    renderGalleries();
}

function resetContractGrids() {

    var activitiesInitialized = initBsAc();

    var todosInitialized = initBsTd();

    var usersInitialized = initBsUs();
    //    if (usersInitialized)
    //    {
    RebindCommonGrid("#usGrid", cDataBs.contractUsers);
    RebindContractSummaryGrid('#usSummaryGrid', cDataBs.contractUsers, [0, 1]);
    //    }

    // Mohit - Commented to display Contract Fields under Special Information tab basic edition.
    //    if (license.AllowContractFields)
    //    {
    var fieldsInitialized = initBsFl();
    //    }

    var docsInitialized = initBsDo();

    //setContractAppsTable(); //mark's line

    renderGalleries();
}

function cancelAddEdits() {
    /// <summary>Cancels all the changes done for adding, updating or deleting any entity in the contract.</summary>
    /// <param></param>
    /// <returns></returns>
    ContractData = new Object();
    $.extend(true, ContractData, ContractDataCopy);

    initBsAc();

    initBsTd();

    initBsUs();
    RebindCommonGrid('#usGrid', cDataBs.contractUsers);

    initBsFl();

    initBsDo();

    //re-cloning original object
    setContractProperties();

    toggleContractEditMode(false);

    isModified = false;

    clearDeletedEnteries();

    renderGalleries();

    if (selectedFieldGroupTabID != null && selectedFieldGroupTabID != undefined && selectedFieldGroupTabID != "")
        SelectTab(selectedFieldGroupTabID);
}

function handler(event, args) {
    if (isEditMode == true)
        toggleContractEditMode(true);
    else
        toggleContractEditMode(false);
}

function toggleContractEditMode(editable) {
    isEditMode = editable;
    if (role != null) {
        if (role.EditProperties) {
            setContractTextsEdit(editable);
            setContractCombosEdit(editable);
            editSingleFieldGroups(editable);
            $(".addEtFlds").button().die("click");
            $(".addEtFlds").button().live("click", function () {
                selectedRecordId = null; //On add click, the selected recordId of a grid need to be restored to default value(null);
                addactbtnID = $(this).data('fieldgroupid');
                acShowDialog({}, true, true);
            });
            $(".addDocFlds").button().die("click");
            $(".addDocFlds").button().live("click", function () {
                addDocbtnID = $(this).data('fieldgroupid');
                doShowDialog({}, true, true);
            });

            $(".resetSelectionSingle").button().die("click");
            $(".resetSelectionSingle").button().live("click", function () {
                $('input:radio[name=rdo_' + $(this).data('fieldgroupid') + ']').attr('checked', false);
            });
        }
    }

    if (editable) {
        $('#td_header_left').css("background-color", "#18d99f");
        $('#HeaderTopRight2').css("background-color", "#18d99f");

        $(".searchCatalogRecord").show();
    }
    else {
        $('#td_header_left').css("background-color", "#ffb801");
        $('#HeaderTopRight2').css("background-color", "#ffb801");

        $(".searchCatalogRecord").hide();
    }
    if (role != null) {
        if (role.AddActivities || role.EditActivities || role.DeleteActivities) {
            toggleAcEditMode(editable);
        }

        if (role.AddTodos || role.EditTodos || role.DeleteTodos) {
            toggleTdEditMode(editable);
        }

        if (role.EditAuth) {
            toggleUsEditMode(editable);
        }
        if (permissions != null) {
            if (permissions.AllowEditFields) {
                toggleFlEditMode(editable);
            }
        }
        if (role.AddDocs || role.EditDocs || role.DeleteDocs) {
            toggleDoEditMode(editable);
        }
        //Arkady - toggle ContractApplications mode. check the availability of role.EditApps, role.ViewApps, and permissions
        if (role.EditApps) {
            toggleContractApps(editable);
        }

        if (role.AddGallery || role.EditGallery || role.DeleteGallery) {
            toggleCgEditMode(editable);
        }
    }

    $('#btnPrefsSaveEnd, #btnPrefsCancelEdit, #btnPrefsSaveStay').button({ 'disabled': !editable }); //#btnPrefsSaveStay, 
    $('#btnPrefsEdit').button({ 'disabled': editable });


    if ($('#btnShowParent').is(":visible"))
        $('#btnShowParent').button({ 'disabled': editable });

    if ($('#btnHideParent').is(":visible"))
        $('#btnHideParent').button({ 'disabled': editable });

    if (environmentVars.user.deleteContracts) {
        $('#btnDeleteContract').button({ 'disabled': editable });
    }
    if (environmentVars.user.addContracts) {
        $('#btnAddNewContract').button({ 'disabled': editable });
        $('#btnCopyContract').button({ 'disabled': editable });
    }
    setLinkTarget(editable);
}

function contractDataSave(reload) {
    AddDeletedApplications(true); //temporarily add deleted applications with property Deleted=true - Arkady
    ShowWaitDialog(environmentVars.resx.SavingContract);

    if (role.EditProperties) {
        setContractTextsEdit(false);
    }
    updateContractProperties();
    if (role.EditProperties) {
        setContractTextsEdit(true);
    }
    //setContractCombosEdit(false);


    //    for (var member in cDataBs.Properties)
    //    {
    //        ContractData.Properties[member]=cDataBs.Properties[member];
    //    }
    $.ajax({
        type: 'POST',
        dataType: "json",
        async: true,
        contentType: "application/json; charset=utf-8",
        url: "SaveData",
        data: JSON.stringify({ "contract": ContractData }),
        success: function (successData) {
            if (successData != null && successData.hasOwnProperty("ErrorCause")) {//The function returned an error...
                ShowErrorDialog(successData);
                AddDeletedApplications(false); //in case of error remove also deleted applications - Arkady
                $('#btnPrefsSaveEnd, #btnPrefsCancelEdit, #btnPrefsSaveStay').button({ 'disabled': false });
                return;
            }
            else {
                if (reload) {
                    window.location.href = eContractsRootPath + "Contract/ViewMode?contractID=" + contractID;
                    /*window.location.reload();*/
                }
                else {
                    getData(true);
                }
            }
            //            $('#btnPrefsSaveEnd').button().unbind('click');
            //            $('#btnPrefsSaveStay').button().unbind('click');
            //            $('#btnPrefsCancelEdit').button().unbind('click');

            $('#btnPrefsSaveEnd, #btnPrefsCancelEdit, #btnPrefsSaveStay').button({ 'disabled': false });
        },
        error: function (jqXHR, errorStatus, errorThrown) {     // Error Clause added by Viplav on 12 August 2013
            var excTitle = getExeptionMessageFromjqXHR(jqXHR);
            HandleClientSideError(jqXHR.status, errorThrown, excTitle, "ContractViewModel", "contractDataSave");
        },
        complete: function (jqXHR, textStatus) {
            HideWaitDialog();
            AddDeletedApplications(false); //remove deleted application - Arkady
        }
    });
    clearDeletedEnteries();
}

function updateKeyFromNameInList(List, NameFromBs, IdFieldToUpdate) {
    if (NameFromBs == "" || NameFromBs == null)
        IdFieldToUpdate = null;

    $.each(List, function (i, lstItem) {
        if (lstItem.name == NameFromBs) {
            IdFieldToUpdate = lstItem.key;
            return false;
        }
    });
}

function getAppLinks(item, links, itemsList, applicationName) {
    var linkResult = null;
    if (item == null || links == null || links.length <= 0)
        return null;
    $.each(links, function (i, link) {
        if (link.Key == item.EntryId) {
            linkResult = jQuery('<a/>', {
                href: link.Value,
                text: applicationName,
                target: "_blank"
            });
            return false;
        }
    });

    return linkResult;

}

//#region #################### PROPERTIES ##############################

function setContractTextsEdit(editable) {

    if (editable) {
        editInPlace('#Name_2', true);
        editInPlace('#Description_2', true, 'textarea');
        $('#txtDescription_2').val(ContractData.Properties.Description);
        $('#txtName_2').val(ContractData.Properties.Name); //Resolved :When Sorting the Grids of Field Group contract name nullifies --Added by deepak dhamija(14/05/2013)
    }
    else {
        editInPlace('#Name_2, #Description_2', false);
    }
}

function setContractCombosEdit(editable) {
    /// <summary>to show the DDL's, if in edit mode, else labels for contract details</summary>
    /// <param name="editable">True: Edit mode, False: View mode</param>

    if (editable) {

        initCombo(sysTableName_Statuses, Statuses, '#StatusName_2', ContractData.Properties.StatusID);
        initCombo(sysTableName_Currencies, Currencies, '#DisplayCurrencyName_2', ContractData.Properties.DisplayCurrencyID);

        getContractsList(function (dataList) {
            var container = $('#ParentContractName_2');
            container.empty();
            //            var select = $('<select style="width:100%" orgVal="" />').attr('id', 'sel' + container.attr('id')).appendTo(container);
            //            $('<option />').attr('value', '').text('').appendTo(select);

            var dropdownHtml = "<select style='width:100%' orgVal='' id='sel" + container.attr('id') + "'>";
            dropdownHtml += "<option val=''></option>";

            $.each(dataList, function (i, item) {
                if (item.ContractID == ContractData.ID)
                    return;
                var isChild = false;
                if (ContractData.ChildContracts != null) {
                    isChild = getRecChildren(ContractData.ChildContracts, item.ContractID);
                }
                if (isChild == false) {
                    //var option = $('<option />').attr('value', item.ContractID).text(item.ContractName).appendTo(select);
                    // var setSelected=
                    dropdownHtml += "<option value='" + item.ContractID + "'";
                    if (item.ContractID == ContractData.Properties.ParentContractID)
                        dropdownHtml += "selected='selected'";
                    //                    option.attr('selected', 'selected');

                    dropdownHtml += ">" + item.ContractName + "</option>";
                }
            });
            dropdownHtml += "</select>";
            container.append(dropdownHtml);
            //select.attr('orgVal', $(select).val() != null ? $(select).val() : "");
        });
    }
    else {
        $('#ContractTypeName_2').html(ContractData.Properties.ContractTypeName);
        $('#ParentContractName_2').html(ContractData.Properties.ParentContractName);
        $('#StatusName_2').html(ContractData.Properties.StatusName);
        $('#DisplayCurrencyName_2').html(ContractData.Properties.DisplayCurrencyName);
    }
}

function setContractProperties() {

    $('#ContractID_1').html(ContractData.Properties.ContractID);
    $('#ParentContractName_1').html(ContractData.Properties.ParentContractName);
    $('#Name_1').html(ContractData.Properties.Name);
    $('#Description_1').html(ContractData.Properties.Description != null ? ContractData.Properties.Description.formatText() : null);
    $('#ContractTypeName_1').html(ContractData.Properties.ContractTypeName);
    $('#StatusName_1').html(ContractData.Properties.StatusName);
    $('#DisplayCurrencyName_1').html(ContractData.Properties.DisplayCurrencyName);

    $('#ContractID_2').html(ContractData.Properties.ContractID);
    $('#ParentContractName_2').html(ContractData.Properties.ParentContractName);
    $('#Name_2').html(ContractData.Properties.Name);
    $('#Description_2').html(ContractData.Properties.Description != null ? ContractData.Properties.Description.formatText() : null);
    $('#ContractTypeName_2').html(ContractData.Properties.ContractTypeName);
    $('#StatusName_2').html(ContractData.Properties.StatusName);
    $('#StatusName_2').attr('statusId', ContractData.Properties.StatusID);
    $('#DisplayCurrencyName_2').html(ContractData.Properties.DisplayCurrencyName);

    initSingleFieldGroups(false);
}

function setContractPropertiesSummary() {
    initSingleFieldGroups(true);
}

//Viplav
function ChildContracts() {
    CreateChildContractLinks(ContractData.ChildContracts);
    $('#childcontract').append(tr);
}

var tr = "";
function CreateChildContractLinks(ChildContracts) {
    if (ChildContracts != null) {
        tr += "<ul>";
        $.each(ChildContracts, function (i, item) {
            tr += "<li>[#" + item.ContractID + "] <a href='" + eContractsRootPath + "Contract/ViewMode?contractID=" + item.ContractID + "' target='_blank'>" + item.ContractName + "</a></li>";
            if (item.ChildContracts != null)
                CreateChildContractLinks(item.ChildContracts);
        });
        tr += "</ul>";
    }
}
//Viplav code

function updateContractProperties() {
    ContractData.Properties.Name = $('#Name_2').text();
    ContractData.Properties.Description = $('#Description_2').text();
    ContractData.Properties.ParentContractName = $('#selParentContractName_2 option:selected').text();
    ContractData.Properties.ParentContractID = $('#selParentContractName_2').val();
    ContractData.Properties.StatusID = parseInt($('#selStatusName_2').val());
    ContractData.Properties.StatusName = $('#selStatusName_2 option:selected').text();
    ContractData.Properties.DisplayCurrencyID = parseInt($('#selDisplayCurrencyName_2').val());
    ContractData.Properties.DisplayCurrencyName = $('#selDisplayCurrencyName_2 option:selected').text();
}

function getContractsList(callback) {
    $.ajax({
        type: 'POST',
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        url: "GetContractsList",
        data: null,
        success: function (data) {
            if (callback != null)
                callback(data);
        },
        error: function (jqXHR, errorStatus, errorThrown) {     // Error Clause added by Viplav on 12 August 2013
            var excTitle = getExeptionMessageFromjqXHR(jqXHR);
            HandleClientSideError(jqXHR.status, errorThrown, excTitle, "ContractViewModel", "getContractsList");
        }
    });
}

function getRecChildren(data, ID) {
    if (data == null) {
        return false;
    }
    var bln = false;
    for (var i = 0; i < data.length; i++) {
        if (bln)
            break;
        if (data[i].ContractID == ID) {
            bln = true;
            break;
        }
        else {
            if (data[i].ChildContracts != null) {
                bln = getRecChildren(data[i].ChildContracts, ID);
            }
        }
    }
    return bln;
}
//#endregion

//#region #################### ALERTS / TODOS ##############################
var orgStructure = null;
var treeIcons = { unit: eContractsImagePath + 'ico-unit-24.png', user: eContractsImagePath + 'ico-user-24.png' };
function initTdEventBinding() {
    /// <summary>Initialize the events of buttons in Contract Alerts section.</summary>
    $('.tdRowActions .gridActionButton.view').live('click', function () {
        var item = getCommonGridItemById(ContractData.ContractTodos, $(this).data('itemid'));

        if ((item == null || item == undefined) && LoadedContractHasParents) {
            for (index = 0; index < ParentsContractsInHierarchy.length; index++) {
                item = getCommonGridItemById(ParentsContractsInHierarchy[index].ContractTodos, $(this).data('itemid'));
                if (item != null)
                    break;
            }
        }

        if (item != null)
            tdShowDialog(item, false);
    });
    $('.tdRowActions .gridActionButton.edit').live('click', function () {
        selectedRecordId = $(this).data('itemid'); //to handle the inactive enteries in DDL's
        var item = getCommonGridItemById(ContractData.ContractTodos, $(this).data('itemid'));
        if (item != null)
            tdShowDialog(item, true);
    });
    $('.tdRowActions .gridActionButton.delete').live('click', function () {
        var item = getCommonGridItemById(ContractData.ContractTodos, $(this).data('itemid'));
        $('#tdGrid').igGridUpdating('deleteRow', $(this).data('rowindex'));

        if (item != null) {
            //todo: remove element from array if New == true
            item.Deleted = true;
            $(this).parent().hide();
        }

        isModified = true;

        deletedContractAlerts.push($(this).data('rowindex'));
    });

    $('#btnTdAdd').live('click', function () {
        selectedRecordId = null; //On add click, the selected recordId of a grid need to be restored to default value(null);
        initTdAddDialog();
        $('#tdDialogData #evtName').show();
    }).button().hide();
}

function toggleTdEditMode(editable) {
    if (editable) {
        $('.tdRowActions .viewCtrl').hide();
        $('.tdRowActions .editCtrl').show();

        if (role.AddTodos)
            $("#btnTdAdd").show();
    }
    else {
        $('.tdRowActions .editCtrl, #btnTdAdd').hide();
        $('.tdRowActions .viewCtrl').show();
    }
}

var todoIndex;
function initBsTd() {
    todoIndex = -1;

    $("#divContractTdGrids").html('');
    $("#divContractTdSummaryGrids").html('');

    initBsTdParentContractsTd(ContractData, false);

    if (displayParentContractRecords)
        if (LoadedContractHasParents) {
            for (var index = 0; index < ParentsContractsInHierarchy.length; index++) {
                initBsTdParentContractsTd(ParentsContractsInHierarchy[index], true);
            }
        }

    return true;
}

function initBsTdParentContractsTd(CurrentContractData, isParentContract) {
    cDataBs.contractTodos.data = [];
    var i = -1; //Mohit
    //if (CurrentContractData == null || CurrentContractData.length <= 0 || CurrentContractData.ContractTodos == null || CurrentContractData.ContractTodos.length <= 0)
    if (CurrentContractData == null || CurrentContractData.length <= 0)
        return false;
    if (CurrentContractData.ContractTodos != null) {
        $.each(CurrentContractData.ContractTodos, function (index, item) {
            todoIndex += 1;
            //        if (item.Deleted || item.Done)
            //            return;
            if (item.Done)
                return;

            if (item.ActivityID != null) //Boaz 28-Aug-2012: introducing Alerts Extensions - An alert can be created without Activity...
                var activity = getContractActivity(item.ActivityID);

            i++; //Mohit
            var row = [];

            var actions = "<div class='tdRowActions'>" +
            (role.ViewTodos ? "<a class='viewCtrl gridActionButton view' data-rowindex='" + todoIndex + "' data-itemid='" + item.EntryId + "'></a>" : "");
            if (!isParentContract) {
                actions += (role.EditTodos ? "<a class='editCtrl gridActionButton edit' style='display:none' data-rowindex='" + todoIndex + "' data-itemid='" + item.EntryId + "'></a>" : "") +
            (role.DeleteTodos ? "<a class='editCtrl gridActionButton delete' style='display:none' data-rowindex='" + todoIndex + "' data-itemid='" + item.EntryId + "'></a>" : "");
            }
            actions += "</div>";

            row.push(actions);
            //row.push("<a href='" + eContractsRootPath + "Contract/ViewMode?contractID=" + CurrentContractData.ID + "' target='_blank'>" + CurrentContractData.Properties.Name + "</a>");
            row.push(item.EntryId);

            if (item.ActivityID != null) //Boaz 28-Aug-2012: introducing Alerts Extensions - An alert can be created without Activity...
                row.push(activity.ActivityName);
            else
                row.push('');

            row.push(item.MsgTypeName);
            row.push(formatDate(item.TodoDate));
            var recipients = "";
            if (item.ContractTodoRecipients != null) {
                $.each(item.ContractTodoRecipients, function (i, itemRecipient) {
                    if (recipients.length > 0)
                        recipients += ', ';
                    recipients = recipients + itemRecipient.RecipientName;
                });
                row.push(recipients);
            } else {
                row.push("");
            }

            cDataBs.contractTodos.data.push(row);
        });
    }

    var contractTdGridHtml = "";
    var contractTdSummaryGridHtml = "";
    if (isParentContract) {
        contractTdGridHtml = "<table width='100%' style='background-color:#b6b6b6;'><tr><td colspan=\"2\" style='font-size: 1.1em; color:black;padding:0 0 10px 0;'>";
        contractTdGridHtml += "<span style='Font-size:17px; padding:0 0 0 6px; color:black'>" + environmentVars.resx.ParentContract + ": " + "</span> <span style='Font-size:17px;font-weight: bold; color:black;'> [#" + CurrentContractData.ID + "] " + CurrentContractData.Properties.Name + "</span></td></tr>";
        contractTdGridHtml += "<tr style='height:3px;'><td style=background-color:#7F8082; height:2px;' colspan=\"2\"></td></tr>";
        contractTdGridHtml += "<tr style='height:10px;'><td colspan=\"2\" style='color:black; font-size: 1.1em;font-weight: bold; padding:0 0 0 6px;'>";
        contractTdGridHtml += "</td></tr></table>";
        contractTdGridHtml += "<table id='tdGrid-" + CurrentContractData.ID + "' style='width: 100%; font-size: 90%; " + (isParentContract ? 'background-color:#b6b6b6; padding:3px;' : '') + "'></table>";

        contractTdSummaryGridHtml = "<table width='100%' style='background-color:#b6b6b6;'><tr><td colspan=\"2\" style='font-size: 1.1em; color:black;padding:0 0 10px 0;'>";
        contractTdSummaryGridHtml += "<span style='Font-size:17px; padding:0 0 0 6px; color:black'>" + environmentVars.resx.ParentContract + ": " + "</span> <span style='Font-size:17px;font-weight: bold; color:black;'> [#" + CurrentContractData.ID + "] " + CurrentContractData.Properties.Name + "</span></td></tr>";
        contractTdSummaryGridHtml += "<tr style='height:3px;'><td style=background-color:#7F8082; height:2px;' colspan=\"2\"></td></tr>";
        contractTdSummaryGridHtml += "<tr style='height:10px;><td colspan=\"2\" style='color:black; font-size: 1.1em;font-weight: bold; padding:0 0 0 6px;'>";
        contractTdSummaryGridHtml += "</td></tr></table>";
        contractTdSummaryGridHtml += "<table id='tdSummaryGrid-" + CurrentContractData.ID + "' style='width: 100%; font-size: 90%; " + (isParentContract ? 'background-color:#b6b6b6; padding:3px;' : '') + "'></table>";
    }
    else {
        contractTdGridHtml = "<table id=\"tdGrid\" style=\"width: 100%; font-size: 90%;\"></table>";
        contractTdSummaryGridHtml = " <table id=\"tdSummaryGrid\" style=\"width: 100%; font-size: 90%;\"></table>";
    }

    $("#divContractTdGrids").append(contractTdGridHtml + "<br />");
    $("#divContractTdSummaryGrids").append(contractTdSummaryGridHtml + "<br />");

    renderContractToDosGrids(isParentContract ? "tdGrid-" + CurrentContractData.ID : "tdGrid", isParentContract ? "tdSummaryGrid-" + CurrentContractData.ID : "tdSummaryGrid");
}

function renderContractToDosGrids(contractGridId, summaryGridId) {
    renderCommonGrid("#" + contractGridId, cDataBs.contractTodos); // renderAcGrid();
    renderSummaryGrid("#" + summaryGridId, cDataBs.contractTodos, [0, 1]);
}

function tdShowDialog(todo, editable) {
    tdWorkItem = todo;
    var dialogTitle;
    if (editable)
        if (todo.EntryId > 0)
            dialogTitle = environmentVars.resx.EditAlertDialogTitle + '- ' + environmentVars.resx.Saved;
        else
            dialogTitle = environmentVars.resx.EditAlertDialogTitle + '- ' + environmentVars.resx.New;
    else
        dialogTitle = environmentVars.resx.ViewAlertDialogTitle;

    buildDialog($("#tdDialog"), editable, function () { tdDialogCommitItem() }, false, dialogTitle);
    tdDialogInitItem(todo, editable);
}

function tdDialogInitItem(todo, editable) {
    var activity = getContractActivity(todo.ActivityID);

    var dataTable = $('#tdDialogData');
    dataTable.find('#TodoID-value').html(todo.EntryId);
    dataTable.find('#todoActivityName-value').html(activity != null ? activity.ActivityName : "");
    dataTable.find('#TodoMsgTypeName-value').html(todo.MsgTypeName);
    dataTable.find('#TodoDate-value').html(formatDate(todo.TodoDate));
    dataTable.find('#TodoRecipients-value').html(tdBuildRecipientsString(todo));

    if (editable) {
        editInPlace('#TodoDate-value', true);
        initDatePicker('#txtTodoDate-value');
        initCombo(sysTableName_MsgTypes, MsgTypes, '#TodoMsgTypeName-value', todo.MsgTypeID);
        tdBuildActivityCombo('#todoActivityName-value', todo.ActivityID);
    }
}
function tdBuildActivityCombo(selector, selectedValue) {
    var container = $(selector);
    container.empty();
    var select = $('<select style="width:100%" />').attr('id', 'sel' + container.attr('id')).appendTo(container);
    var validation = container.data('validation');
    if (validation != null && validation.length > 0)
        select.addClass(validation);

    $('<option />').attr('value', '').text('').appendTo(select);

    $.each(ContractData.ContractActivities, function (i, item) {
        var option = $('<option />').attr('value', item.EntryId).text(item.ActivityName + " - " + formatDate(item.ActivityStart)).appendTo(select);
        if (selectedValue != null && item.EntryId == selectedValue)
            option.attr('selected', 'selected');
    });

}
function tdBuildRecipientsString(todo) {
    var recipients = "";
    if (todo.ContractTodoRecipients != null) {
        $.each(todo.ContractTodoRecipients, function (i, itemRecipient) {
            if (recipients.length > 0)
                recipients += ', ';
            recipients = recipients + itemRecipient.RecipientName;
        });
    }
    return recipients;
}
function initTdAddDialog() {
    ///<summary>Opens Alerts dialog for adding a new contract alert.</summary>
    /// <param></param>
    /// <returns></returns>
    var dialog = $("#tdNewDialog");
    buildDialog(dialog, true, function () { tdNewDialogCommitItem() }, false, environmentVars.resx.AlertDialogTitle);
    //setDialogButtonState(dialog, 'Save', false);
    initTdAddDialogPart('tdNewDialog');

}

function initTdAddDialogPart(divId) {
    $("#" + divId).find('#newTodoRecipientUnitLevel2-value, #newTodoRecipientUser-value, #newTodoMsgTypeName-value, #newTodoActivityName-value').empty();
    $("#" + divId).find('#newTodoOrgUnit-header').text($('#newTodoOrgUnit-header').data('default-text'));


    initCombo(sysTableName_MsgTypes, MsgTypes, '#' + divId + ' #newTodoMsgTypeName-value', null);

    if (divId == 'tdNewDialog') {
        tdBuildActivityCombo('#' + divId + ' #newTodoActivityName-value', null);
        editInPlace('#' + divId + ' #newTodoDate-value', true);
        initDatePicker('#' + divId + ' #txtnewTodoDate-value');
    }
    else {
        $('#' + divId + ' #newTodoDate-value').attr('id', 'newTodoDate-value-Event')
        editInPlace('#' + divId + ' #newTodoDate-value-Event', true);
        initDatePicker('#' + divId + ' #txtnewTodoDate-value-Event');
    }

    getOrgUnitsTree(function (data) {
        orgStructure = data;
        //if (license.AllowOrganizationTree)
        //{
        tdBuildTree(divId);
        //}
        //else
        //{
        //   var listorg = initListOrgs(orgStructure);
        //  buildComboControl($('#newTodoOrgTree'), listorg, null);
        //}
    });
}

function tdBuildTree(divId) {
    var tree = $('#' + divId + ' #newTodoOrgTree');
    tree.igTree("destroy");
    tree.igTree({
        singleBranchExpand: false,
        initialExpandDepth: -1,
        dataSourceType: 'json',
        dataSource: tdInitTreeBs([], orgStructure),
        bindings: {
            valueKey: 'id',
            textKey: 'name',
            imageUrlKey: 'img',
            childDataProperty: 'children',
            nodeContentTemplate: "{{if img == treeIcons.user}}<b><i>${name}</i></b>{{else}}${name}{{/if}}"
        },
        checkboxMode: "triState",
        selectionChanged: function (evt, ui) {
        }
    });
}
function tdInitTreeBs(bs, data) {
    $.each(data, function (i, item) {
        var u1 = {
            id: item.ID,
            img: item.EntryTexts != null ? treeIcons.unit : treeIcons.user,
            name: item.EntryTexts != null ? item.EntryTexts[0].DescShort : item.FullName,
            type: item.EntryTexts != null ? 1 : 2, // 1 - unit; 2 - user
            children: []
        };

        bs.push(u1);

        if (item.Units != null)
            tdInitTreeBs(u1.children, item.Units);

        if (item.Users != null)
            tdInitTreeBs(u1.children, item.Users);
    });
    return bs;
}

function tdDialogCommitItem() {
    //    if (!isEditMode)
    //    {
    //        $("#tdDialog").dialog('close'); //dinesh
    //    }
    //    else
    //    {
    //validation check added by salil on 02-July-2013
    var dataTable = $('#tdDialog');
    if (!validator.validate(dataTable))
        return false;

    if (isEditMode) {
        if (tdWorkItem == null)
            return;
        $("#tdDialog").dialog("close");

        var dataTable = $('#tdDialogData');
        tdWorkItem.ActivityID = parseInt(dataTable.find('#seltodoActivityName-value').val());
        tdWorkItem.MsgTypeID = parseInt(dataTable.find('#selTodoMsgTypeName-value').val());
        tdWorkItem.MsgTypeName = dataTable.find('#selTodoMsgTypeName-value option:selected').text();
        tdWorkItem.TodoDate = $('#txtTodoDate-value').datepicker('getDate');

        initBsTd();
        toggleTdEditMode(isEditMode);
        setSystableEnteriesAsDeleted($("#tdGrid"), deletedContractAlerts);

        isModified = true;
    }
}

function tdNewDialogCommitItem() {
    /// <summary>Commits the changes done while adding or updating an alert in a contract.</summary>
    /// <return></return>
    var dataTable = $('#tdNewDialog');
    if (!validator.validate(dataTable))
        return false;

    var td = { New: true, ContractTodoRecipients: [] };

    var selectedUsers = $("#tdNewDialog #newTodoOrgTree").igTree("checkedNodes");
    $.each(selectedUsers, function (i, item) {
        if (item.data == null || item.data.type != 2)
            return;
        td.ContractTodoRecipients.push({ New: true, RecipientName: item.data.name, EntryId: item.data.id });
    });

    if (td.ContractTodoRecipients <= 0) {
        validator.showMessage($("#tdNewDialog #newTodoOrgTree"), validator.rules.mandatory.message, 1, 1);
        return;
    }

    td.EntryId = cDataBs.contractTodos.newItemId = incrementId(cDataBs.contractTodos.newItemId);
    td.ActivityID = parseInt(dataTable.find('#selnewTodoActivityName-value').val());
    td.MsgTypeID = parseInt(dataTable.find('#selnewTodoMsgTypeName-value').val());
    td.MsgTypeName = dataTable.find('#selnewTodoMsgTypeName-value option:selected').text();
    td.TodoDate = $('#tdNewDialog #txtnewTodoDate-value').datepicker('getDate');

    ContractData.ContractTodos.push(td);

    initBsTd();
    //RebindCommonGrid('#tdGrid', cDataBs.contractTodos);
    $("#tdNewDialog").dialog("close");
    $("#newTodoOrgTree").igTree("destroy");
    toggleTdEditMode(true);
    setSystableEnteriesAsDeleted($("#tdGrid"), deletedContractAlerts);

    isModified = true;
}

//#endregion

//#region #################### AUTHORIZED ENTITIES / USERS ##############################

function initUsEventBinding() {
    $('.usRowActions .gridActionButton.view').live('click', function () {
        var item = getCommonGridItemById(ContractData.ContractUsers, $(this).data('itemid'));
        if (item != null)
            usShowDialog(item, false, false);
    });
    $('.usRowActions .gridActionButton.edit').live('click', function () {
        selectedRecordId = $(this).data('itemid'); //to handle the inactive enteries in DDL's
        var item = getCommonGridItemById(ContractData.ContractUsers, $(this).data('itemid'));
        if (item != null)
            usShowDialog(item, true, false);
    });
    $('.usRowActions .gridActionButton.delete').live('click', function () {
        var item = getCommonGridItemById(ContractData.ContractUsers, $(this).data('itemid'));
        $('#usGrid').igGridUpdating('deleteRow', $(this).data('rowindex'));

        if (item != null) {
            item.Deleted = true;
            $(this).parent().hide();
        }

        isModified = true;

        deletedContractAuthEntities.push($(this).data('rowindex'));
    });

    $('#btnCuAdd').live('click', function () {
        selectedRecordId = null; //On add click, selected recordId of a grid need to be restored to default value(null);
        usShowDialog({}, true, true);
    }).button().hide();
}

function toggleUsEditMode(editable) {
    if (editable) {
        $('.usRowActions .viewCtrl').hide();
        $('.usRowActions .editCtrl').show();

        if (role.EditAuth)
            $("#btnCuAdd").show();
    }
    else {
        $('.usRowActions .editCtrl, #btnCuAdd').hide();
        $('.usRowActions .viewCtrl').show();
    }
}

function initBsUs() {
    cDataBs.contractUsers.data = [];

    if (ContractData == null || ContractData.length <= 0 || ContractData.ContractUsers == null || ContractData.ContractUsers.length <= 0)
        return false;
    if (ContractData.ContractUsers != null) {
        $.each(ContractData.ContractUsers, function (i, item) {
            var row = [];
            var actionBtns = "<div class='usRowActions'>" +
        (role.ViewAuth ? "<a class='viewCtrl gridActionButton view' data-rowindex='" + i + "' data-itemid='" + item.EntryId + "'></a>" : "");
            if (license.AllowContractUserAuthorization && role.EditAuth)
                actionBtns += "<a class='editCtrl gridActionButton edit' style='display:none' data-rowindex='" + i + "' data-itemid='" + item.EntryId + "'></a>";
            actionBtns += (role.EditAuth ? "<a class='editCtrl gridActionButton delete' style='display:none' data-rowindex='" + i + "' data-itemid='" + item.EntryId + "'></a>" : "") + "</div>";

            row.push(actionBtns);
            row.push(item.EntryId);
            row.push(item.UserFullName);
            row.push(item.RoleName);

            cDataBs.contractUsers.data.push(row);
        });
    }
    return true;
}
function usShowDialog(item, editable, isNew) {
    /// <summary>Shows dialog for adding or editing a contract user.</summary>
    /// <param name="item">Authorized entity of a contract getting added or updated.</param>
    /// <param name="editable">Boolean value used to define whether dialog is required to be opened in edit mode or view mode.</param>
    /// <param name="isNew">Boolean value used to define whether dialog is required to be opened for adding a new event.</param>
    /// <return></return>

    var dialogTitle;
    if (isNew) {
        usWorkItem = {};
        dialogTitle = environmentVars.resx.AuthorizedEntityDialogTitle;
    }
    else {
        usWorkItem = item;
        if (editable)
            if (item.EntryId > 0)
                dialogTitle = environmentVars.resx.EditAuthorizedEntityDialogTitle + '- ' + item.UserFullName + ' ' + environmentVars.resx.Saved;
            else
                dialogTitle = environmentVars.resx.EditAuthorizedEntityDialogTitle + '- ' + item.UserFullName + ' ' + environmentVars.resx.New;
        else
            dialogTitle = environmentVars.resx.ViewAuthorizedEntityDialogTitle + '- ' + item.UserFullName;
    }

    buildDialog($("#usDialog"), editable, function () { usDialogCommitItem(isNew) }, false, dialogTitle);
    usDialogInitItem(item, editable, isNew);
}

function usDialogInitItem(user, editable, isNew) {
    var dataTable = $('#usDialogData');
    if (!isNew) {
        dataTable.find('#UserID-value').html(user.EntryId);
        dataTable.find('#UserFullName-value').html(user.UserFullName);
        dataTable.find('#UserRole-value').html(user.RoleName);
    }
    else {
        dataTable.find('#UserID-value').html('');
        dataTable.find('#UserFullName-value').html('');
        dataTable.find('#UserRole-value').html('');
    }
    if (editable) {
        if (isNew) {
            getSysTable(sysTableName_Users, function () {
                var itemList = usFilterUsers();
                buildComboControl($('#UserFullName-value'), itemList, null);
            });
        }

        if (license.AllowContractUserAuthorization) {
            initCombo(sysTableName_Roles, Roles, '#UserRole-value', user.RoleID);
            //Arkady-start
            $('#selUserFullName-value').live('change', function () {
                var itemList = usFilterUsers();
                $.each(itemList, function (i, v) {
                    if (v.key == $('#selUserFullName-value').val()) {
                        if (!v.canEdit) {
                            var list = noEditRoles();
                            buildComboControl($('#UserRole-value'), list, null);
                            $('#selUserRole-value').val(v.defaultRoleId);
                            //if (!v.canEdit) { - no needed
                            //clear dropbox - add noEditRoles - no needed
                            //$("#ddlList").empty(); - no needed
                            //$("<option value="6">Java Script</option>").appendTo("#ddlList"); - no needed

                        }
                        else {
                            //clear dropbox - add Roles
                            buildComboControl($('#UserRole-value'), Roles, null);
                            $('#selUserRole-value').val(v.defaultRoleId);
                        }
                    }
                });

            });
        } //Arkady-end
        else {
            $('#selUserFullName-value').live('change', function () {
                var user = usGetUser($(this).val());
                if (user == null)
                    return;
                var userDefaultRoleContainer = dataTable.find('#UserRole-value');
                userDefaultRoleContainer.html(user.defaultRoleName);
                userDefaultRoleContainer.data('default-role-id', user.defaultRoleId);
            });
        }

    }
}
//Viplav - function returns array of limited roles 
function noEditRoles() {
    var noEditRolesArray = [];
    noEditRolesArray = $.grep(Roles, function (el, ind) {
        return (el.Limited == true);
    });
    return noEditRolesArray;
} //end Viplav

function usFilterUsers() {
    var contractUsers = [];
    $.each(ContractData.ContractUsers, function (i, item) {
        contractUsers.push(parseInt(item.EntryId));
    });

    var filteredList = $.grep(Users, function (item, i) {
        return $.inArray(item.key, contractUsers) < 0;
    });
    return filteredList;
}
function usGetUser(id) {
    var user = null;
    $.each(Users, function (i, item) {
        if (item.key == id) {
            user = item;
            return false;
        }
    });
    return user;
}
function usDialogCommitItem(isNew) {
    /// <summary>Commits the changes done while while adding or updating an authorized entity of a contract.</summary>
    /// <param name="isNew">Boolean value used to define whether a new authorized entity is added in the contract.</param>
    /// <return></return>
    if (isEditMode) {
        if (usWorkItem == null)
            return;

        var dataTable = $('#usDialogData');
        if (!validator.validate(dataTable))
            return false;

        $("#usDialog").dialog("close");

        if (license.AllowContractUserAuthorization && isEditMode) {
            usWorkItem.RoleID = dataTable.find('#selUserRole-value').val();
            usWorkItem.RoleName = dataTable.find('#selUserRole-value option:selected').text();

        }
        else//for viewable only
        {
            var userDefaultRoleContainer = dataTable.find('#UserRole-value');
            usWorkItem.RoleID = userDefaultRoleContainer.data('default-role-id');
            usWorkItem.RoleName = userDefaultRoleContainer.text();
        }

        if (isNew) {
            usWorkItem.EntryId = dataTable.find('#selUserFullName-value').val();
            usWorkItem.UserFullName = dataTable.find('#selUserFullName-value option:selected').text();
            usWorkItem.New = true;
            ContractData.ContractUsers.push(usWorkItem);
            usrID = usWorkItem.EntryId;
        }

        initBsUs();
        RebindCommonGrid('#usGrid', cDataBs.contractUsers);
        toggleUsEditMode(isEditMode);
        setSystableEnteriesAsDeleted($("#usGrid"), deletedContractAuthEntities);
        //buildUsersCombo();
        isModified = true;
    }
}

//#endregion

//#region #################### SPECIAL FIELDS ##############################

function initFlEventBinding() {
    $('.flRowActions .gridActionButton.view').live('click', function () {
        var ctFieldGroups = [];
        var actionParentContractId = $(this).data('contractid');
        //var item = getFieldFromFieldGroupById(ContractData.ContractFieldGroups, $(this).data('itemid'));
        if (ContractData.ID != actionParentContractId && LoadedContractHasParents) {
            $.each(ParentsContractsInHierarchy, function (i, parentContract) {
                if (parentContract.ID == actionParentContractId) {
                    ctFieldGroups = parentContract.ContractFieldGroups;
                    return false;
                }
            });
        }
        else {
            ctFieldGroups = ContractData.ContractFieldGroups;
        }

        var fields = getFieldsByRecordCounter(ctFieldGroups, $(this).data('recordcounter'), $(this).data('fieldgroupid'));
        initFieldsFieldDialog(fields, false, false);

        //        if ((item == null || item == undefined) && LoadedContractHasParents)
        //        {
        //            for (index = 0; index < ParentsContractsInHierarchy.length; index++)
        //            {
        //                item = getCommonGridItemById(ParentsContractsInHierarchy[index].ContractFieldGroups, $(this).data('itemid'));
        //                if (item != null)
        //                    break;
        //            }
        //        }

        //        if (item != null)
        //            flShowDialog(item, false);

        //if (item != null)       
        // flShowDialog(item, false);

        if (fields != null || fields != undefined || fields.length > 0)
            flShowDialog(false, $(this).data('recordcounter'), $(this).data('fieldgroupid'), false);
    });
    $('.flRowActions .gridActionButton.edit').live('click', function () {
        //var item = getFieldFromFieldGroupById(ContractData.ContractFieldGroups, $(this).data('itemid'));

        var fields = getFieldsByRecordCounter(ContractData.ContractFieldGroups, $(this).data('recordcounter'), $(this).data('fieldgroupid'));
        initFieldsFieldDialog(fields, true, false);

        //        if (item != null)
        //            flShowDialog(item, true);

        if (fields != null || fields != undefined || fields.length > 0)
            flShowDialog(true, $(this).data('recordcounter'), $(this).data('fieldgroupid'), false);
    });

    $('.flRowActions .gridActionButton.delete').live('click', function () {
        var fields = getFieldsByRecordCounter(ContractData.ContractFieldGroups, $(this).data('recordcounter'), $(this).data('fieldgroupid'));
        modifyContractFieldValues($(this).data('fieldgroupid'), fields, $(this).data('recordcounter'), false, true);
        if (linkedCheck) {
            initBsFl();
            toggleFlEditMode(isEditMode);
            //setContractFieldAsDeleted();
            //markContractFieldAsDeleted(('flGrid' + $(this).data('fieldgroupid') + ContractData.ID), $(this).data('rowindex'));
        }

        $('#flGrid' + $(this).data('fieldgroupid') + ContractData.ID).igGridUpdating('deleteRow', $(this).data('rowindex'));
        $('#flGrid' + $(this).data('fieldgroupid') + ContractData.ID).find(".editCtrl.gridActionButton.delete[data-rowindex='" + $(this).data('rowindex') + "']").hide();

        if (fields != null) {
            $.each(fields, function (i, item) {
                item.Deleted = true;
            });

        }

        $(this).parent().hide();
    });

}

function toggleFlEditMode(editable) {
    if (editable) {
        $('.flRowActions .viewCtrl').hide();
        $('.flRowActions .editCtrl, .addCtFld').show();
    }
    else {
        $('.flRowActions .editCtrl, .addCtFld').hide();
        $('.flRowActions .viewCtrl').show();
    }
}

function getFieldFromFieldGroupById(dataSource, id) {
    var dataItem = null;
    var index = 0;
    $.each(dataSource, function (indexOfGroup, fieldGroup) {
        $.each(fieldGroup.ContractFields, function (indexOfField, field) {
            if (field.EntryID == id) {
                dataItem = field;
                return false;
            }
            index++;
        });
        if (dataItem != null) return false;
    });
    return dataItem;
}

function getFieldFromMultipleFieldGroupById(dataSource, fieldId, fieldGroupId, recordCounter) {
    var dataItem = null;
    var index = 0;
    $.each(dataSource, function (indexOfGroup, fieldGroup) {
        if (fieldGroup.EntryId == fieldGroupId) {
            $.each(fieldGroup.ContractFields, function (indexOfField, field) {
                if (field.EntryID == fieldId && field.RecordCounter == recordCounter) {
                    dataItem = field;
                    return false;
                }
                index++;
            });
            if (dataItem != null) return false;
        }
    });
    return dataItem;
}

function initBsFl() {
    $('#flGrid').html('');
    $('#flSummaryGrid').html('');
    $(".multipleRecordGroupTab, .multipleRecordGroupTabDiv").remove();
    //initBsFldGroups();
    getContractActivities();
    getContractDocuments();
    //getContractUsers();
    getSysTable(sysTableName_Currencies, function () { initBsFldGroups(); });
}

function initBsFldGroups() {
    initBsFlParentContractsFl(ContractData, false);

    if (displayParentContractRecords) {
        if (LoadedContractHasParents) {
            for (var index = 0; index < ParentsContractsInHierarchy.length; index++) {
                initBsFlParentContractsFl(ParentsContractsInHierarchy[index], true);
            }
        }
    }

    setIndependentGroupsHeight();
    return true;
}

function initBsFlParentContractsFl(CurrentContractData, isParentContract) {
    cDataBs.contractFieldGroups.data = [];

    //if (CurrentContractData == null || CurrentContractData.length <= 0 || CurrentContractData.ContractFieldGroups == null || CurrentContractData.ContractFieldGroups.length <= 0)
    if (CurrentContractData == null || CurrentContractData.length <= 0)
        return false;
    if (CurrentContractData.ContractFieldGroups != null) {
        $.each(CurrentContractData.ContractFieldGroups, function (fg, item) {
            //            if (item.SingleRecord == true)
            //            {
            //                renderSingleFieldGroup(item);
            //            }
            //            else
            //            {
            if (item.SingleRecord == false) {
                var counter = getUniqueRecordCounter(item.ContractFields);
                cDataBs.contractFieldGroups.data = [];
                var FilterFields = [];
                var rowindex = -1;
                $.each(counter, function (i, count) {
                    FilterFields = $.grep(item.ContractFields, function (element, indx) {
                        return (element.RecordCounter == count);
                    });

                    if (count == environmentVars.constants.RecordCounter)
                        return;

                    rowindex += 1;

                    var row = [];
                    var actions = "<div class='flRowActions'>";
                    if (item.AllowToAllRoles) {
                        actions += "<a class='viewCtrl gridActionButton view' data-rowindex='" + rowindex + "' data-contractid='" + CurrentContractData.ID + "' data-recordcounter='" + count + "' data-fieldgroupid='" + item.EntryId + "'></a>";
                        if (!isParentContract)
                            actions += "<a class='editCtrl gridActionButton edit' style='display:none' data-rowindex='" + rowindex + "' data-recordcounter='" + count + "' data-fieldgroupid='" + item.EntryId + "'></a>" +
                            "<a class='editCtrl gridActionButton delete' style='display:none' data-rowindex='" + rowindex + "' data-recordcounter='" + count + "' data-fieldgroupid='" + item.EntryId + "'></a>";
                    }
                    else {
                        //                        actions = (item.RoleIDsVisible.indexOf(role.ID) > -1 ? "<div class='flRowActions'><a class='viewCtrl gridActionButton view' data-rowindex='" +rowindex  + "' data-itemid='" + field.EntryId + "'></a>" : "");
                        //                        if (!isParentContract)
                        //                            actions += (item.RoleIDsEditable.indexOf(role.ID) > -1 ? "<a class='editCtrl gridActionButton edit' style='display:none' data-rowindex='" + rowindex + "' data-itemid='" + field.EntryId + "'></a>" : "")

                        actions += (item.RoleIDsVisible.indexOf(role.ID) > -1 ? "<a class='viewCtrl gridActionButton view' data-rowindex='" + rowindex + "' data-contractid='" + CurrentContractData.ID + "' data-recordcounter='" + count + "' data-fieldgroupid='" + item.EntryId + "'></a>" : "");
                        if (!isParentContract)
                            actions += (item.RoleIDsEditable.indexOf(role.ID) > -1 ? "<a class='editCtrl gridActionButton edit' style='display:none' data-rowindex='" + rowindex + "' data-recordcounter='" + count + "' data-fieldgroupid='" + item.EntryId + "'></a>" +
                            "<a class='editCtrl gridActionButton delete' style='display:none' data-rowindex='" + rowindex + "' data-recordcounter='" + count + "' data-fieldgroupid='" + item.EntryId + "'></a>" : "");
                    }
                    actions + "</div>";

                    row.push(actions);
                    $.each(FilterFields, function (r, field) {
                        var fldTypeVal = (field.FieldType == FieldTypes.EntityLink ? field.CatalogFieldType : field.FieldType);

                        if (fldTypeVal == FieldTypes.ListSingle) {
                            //row.push(field.FieldOptionValues[field.FieldOptionIDs.indexOf(field.FieldValue)]);
                            if (field.FieldType == FieldTypes.EntityLink)
                                row.push(field.CatalogFieldOptionValues[field.CatalogFieldOptionIDs.indexOf(field.FieldValue)]);
                            else
                                row.push(field.FieldOptionValues[field.FieldOptionIDs.indexOf(field.FieldValue)]);
                        }
                        else if (fldTypeVal == FieldTypes.Currency || fldTypeVal == FieldTypes.CalculatedCurrency) {
                            row.push(field.FieldValue != null ? field.FieldValue + " " + GetCurrencyValue(field.FieldCurrencyID) : " "); //Remove the null value from currency field type--added by deepak dhamija (11 march,2013)
                        }
                        else if (fldTypeVal == FieldTypes.EventLink) {
                            var ActivityData = getActivityDataByEntryID(field.LinkedEventID);
                            row.push(ActivityData.ActivityStart != null ? formatDate(ActivityData.ActivityStart) : '');
                            row.push(ActivityData.EventTypeName);
                            row.push(ActivityData.ActivityName);
                        }
                        else if (fldTypeVal == FieldTypes.DocumentLink) {
                            var docData = getDocumentsByEntryID(field.LinkedDocumentID);
                            row.push(docData.DocName != null ? docData.DocName : '');
                        }
                        else if (fldTypeVal == FieldTypes.UserLink) {
                            var usrData = getUserDataByEntryID(field.LinkedUserID);
                            row.push(usrData == undefined ? '' : usrData.name);
                        }
                        else if (fldTypeVal == FieldTypes.Boolean) {
                            field.FieldValue = (field.FieldValue != null ? field.FieldValue : "");
                            if (field.FieldValue == "1")
                                row.push(environmentVars.resx.Yes);
                            else if (field.FieldValue == "0")
                                row.push(environmentVars.resx.No);
                            else
                                row.push(field.FieldValue);
                        }
                        else if (field.IsSelectorField == true) {
                            row.push(field.IsSelectorFieldValue != null ? field.IsSelectorFieldValue : '');
                        }
                        else {
                            row.push(fldTypeVal == FieldTypes.TextArea ? replaceLineFeedsWithLineBreaks(field.FieldValue) : field.FieldValue);
                        }
                    });
                    cDataBs.contractFieldGroups.data.push(row);
                    row = null;
                });
                getfieldsGroupHeaders(FilterFields);
                getTableforfieldgrid(item.EntryOriginalId, item.FieldGroupName, (isParentContract ? false : item.AllowToAllRoles ? true : item.RoleIDsEditable.indexOf(role.ID) > -1), isParentContract, CurrentContractData.ID, CurrentContractData.Properties.Name, item.DisplayIndependent, item.AllowToAllRoles, item.RoleIDsEditable);
            }
            //            }
        });
        $(".addCtFld").button().die("click");
        $(".addCtFld").button().live("click", function () {
            initAddContractFieldDialog($(this).data("fieldgroupid"), true);
        });
    }
    //    if (CurrentContractData.ParentContract != null)
    //    {
    //        initBsFlParentContractsFl(CurrentContractData.ParentContract, true);
    //    }
}

function getfieldsGroupHeaders(ContractFields) {
    if (ContractFields != null) {
        var k = 0;
        cDataBs.contractFieldGroups.headers = [];
        cDataBs.contractFieldGroups.headers.push({ headerText: environmentVars.resx.Action, key: '0', width: '70px' });
        $.each(ContractFields, function (i, value) {
            if (value.FieldType == FieldTypes.EventLink) {
                cDataBs.contractFieldGroups.headers.push({ headerText: value.FieldName + ' - ' + environmentVars.resx.EventDate, key: (++k) + '', width: 'auto' });
                cDataBs.contractFieldGroups.headers.push({ headerText: value.FieldName + ' - ' + environmentVars.resx.EventType, key: (++k) + '', width: 'auto' });
                cDataBs.contractFieldGroups.headers.push({ headerText: value.FieldName + ' - ' + environmentVars.resx.EventName, key: (++k) + '', width: 'auto' });
            }
            else if (value.FieldType == FieldTypes.EntityLink) {
                cDataBs.contractFieldGroups.headers.push({ headerText: value.CatalogFieldName, key: (++k) + '', width: 'auto' });
            }
            else
                cDataBs.contractFieldGroups.headers.push({ headerText: value.FieldName, key: (++k) + '', width: 'auto' });
        });
    }
}

function getTableforfieldgrid(FieldGroupID, FieldGroupName, showAddButton, isParentContract, CurrentContractID, ContractName, displayIndependent, VisibleToAllRoles, RoleIDsEditable) {
    var tablehtml = "";
    var Summarytablehtml = "";

    if (!isParentContract && displayIndependent) {
        renderNewContractTab(FieldGroupID, FieldGroupName);
    }

    if (isParentContract) {
        tablehtml += "<table class='parentContractFieldsInfo' width='100%' style='background-color:#b6b6b6;'><tr><td colspan=\"2\" style='font-size: 1.1em; color:black;padding:0 0 10px 0;'>";
        tablehtml += "<span style='Font-size:17px; padding:0 0 0 6px; color:black'>" + environmentVars.resx.ParentContract + ": " + "</span> <span style='Font-size:17px;font-weight: bold; color:black;'> [#" + CurrentContractID + "] " + ContractName + "</span></td></tr>";
        tablehtml += "<tr style='height:3px;'><td style=background-color:#7F8082; height:2px;' colspan=\"2\"></td></tr>";
        tablehtml += "<tr><td colspan=\"2\" style='color:black; font-size: 1.1em;font-weight: bold; padding:0 0 0 6px;'>";
    }
    else {
        tablehtml += "<table width='100%'><tr><td class='SectionHeader' style='width: 120px'>";
    }

    tablehtml += FieldGroupName;
    if (VisibleToAllRoles == false && RoleIDsEditable.length > 0) {
        if (RoleIDsEditable.contains(role.ID) == false) {
            tablehtml += "<span id=\"docsReadOnly\" class=\"informationText\">(" + environmentVars.resx.ViewOnly + ")</span>";
        }
    }
    if (showAddButton)
        tablehtml += "<button class='ec-button addCtFld' style='margin: 0 20px; display: none; float:right;' data-fieldgroupid='" + FieldGroupID + "'>" + environmentVars.resx.Add + "</button>";

    tablehtml += "</td></tr></table>";
    tablehtml += "<table class='" + (isParentContract ? 'parentContractFieldsInfo' : '') + "' id='flGrid" + FieldGroupID + "" + CurrentContractID + "' style='width: 100%; font-size: 90%; " + (isParentContract ? 'background-color:#b6b6b6; padding:3px;' : '') + "'></table></br>";
    $(!isParentContract && displayIndependent ? '#divFieldGroup-' + FieldGroupID : '#flGrid').append(tablehtml);

    if (isParentContract) {
        Summarytablehtml += "<table class='parentContractFieldsInfo' width='100%' style='background-color:#b6b6b6;'><tr><td colspan=\"2\" style='font-size: 1.1em; color:black;padding:0 0 10px 0;'>";
        Summarytablehtml += "<span style='Font-size:17px; padding:0 0 0 6px; color:black'>" + environmentVars.resx.ParentContract + ": " + "</span> <span style='Font-size:17px;font-weight: bold; color:black;'> [#" + CurrentContractID + "] " + ContractName + "</span></td></tr>";
        Summarytablehtml += "<tr style='height:3px;'><td style=background-color:#7F8082; height:2px;' colspan=\"2\"></td></tr>";
        Summarytablehtml += "<tr><td colspan=\"2\" style='color:black; font-size: 1.1em;font-weight: bold; padding:0 0 0 6px;'>";
    }
    else {
        Summarytablehtml += "<table width='100%'><tr><td class='SectionHeader' style='width: 120px'>";
    }

    Summarytablehtml += FieldGroupName;
    Summarytablehtml += "</td></tr></table>";
    Summarytablehtml += "<table id='flSummaryGrid" + FieldGroupID + CurrentContractID + "' class='flsg " + (isParentContract ? 'parentContractFieldsInfo' : '') + "' style='width: 100%; font-size: 90%; " + (isParentContract ? 'background-color:#b6b6b6; padding:3px;' : '') + "'></table></br>";

    $('#flSummaryGrid').append(Summarytablehtml);
    renderCommonGrid("#flGrid" + FieldGroupID + CurrentContractID, cDataBs.contractFieldGroups);
    renderSummaryGrid("#flSummaryGrid" + FieldGroupID + CurrentContractID, cDataBs.contractFieldGroups, [0]);
}

function initSingleFieldGroups(renderAsSummary) {
    if (renderAsSummary) {
        $("#tdContractPropertiesSummary .SingleFieldGroups").remove();
    }
    else {
        $("#divProperties .SingleFieldGroups").remove();
        $(".singleRecordGroupTab, .singleRecordGroupTabDiv").remove();
    }
    getSysTable(sysTableName_Currencies, function () { initSingleRecordFldGroups(renderAsSummary); })
}

function initSingleRecordFldGroups(renderAsSummary) {

    createSingleFieldGroup(ContractData, false, renderAsSummary);

    if (displayParentContractRecords)
        if (LoadedContractHasParents) {
            k = 0;
            Sumk = 0;
            for (var index = 0; index < ParentsContractsInHierarchy.length; index++) {
                createSingleFieldGroup(ParentsContractsInHierarchy[index], true, renderAsSummary);
            }
        }
}

function createSingleFieldGroup(CurrentContractData, isParentContract, renderAsSummary) {
    if (CurrentContractData == null || CurrentContractData.length <= 0)
        return false;
    if (CurrentContractData.ContractFieldGroups != null) {
        $.each(CurrentContractData.ContractFieldGroups, function (fg, item) {
            if (item.SingleRecord == true) {
                renderSingleFieldGroup(item, isParentContract, CurrentContractData.ID, CurrentContractData.Properties.Name, renderAsSummary);
            }
        });
    }
}

function renderSingleFieldGroup(SingleContractFieldGroup, isParentContract, contractId, contractTitle, renderAsSummary) {

    var allDefaultEntityFlds = $.grep(SingleContractFieldGroup.ContractFields, function (fld, i) {
        return fld.IsDefaultEntityField == true;
    });

    var GroupEntitiesFieldID = [];
    $(allDefaultEntityFlds).each(function (index, flditem) {
        GroupEntitiesFieldID.push(flditem.AssociatedToFieldID);
    });
    GroupEntitiesFieldID = $.unique(GroupEntitiesFieldID);

    if (GroupEntitiesFieldID != null && GroupEntitiesFieldID != undefined && GroupEntitiesFieldID.length > 0)
        getFieldNameByIDs(GroupEntitiesFieldID, function () { (renderAsSummary ? renderSingleFieldGroupForContractSummary(SingleContractFieldGroup, isParentContract, contractId, contractTitle) : renderSingleFieldGroupAsTable(SingleContractFieldGroup, isParentContract, contractId, contractTitle)) });
    else
        (renderAsSummary ? renderSingleFieldGroupForContractSummary(SingleContractFieldGroup, isParentContract, contractId, contractTitle) : renderSingleFieldGroupAsTable(SingleContractFieldGroup, isParentContract, contractId, contractTitle));
}

var k = 0;
function renderSingleFieldGroupAsTable(SingleContractFieldGroup, isParentContract, contractId, contractTitle) {

    if (!isParentContract && SingleContractFieldGroup.DisplayIndependent) {
        renderNewContractTab(SingleContractFieldGroup.EntryId, SingleContractFieldGroup.FieldGroupName, true);
    }

    k = k + 1;
    var id = SingleContractFieldGroup.EntryId + "" + (isParentContract ? contractID : "") + "" + k;
    var elemid = "tblSingleEntityTypeField-" + id;
    //var fgTable = "<table id=\"tblSingleEntityTypeField-" + SingleContractFieldGroup.EntryId + isParentContract ? contractID : "" + "\" width=\"100%\" class=\"FieldsTableView SingleFieldGroups\">";
    var fgTable;
    if (isParentContract) {
        fgTable = "<table class=\"FieldsTableView SingleFieldGroups parentContractFieldsInfo\"><tr><td colspan=\"2\" class=\"SectionHeader\"></td></tr></table>";
        fgTable += "<table style='background-color:#b6b6b6;' id=\"" + elemid + "\" width=\"100%\" class=\"FieldsTableView SingleFieldGroups parentContractFieldsInfo\">";
        fgTable += "<tr><td colspan=\"2\" style='font-size: 1.1em; color:black;padding:0 0 10px 0;'>";
        //        if (ContrId == null || ContrId != contractId) {
        fgTable += "<span style='Font-size:17px; padding:0 0 0 6px; color:black'>" + environmentVars.resx.ParentContract + ": " + "</span> <span style='Font-size:17px;font-weight: bold; color:black;'> [#" + contractId + "] " + contractTitle + "</span>";
        ContrId = contractId;
        fgTable += "<tr style='height:3px;'><td style=background-color:#7F8082; height:2px;' colspan=\"2\"></td></tr>";
        // }
        fgTable += "<tr><td colspan=\"2\" style='color:black; font-size: 1.1em;font-weight: bold; padding:0 0 0 6px;'>";
    }
    else {
        fgTable = "<table id=\"" + elemid + "\" width=\"100%\" class=\"FieldsTableView SingleFieldGroups\">";
        fgTable += "<tr><td colspan=\"2\" class=\"SectionHeader\">";
    }
    fgTable += SingleContractFieldGroup.FieldGroupName;
    if (SingleContractFieldGroup.AllowToAllRoles == false && SingleContractFieldGroup.RoleIDsEditable.length > 0) {
        if (SingleContractFieldGroup.RoleIDsEditable.contains(role.ID) == false) {
            fgTable += "<span id=\"docsReadOnly\" class=\"informationText\">(" + environmentVars.resx.ViewOnly + ")</span>";
        }
    }
    fgTable += "</td></tr>";
    fgTable += "</table>";
    $(!isParentContract && SingleContractFieldGroup.DisplayIndependent ? '#divFieldGroup-' + SingleContractFieldGroup.EntryId : "#divProperties").append(fgTable);


    $.each(SingleContractFieldGroup.ContractFields, function (indx, field) {
        if (field.IsDefaultEntityField) {
            var renderCatalogRecordSearchIcon = false;
            if (SingleContractFieldGroup.AllowToAllRoles) {
                renderCatalogRecordSearchIcon = true;
            }
            else {
                if (SingleContractFieldGroup.RoleIDsEditable != null && SingleContractFieldGroup.RoleIDsEditable.length > 0) {
                    if (SingleContractFieldGroup.RoleIDsEditable.contains(role.ID)) {
                        renderCatalogRecordSearchIcon = true;
                    }
                }
            }

            if (isParentContract)
                $("#" + elemid).append(getEntityFieldsTableHeaderForParantContract(field, false, false, renderCatalogRecordSearchIcon, contractId));
            else
                $("#" + elemid).append(getEntityFieldsTableHeader(field, false, false, renderCatalogRecordSearchIcon));
        }

        var fldTypeValue = (field.FieldType == FieldTypes.EntityLink ? field.CatalogFieldType : field.FieldType);

        if (fldTypeValue == FieldTypes.EventLink) {
            var ActivityData = getActivityDataByEntryID(field.LinkedEventID);
            var fldRow = "<tr><td class=\"FieldName\" style='width: 33%'>" + field.FieldName + ' - ' + environmentVars.resx.EventName + "</td>";
            fldRow += "<td class='FieldValue'>";
            fldRow += "<div id=\"FieldValue-value_Fld_EN_" + field.FieldGroupID + "" + field.EntryId + "\">";
            fldRow += ActivityData.ActivityName == undefined ? '' : ActivityData.ActivityName;
            fldRow += "</div>";
            if (ActivityData.EntryId > 0)
                fldRow += "<span id=\"SingleFldEventLists_" + field.FieldGroupID + "_" + field.EntryId + "\" style='font-size: smaller;'>" + ActivityData.EventTypeName + ',  ' + formatDate(ActivityData.ActivityStart) + "</span>"
            fldRow += "</td></tr>";
        }
        else {
            //var fldRow = "<tr><td class=\"FieldName\" style='width: 33%'>" + field.FieldName + "</td>";
            var fldRow = "<tr><td class=\"FieldName\" style='width: 33%'>" + (field.IsDefaultEntityField == false ? field.FieldName : field.CatalogFieldName) + "</td>";

            if (field.IsSelectorField) {
                fldRow += "<td id='tdselectorFld-" + field.FieldGroupID + "-" + field.EntryId + "-" + field.CatalogFieldID + "' class='FieldValue tdSelFld'>";
                getSelectorFieldValues(field.FieldGroupID, field.EntryId, field.CatalogFieldID, field.FieldValue, false);
            }
            else {
                fldRow += "<td class='FieldValue'>";
            }
            //        fldRow += "<td class=\"FieldValue\">";
            fldRow += "<div id=\"FieldValue-value_Fld" + field.EntryId + "" + contractId + "\">";
            if (fldTypeValue == FieldTypes.ListSingle) {
                //                fldRow += ((field.FieldValue != null && field.FieldValue != "") ? field.FieldOptionValues[field.FieldOptionIDs.indexOf(field.FieldValue)] : "");
                if (field.FieldType == FieldTypes.EntityLink)
                    fldRow += ((field.FieldValue != null && field.FieldValue != "") ? field.CatalogFieldOptionValues[field.CatalogFieldOptionIDs.indexOf(field.FieldValue)] : "");
                else
                    fldRow += ((field.FieldValue != null && field.FieldValue != "") ? field.FieldOptionValues[field.FieldOptionIDs.indexOf(field.FieldValue)] : "");
            }
            else if (fldTypeValue == FieldTypes.Currency || field.FieldType == FieldTypes.CalculatedCurrency) {
                //fldRow += field.FieldValue + " " + GetCurrencyValue(field.FieldCurrencyID);commented by deepak dhamija (08 march,2013)
                fldRow += (field.FieldValue != null ? field.FieldValue + " " + GetCurrencyValue(field.FieldCurrencyID) : ""); //Remove the null values for single field records --added by deepak dhamija (08 march,2013)
            }
            else if (fldTypeValue == FieldTypes.DocumentLink) {
                var docData = getDocumentsByEntryID(field.LinkedDocumentID);
                var fldRow = "<tr><td class=\"FieldName\" style='width: 33%'>" + field.FieldName + ' - ' + environmentVars.resx.DocumentName + "</td>";
                fldRow += "<td class='FieldValue'>";
                fldRow += "<div id=\"FieldValue-value_Fld_Doc_" + field.FieldGroupID + "" + field.EntryId + "\">";
                fldRow += docData.DocName == undefined ? '' : docData.DocName;
                fldRow += "</div>";
                if (docData.EntryId > 0) {
                    fldRow += "<div style='float:left; width:100%'>"
                    fldRow += "<span style='font-size: smaller;' id=\"SingleFldDocumentList_" + field.FieldGroupID + "_" + field.EntryId + "\">" + environmentVars.resx.FileType + ": " + docData.FileName + ", " + environmentVars.resx.FileSize + ": " + docData.FileSize + ", " + environmentVars.resx.FileAddedby + ": " + docData.UpdateUserName + " " + environmentVars.resx.FileCreatedOn + " " + formatDate(docData.UpdateDate) + "</span>"
                    fldRow += "</div>";
                    fldRow += "<div id='dvsingleopenFile'>"
                    fldRow += "<a href='" + docData.FileUrl + "' target='_blank' style='font-size: smaller;' id=\"anDocSingleFileDocumentList_" + field.FieldGroupID + "_" + field.EntryId + "\">" + environmentVars.resx.OpenFile + "</span>"
                    fldRow += "</div>";
                }
                fldRow += "</td></tr>";
            }
            else if (fldTypeValue == FieldTypes.UserLink) {
                var usrData = getUserDataByEntryID(field.LinkedUserID);
                var fldRow = "<tr><td class=\"FieldName\" style='width: 33%'>" + field.FieldName + ' - ' + environmentVars.resx.UserName + "</td>";
                fldRow += "<td class='FieldValue'>";
                fldRow += "<div id=\"FieldValue-value_Fld_US_" + field.FieldGroupID + "" + field.EntryId + "\">";
                fldRow += usrData == undefined || usrData.length <= 0 ? '' : usrData.name;
                fldRow += "</div>";
                fldRow += "</td></tr>";
            }
            else if (fldTypeValue == FieldTypes.Boolean) {
                field.FieldValue = (field.FieldValue != null ? field.FieldValue : "");
                if (field.FieldValue == "1")
                    fldRow += environmentVars.resx.Yes;
                else if (field.FieldValue == "0")
                    fldRow += environmentVars.resx.No;
                else
                    fldRow += field.FieldValue;
            }
            else if (field.IsSelectorField) {
                fldRow += field.IsSelectorFieldValue != null ? field.IsSelectorFieldValue : '';
            }
            else {
                field.FieldValue = (field.FieldValue != null ? field.FieldValue : ""); //Remove the null values for single field records --added by deepak dhamija (08 march,2013)
                fldRow += fldTypeValue == FieldTypes.TextArea ? replaceLineFeedsWithLineBreaks(field.FieldValue) : field.FieldValue;
            }
            fldRow += "</div>";

            if (fldTypeValue == FieldTypes.Currency) {
                fldRow += '<div id="CurrencyList_' + SingleContractFieldGroup.EntryId + '_' + field.EntryId + '_' + field.CatalogFieldID + '_' + contractId + '" style="width:35%; float: right;"></div>';
            }
            fldRow += "</td></tr>";
        }

        if (isParentContract)
            $(field.IsDefaultEntityField ? "#DefEntTbl-" + field.EntryId + "-" + contractId : "#" + elemid).append(fldRow);
        else
            $(field.IsDefaultEntityField ? "#DefEntTbl-" + field.EntryId : "#" + elemid).append(fldRow);
    });
}

var Sumk = 0;
function renderSingleFieldGroupForContractSummary(SingleContractFieldGroup, isParentContract, contractId, contractTitle) {
    Sumk = Sumk + 1;
    var id = SingleContractFieldGroup.EntryId + "" + (isParentContract ? contractID : "") + "" + Sumk;
    var elemid = "tblSummarySingleEntityTypeField-" + id;
    var fgTable;
    if (isParentContract) {
        fgTable = "<table class=\"FieldsTableView SingleFieldGroups parentContractFieldsInfo\"><tr><td colspan=\"2\" class=\"SectionHeader\"></td></tr></table>";
        fgTable += "<table style='background-color:#b6b6b6;' id=\"" + elemid + "\" width=\"100%\" class=\"FieldsTableView SingleFieldGroups parentContractFieldsInfo\">";
        fgTable += "<tr><td colspan=\"2\" style='font-size: 1.1em; color:black;padding:0 0 10px 0;'>";
        //        if (ContrId == null || ContrId != contractId) {
        fgTable += "<span style='Font-size:13px; padding:0 0 0 6px; color:black'>" + environmentVars.resx.ParentContract + ": " + "</span> <span style='Font-size:17px;font-weight: bold; color:black;'> [#" + contractId + "] " + contractTitle + "</span>";
        ContrId = contractId;
        fgTable += "<tr style='height:3px;'><td style=background-color:#7F8082; height:2px;' colspan=\"2\"></td></tr>";
        // }
        fgTable += "<tr><td colspan=\"2\" style='color:black; font-size: 1.1em;font-weight: bold; padding:0 0 0 6px;'>";
    }
    else {
        fgTable = "<table id=\"" + elemid + "\" width=\"100%\" class=\"FieldsTableView SingleFieldGroups\">";
        fgTable += "<tr><td colspan=\"2\" class=\"SectionHeader\">";
    }
    fgTable += SingleContractFieldGroup.FieldGroupName;
    fgTable += "</td></tr>";
    fgTable += "</table>";
    $("#tdContractPropertiesSummary").append(fgTable);

    $.each(SingleContractFieldGroup.ContractFields, function (indx, field) {
        if (field.IsDefaultEntityField) {
            if (isParentContract)
                $("#" + elemid).append(getEntityFieldsTableHeaderForParantContract(field, false, true, false, contractId));
            else
                $("#" + elemid).append(getEntityFieldsTableHeader(field, false, true));
        }

        var fldTypeValue = (field.FieldType == FieldTypes.EntityLink ? field.CatalogFieldType : field.FieldType);

        if (fldTypeValue == FieldTypes.EventLink) {
            var ActivityData = getActivityDataByEntryID(field.LinkedEventID);
            var fldRow = "<tr><td class=\"FieldName\" style='width: 33%'>" + field.FieldName + ' - ' + environmentVars.resx.EventName + "</td>";
            fldRow += "<td class='FieldValue'>";
            fldRow += "<div id=\"FieldValue-value_Fld_EN\">";
            fldRow += ActivityData.ActivityName == undefined ? '' : ActivityData.ActivityName;
            fldRow += "</div>";
            if (ActivityData.EntryId > 0)
                fldRow += "<span id=\"SingleFldEventLists\" style='font-size: smaller;'>" + ActivityData.EventTypeName + ',  ' + formatDate(ActivityData.ActivityStart) + "</span>"
            fldRow += "</td></tr>";
        }
        else {
            var fldRow = "<tr><td class=\"FieldName\" style='width: 33%'>" + (field.FieldType == FieldTypes.EntityLink ? field.CatalogFieldName : field.FieldName) + "</td>";

            if (field.IsSelectorField) {
                fldRow += "<td class='FieldValue tdSelFld'>";
                //getSelectorFieldValues(field.FieldGroupID, field.EntryId, field.FieldValue, false);
            }
            else {
                fldRow += "<td class='FieldValue'>";
            }
            //        fldRow += "<td class=\"FieldValue\">";
            fldRow += "<div id=\"FieldValue-value_Fld\">";
            if (fldTypeValue == FieldTypes.ListSingle) {
                //fldRow += ((field.FieldValue != null && field.FieldValue != "") ? field.FieldOptionValues[field.FieldOptionIDs.indexOf(field.FieldValue)] : "");
                if (field.FieldType == FieldTypes.EntityLink)
                    fldRow += ((field.FieldValue != null && field.FieldValue != "") ? field.CatalogFieldOptionValues[field.CatalogFieldOptionIDs.indexOf(field.FieldValue)] : "");
                else
                    fldRow += ((field.FieldValue != null && field.FieldValue != "") ? field.FieldOptionValues[field.FieldOptionIDs.indexOf(field.FieldValue)] : "");
            }
            else if (fldTypeValue == FieldTypes.Currency || field.FieldType == FieldTypes.CalculatedCurrency) {
                //fldRow += field.FieldValue + " " + GetCurrencyValue(field.FieldCurrencyID);commented by deepak dhamija (08 march,2013)
                fldRow += (field.FieldValue != null ? field.FieldValue + " " + GetCurrencyValue(field.FieldCurrencyID) : ""); //Remove the null values for single field records --added by deepak dhamija (08 march,2013)
            }
            else if (fldTypeValue == FieldTypes.DocumentLink) {
                var docData = getDocumentsByEntryID(field.LinkedDocumentID);
                var fldRow = "<tr><td class=\"FieldName\" style='width: 33%'>" + field.FieldName + ' - ' + environmentVars.resx.DocumentName + "</td>";
                fldRow += "<td class='FieldValue'>";
                fldRow += "<div id=\"FieldValue-value_Fld_Doc\">";
                fldRow += docData.DocName == undefined ? '' : docData.DocName;
                fldRow += "</div>";
                if (docData.EntryId > 0) {
                    fldRow += "<div style='float:left; width:100%'>"
                    fldRow += "<span style='font-size: smaller;' id=\"SingleFldDocumentList\">" + environmentVars.resx.FileType + ": " + docData.FileName + ", " + environmentVars.resx.FileSize + ": " + docData.FileSize + ", " + environmentVars.resx.FileAddedby + ": " + docData.UpdateUserName + " " + environmentVars.resx.FileCreatedOn + " " + formatDate(docData.UpdateDate) + "</span>"
                    fldRow += "</div>";
                    fldRow += "<div id='dvsingleopenFile'>"
                    fldRow += "<a href='" + docData.FileUrl + "' target='_blank' id='anDocSingleFile' style='font-size: smaller;'>" + environmentVars.resx.OpenFile + "</span>"
                    fldRow += "</div>";
                }
                fldRow += "</td></tr>";
            }
            else if (fldTypeValue == FieldTypes.UserLink) {
                var usrData = getUserDataByEntryID(field.LinkedUserID);
                var fldRow = "<tr><td class=\"FieldName\" style='width: 33%'>" + field.FieldName + ' - ' + environmentVars.resx.UserName + "</td>";
                fldRow += "<td class='FieldValue'>";
                fldRow += "<div id=\"FieldValue-value_Fld_US\">";
                fldRow += usrData == undefined || usrData.length <= 0 ? '' : usrData.name;
                fldRow += "</div>";
                fldRow += "</td></tr>";
            }
            else if (fldTypeValue == FieldTypes.Boolean) {
                field.FieldValue = (field.FieldValue != null ? field.FieldValue : "");
                if (field.FieldValue == "1")
                    fldRow += environmentVars.resx.Yes;
                else if (field.FieldValue == "0")
                    fldRow += environmentVars.resx.No;
                else
                    fldRow += field.FieldValue;
            }
            else if (field.IsSelectorField) {
                fldRow += field.IsSelectorFieldValue != null ? field.IsSelectorFieldValue : '';
            }
            else {
                field.FieldValue = (field.FieldValue != null ? field.FieldValue : ""); //Remove the null values for single field records --added by deepak dhamija (08 march,2013)
                fldRow += fldTypeValue == FieldTypes.TextArea ? replaceLineFeedsWithLineBreaks(field.FieldValue) : field.FieldValue;
            }
            fldRow += "</div>";
            if (fldTypeValue == FieldTypes.Currency) {
                fldRow += '<div id="CurrencyList" style="width:35%; float:left"></div>';
            }
            fldRow += "</td></tr>";
        }
        if (isParentContract)
            $(field.IsDefaultEntityField ? "#SummaryDefEntTbl-" + field.AssociatedToFieldID + "-" + contractId : "#" + elemid).append(fldRow);
        else
            $(field.IsDefaultEntityField ? "#SummaryDefEntTbl-" + field.AssociatedToFieldID : "#" + elemid).append(fldRow);
    });
}

function flShowDialog(editable, recordCounter, fieldGroupId, isNew) {
    var dialogTitle;
    if (isNew) {
        dialogTitle = environmentVars.resx.AddDialogTitle;
    }
    else {
        if (editable)
            dialogTitle = environmentVars.resx.EditRecordDialogTitle;
        else
            dialogTitle = environmentVars.resx.ViewRecordDialogTitle;
    }

    buildDialog($("#flDialog"), editable, function () { flDialogCommitItem(recordCounter, fieldGroupId, isNew) }, false, dialogTitle);
}

function flDialogInitItem(field, editable) {
    var dataTable = $('#flDialogData');
    dataTable.find('#FieldGroupName-value').html(field.FieldGroupName);
    dataTable.find('#FieldName-value').html(field.FieldName);
    dataTable.find('#FieldValue-value').html(field.FieldValue != null && field.FieldValue.length > 0 ? field.FieldValue.formatText() : '');

    var fieldValue = dataTable.find('#FieldValue-value').html();

    if (editable)
        editInPlace('#FieldValue-value', true);

    switch (field.FieldType) {
        case 1:
            break;
        case 2:
            $('#txtFieldValue-value').replaceWith('<textarea id="txtFieldValue-value" rows="3" style="width:99%;resize:vertical">' + field.FieldValue + '</textarea>');
            break;
        case 3:
            $('#txtFieldValue-value').addClass(validator.rules.date.selector);
            initDatePicker('#txtFieldValue-value');
            break;
        case 5:
            $('#txtFieldValue-value').addClass(validator.rules.numeric.selector);
            break;
        case 10:
            var ListHtml = "<select id=\"txtFieldValue-value\" style=\"width:100%;\">";
            ListHtml += "<option value=\"\"></option>";
            for (var index = 0; index <= field.FieldOptionIDs.length - 1; index++) {
                if (!(field.FieldOptionValues[index].indexOf('*') > -1 && field.FieldValue != field.FieldOptionIDs[index]))
                    ListHtml += "<option value='" + field.FieldOptionIDs[index] + "'>" + field.FieldOptionValues[index] + "</option>";
            }
            ListHtml += "</select>";
            $('#txtFieldValue-value').replaceWith(ListHtml);
            if (!editable) {
                $("#FieldValue-value").html(field.FieldOptionValues[field.FieldOptionIDs.indexOf(fieldValue)]);
            }
            else {
                if ((dataTable.find('#FieldValue-value').html()).length > 0) {
                    $("#txtFieldValue-value").val(fieldValue);
                }
            }
            break;
        default:
    }
}

function flDialogCommitItem(recordCounter, fieldGroupId, isNew) {
    if (isEditMode) {
        var dataTable = $('#flDialogData');
        if (!validator.validate(dataTable))
            return;

        $("#flDialog").dialog('close');
        //editInPlace('#FieldValue-value', false);     
        var fields = getFieldsByRecordCounter(ContractData.ContractFieldGroups, recordCounter, fieldGroupId);
        //flWorkItem.FieldValue = dataTable.find('#FieldValue-value').text();
        modifyContractFieldValues(fieldGroupId, fields, recordCounter, isNew, false);
        setContractFieldValues(fieldGroupId, fields, recordCounter, isNew);

        initBsFl();

        //RebindCommonGrid('#flGrid', cDataBs.contractFieldGroups);
        toggleFlEditMode(isEditMode);

        isModified = true;

        if (selectedFieldGroupTabID != null && selectedFieldGroupTabID != undefined && selectedFieldGroupTabID != "")
            SelectTab(selectedFieldGroupTabID);
    }
}
//#endregion


//#region #################### APPLICATIONS ##############################
function toggleContractApps(editable) {
    /// <summary>To toggle the controls between edit and view mode</summary>
    /// <param name="editable">tell if contract is in edit or view mode.If "True": edit mode. "No": view mode</param>

    //if (ContractData == null || ContractData.length <= 0 || ContractData.ContractApplications == null || ContractData.ContractApplications.length <= 0)
    //return false;
    //get all the applications
    //Arkady
    if (editable) {
        //make a check if chkApp1 exist
        if ($('#chkApp1').length < 1) {
            $('.trRaw').remove();
            var counter = 1;
            getSysTable(sysTableName_Applications, function () {
                $.each(AppTable, function (i, application) {//mark
                    var tr;
                    $.each(ContractData.ContractApplications, function (it, app) {
                        if (app.EntryId == application.key) {
                            tr = $('<tr class="trRaw"/>').html('<td class="FieldName" ><input type="checkbox" checked="checked" id=chkApp' + counter + ' existingApp="Yes"/></td>');
                        }
                    });
                    if (tr == undefined) {
                        tr = $('<tr class="trRaw"/>').html('<td class="FieldName" ><input type="checkbox" data=' + application.key + ' id=chkApp' + counter + ' existingApp="No"/></td>');
                    }
                    var tdLinks = $('<td class="FieldValue"  />').appendTo(tr);
                    var link = $('<a/>', { text: application.applicationName });
                    //var link = $('<a/>', { href: application.URLContract, text: application.applicationName, target: "_blank", id: "nameApp" + counter, disabled: "true" });
                    tdLinks.append(link); //.append(", "); //mark - end
                    //var tdLinks = $('<td> <input type="checkbox"> </td> <td class="FieldValue"/>').appendTo(tr); arkady
                    $('#tblAppsContract').after(tr);
                    $('#chkApp' + counter).bind('click', function () {
                        //events assinged to checkboxs
                        if ($(this).is(':checked')) {
                            var existingApp = $(this).attr("existingApp");
                            getAppsUrls(ContractData.ID, application.key, existingApp);
                        }
                        else {
                            ContractData.ContractApplications = $.grep(ContractData.ContractApplications, function (element, indx) {
                                return (element.EntryId != application.key);
                            });
                            setContractAppsTable();

                        }
                    });
                    counter++;
                });
            });
            if ($('.SHeader:hidden').length > 0) {
                setContractAppsTable();
            }
        }
    }
    else {//Mark start
        //unbind all events - Arkady
        var counter2 = 1;
        while ($('#chkApp' + counter).length > 0) {
            $('#chkApp' + counter2).unbind();
            counter2++;
        }
        $('.trRaw').remove();
        if (ContractData == null || ContractData.length <= 0 || ContractData.ContractApplications == null || ContractData.ContractApplications.length <= 0) {
            setContractAppsTable(); //in case of empty table
            return false;
        }
        var tr = $('<tr class="trRaw"/>');
        var tdLinks = $('<td class="FieldValue" colspan="2" />').appendTo(tr); //- Mark's line
        $.each(ContractData.ContractApplications, function (i, application) {
            if (application.ContractLink == null)
                return;
            var link = $('<a/>', { href: application.ContractLink, text: application.ApplicationName, target: "_blank", disabled: "true" });
            //var link = $('<a/>', { text: application.ApplicationName });
            if (i + 1 < ContractData.ContractApplications.length)
                tdLinks.append(link).append(", ");
            else
                tdLinks.append(link);
        });
        $('#tblAppsContract').after(tr);
        setContractAppsTable();
    }  //Mark end
    // $('#tblAppsContract').after(tr); - Arkady end
}

function AddDeletedApplications(toAdd) //Arkady
{
    //ContractData.ContractApplications
    //ContractDataCopy.ContractApplications
    if (ContractDataCopy.ContractApplications == null)//in case there is nothing to add/remove
        return;
    var notExist = false;
    if (toAdd) //here we add deleted applications to ContractData, so it will be visible to Server
    {
        if (ContractDataCopy.ContractApplications.length > 0 && ContractDataCopy != null && ContractDataCopy.ContractApplications != null) {
            $.each(ContractDataCopy.ContractApplications, function (iCopy, appCopy) {
                if (ContractData.ContractApplications.length == 0)
                    notExist = true;
                $.each(ContractData.ContractApplications, function (i, app) {
                    if (appCopy.EntryId == app.EntryId) {
                        notExist = false;
                        return false;
                    }
                    if (i + 1 == ContractData.ContractApplications.length)
                        notExist = true;
                });
                if (notExist) {
                    ContractData.ContractApplications.push(appCopy);
                    ContractData.ContractApplications[ContractData.ContractApplications.length - 1].New = false;
                    ContractData.ContractApplications[ContractData.ContractApplications.length - 1].Deleted = true;
                }

            });
        }
    }
    else //here we remove deleted applications from ContractData
    {
        ContractData.ContractApplications = $.grep(ContractData.ContractApplications, function (i, app) {
            return (app.Deleted != true);
        });
    }
}

function getAppsUrls(ContractID, ApplicationID, existingApp)//we get the applications url from Server
{
    /// <summary>to get the applicatons data</summary>
    /// <param name="ContractID">the contract Id to which the application is associated</param>
    /// <param name="ApplicationID">application Id whose Url data is to be fetched</param>
    /// <param name="existingApp">to tell if the application is new or already added to the contract. If "Yes": already associated to contract. "No": new application</param>
    $.ajax({
        type: 'POST',
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        url: "GetApplications",
        data: JSON.stringify({ "ContractID": ContractID, "ApplicationID": ApplicationID }),
        success: function (data) {
            if (data != null && data.hasOwnProperty("ErrorCause")) {
                ShowErrorDialog(data);
                return;
            } //resolved error case from server
            if (data == null)
                return;

            ContractData.ContractApplications.push(data);
            //check, if the application is new or already added to the contract
            if (existingApp == "No")
                ContractData.ContractApplications[ContractData.ContractApplications.length - 1].New = true;
            ContractData.ContractApplications[ContractData.ContractApplications.length - 1].Deleted = false;

            setContractAppsTable();
        },
        error: function (jqXHR, errorStatus, errorThrown) {     // Error Clause added by Viplav on 12 August 2013
            var excTitle = getExeptionMessageFromjqXHR(jqXHR);
            HandleClientSideError(jqXHR.status, errorThrown, excTitle, "ContractViewModel", "getAppsUrls");
        }
    });

}

function setContractAppsTable() {
    $('.trRem').remove();
    $('.SHeader').hide();
    if (ContractData == null || ContractData.length <= 0 || ContractData.ContractApplications == null || ContractData.ContractApplications.length <= 0)
        return false;

    $.each(ContractData.ContractActivities, function (i, activity) {
        var tr = $('<tr class="trRem"/>').html('<td class="FieldName">' + activity.ActivityName + '</td>');
        var tdLinks = $('<td class="FieldValue"/>').appendTo(tr);
        var count = 0;
        $.each(ContractData.ContractApplications, function (i, application) {
            var link = getAppLinks(activity, application.ActivityLinks, ContractData.ContractActivities, application.ApplicationName);
            if (link != null) {
                //if (i + 1 < ContractData.ContractApplications.length)
                tdLinks.append(link).append(", ");
                //else
                //tdLinks.append(link);
                $('#tblAppsActivities').after(tr);
                count++;
            }
        });
        if (count > 0)
            $('#tblAppsActivities').children().first().show();
    });

    if (ContractData.ContractDocs != null) {
        $.each(ContractData.ContractDocs, function (i, item) {
            var tr = $('<tr class="trRem"/>').html('<td class="FieldName">' + item.DocName + '</td>');
            var tdLinks = $('<td class="FieldValue"/>').appendTo(tr);
            var count = 0;
            $.each(ContractData.ContractApplications, function (i, application) {
                var link = getAppLinks(item, application.DocLinks, ContractData.ContractDocs, application.ApplicationName);
                if (link != null) {
                    //if (i + 1 < ContractData.ContractApplications.length)
                    tdLinks.append(link).append(", ");
                    //else
                    //tdLinks.append(link);
                    $('#tblAppsDocs').after(tr);
                    count++;
                }
            });
            if (count > 0)
                $('#tblAppsDocs').children().first().show();
        });
    }

    $.each(ContractData.ContractTodos, function (i, item) {

        // Boaz 28-Aug-2012: (?:) added because of special types of alerts, added by Alerts Extensions, with item.ActivityID negative!
        var tr = $('<tr class="trRem"/>').html('<td class="FieldName">' + item.TodoDate.toDateString() + (item.ActivityID > 0 ? " " + (getCommonGridItemById(ContractData.ContractActivities, item.ActivityID)).ActivityName : "") + '</td>');

        var tdLinks = $('<td class="FieldValue"/>').appendTo(tr);
        var count = 0;
        $.each(ContractData.ContractApplications, function (i, application) {
            var link = getAppLinks(item, application.TodoLinks, ContractData.ContractTodos, application.ApplicationName);
            if (link != null) {
                //if (i + 1 < ContractData.ContractApplications.length)
                tdLinks.append(link).append(", ");
                //else
                //	tdLinks.append(link);
                $('#tblAppsTodos').after(tr);
                count++;
            }
        });
        if (count > 0)
            $('#tblAppsTodos').children().first().show();
    });

    $.each(ContractData.ContractUsers, function (i, item) {
        var tr = $('<tr class="trRem"/>').html('<td class="FieldName">' + item.UserFullName + '</td>');
        var tdLinks = $('<td class="FieldValue"/>').appendTo(tr);
        var count = 0;
        $.each(ContractData.ContractApplications, function (i, application) {
            var link = getAppLinks(item, application.UserLinks, ContractData.ContractUsers, application.ApplicationName);
            if (link != null) {
                //if (i + 1 < ContractData.ContractApplications.length)
                tdLinks.append(link).append(", ");
                //else
                //	tdLinks.append(link);
                $('#tblAppsUser').after(tr);
                count++;
            }
        });
        if (count > 0)
            $('#tblAppsUser').children().first().show();
    });

    var count = 0;
    $.each(ContractData.ContractApplications, function (i, application) {

        if (application.FieldLinks != null) {
            count++;
            var tr = $('<tr class="trRem"/>').html('<td class="FieldName">' + application.ApplicationName + '</td>');
            var tdLinks = $('<td class="FieldValue"/>').appendTo(tr);
            var link = $('<a/>', { text: application.ApplicationName, target: "_blank", id: "fieldLink" + count });
            //link.attr('href', application.FieldLinks);
            //var link = "<a href='" + application.FieldLinks + "' target='_blank'>" + application.ApplicationName + "</a>";
            tdLinks.append(link);
            $('#tblAppsFields').after(tr);

            $('#fieldLink' + count).attr('href', application.FieldLinks);
        }
    });
    if (count > 0)
        $('#tblAppsFields').children().first().show();
}

//#endregion


function RebindCommonGrid(selector, dataSource) {
    var grid = $(selector);
    grid.igGrid("dataSourceObject", dataSource.data);
    grid.igGrid("dataBind");
}

function RebindContractSummaryGrid(selector, dataSource, columnsToHide) {
    $(selector).igGrid('destroy');
    renderSummaryGrid(selector, dataSource, columnsToHide);
}

function removeUnwantedColumns(dataSource, columnsToHide) {
    $.each(columnsToHide, function (i, item) {
        dataSource.data.splice(item, 1);
        dataSource.headers.splice(item, 1);
    });
    return dataSource;
}

function getCommonGridIndexById(dataSource, id) {
    var index = -1;
    $.each(dataSource, function (i, item) {
        if (item.EntryId == id) {
            index = i;
            return false;
        }
    });
    return index;
}

function getContractActivity(activityId) {
    var ContractActivitiesWithParentContractActivites = [];
    $.extend(true, ContractActivitiesWithParentContractActivites, ContractData.ContractActivities);
    if (LoadedContractHasParents) {
        for (var index = 0; index < ParentsContractsInHierarchy.length; index++) {
            $.merge(ContractActivitiesWithParentContractActivites, ParentsContractsInHierarchy[index].ContractActivities);
        }
    }

    var list = $.grep(ContractActivitiesWithParentContractActivites, function (item, i) {
        return item.EntryId == activityId;
    });
    return list[0];
}

function gotoReports() {
    var scStr = "" + ContractData.Properties.ContractID;
    window.open(reports.urlFormat.format(scStr));
}

//#region --------------- CONTRACT CLONING --------------
function ccInit() {
    buildActionDialog("CopyContractDialog", function () { ccDoCopy(); }, null, false, "c80ccb34-4868-49f7-a66f-ab2dcc49d172");
    $(".ui-dialog-buttonpane button:contains('" + environmentVars.resx.CopyContract + "')").button("enable");
    tdBuildActivityCombo('#ccShiftBaseEvent-Value', null);
    initDatePicker('#ccShiftDate-Value');

    $('#selccShiftBaseEvent-Value').attr('disabled', 'disabled');

    $('#ccCopyEvents').live('click', function () {
        if ($(this).is(':checked')) {
            $('#ccCopyAlerts').removeAttr('disabled');
            $('#ccShiftContainer').find('input, select').removeAttr('disabled');
        }
        else {
            $('#ccCopyAlerts').attr('disabled', 'disabled');
            $('#ccShiftContainer').find('input, select').attr('disabled', 'disabled');
        }
    });
}
function ccDoCopy() {
    if (!validator.validate())
        return;

    ShowWaitDialog(environmentVars.resx.CopyingContract);
    $(".ui-dialog-buttonpane button:contains('" + environmentVars.resx.CopyContract + "')").button("disable");
    var shiftActivity = $('#selccShiftBaseEvent-Value').val();
    var shiftDate = $('#ccShiftDate-Value').datepicker('getDate');
    var contractTypeID = $('#cmbCopyContractType').val();
    if (shiftActivity == '') {
        shiftActivity = -1;
        shiftDate = new Date();
    }

    $.ajax({
        type: 'POST',
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        url: urlCopyContract,
        data: JSON.stringify({ "BaseContractID": ContractData.Properties.ContractID, "ContractName": $('#ccName-Value').val().trim()
                               , "ContractTypeID": contractTypeID, "ContractStatusID": $('#cmbccContractStatus').val()
                               , "AssignParentContracts": $('#ccSetParent').is(':checked')
                               , "CopyUsers": $('#ccCopyUsers').is(':checked')
                               , "CopyEvents": $('#ccCopyEvents').is(':checked')
                               , "CopyDocuments": $('#ccCopyDocuments').is(':checked'), "CopyFields": $('#ccCopyFields').is(':checked')
                               , "MoveEventID": shiftActivity, "MoveEventsDate": shiftDate
        }),
        success: function (successData) {
            HideWaitDialog();
            if (successData.hasOwnProperty("ErrorCause")) //The function returned an error...
            {
                ShowErrorDialog(successData);
                return;
            }
            else {
                window.location.href = successData;
            }
        },
        error: function (jqXHR, errorStatus, errorThrown) {     // Error Clause added by Viplav on 12 August 2013
            var excTitle = getExeptionMessageFromjqXHR(jqXHR);
            HandleClientSideError(jqXHR.status, errorThrown, excTitle, "ContractViewModel", "ccDoCopy");
        }
    });
}
//#endregion

//#region ----------- WORD CONNECT -------------
wcPollId = null;
function initWordConnect() {
    buildDialog($('#dlgWordConnect'), false, function () {
        window.clearInterval(wcPollId);
    });
    wcPollId = setInterval("wcDoPoll()", 5000);
}
function wcDoPoll() {
    $.ajax({
        type: 'GET',
        dataType: "jsonp",
        contentType: "application/json; charset=utf-8",
        //		url: eContractsRootPath + "services/WordService.svc/PollAllBookmarks",
        url: eContractsRootPath + "handler.ashx?op=pollAllBookmarks",
        data: null,
        success: function (data) {
            if (data == null || data.d == null)
                return;

            console.log(data.d);
            $('.wc-count').text(parseInt($('.wc-count').text()) + data.d.length);
        },
        error: function (jqXHR, errorStatus, errorThrown) {     // Error Clause added by Viplav on 12 August 2013
            var excTitle = getExeptionMessageFromjqXHR(jqXHR);
            HandleClientSideError(jqXHR.status, errorThrown, excTitle, "ContractViewModel", "wcDoPoll");
        }
    });
}

//#endregion

function clearDeletedEnteries() {
    /// <summary>Clears the deleted enteries array.</summary>
    /// <param></param>
    /// <returns></returns>
    deletedContractEvents = [];
    deletedContractAlerts = [];
    deletedContractAuthEntities = [];
    deletedContractDocs = [];
    deletedContractFields = [];
}

//Arkady
function initPrEventsBinding() {
    $('#selParentContractName_2').live('click', function () {
        if ($('#selParentContractName_2').val() != "" && ContractData.ParentContract == null) {
            $('#btnPrefsSaveStay').button({ 'disabled': true });
        }
        else if (ContractData.ParentContract != null && $('#selParentContractName_2').val() != ContractData.ParentContract.ID) {
            $('#btnPrefsSaveStay').button({ 'disabled': true });
        }
        else {
            $('#btnPrefsSaveStay').button({ 'disabled': false });
        }
    });
}
//Arkady - end

// Mohit
function editSingleFieldGroups(editable) {
    if (editable) {
        var singleFieldGroups = $.grep(ContractData.ContractFieldGroups, function (item, i) {
            return item.SingleRecord == true;
        });

        $.each(singleFieldGroups, function (i, contractFieldGroup) {
            if ((contractFieldGroup.AllowToAllRoles) || (contractFieldGroup.RoleIDsEditable.indexOf(role.ID) >= 0)) {
                $.each(contractFieldGroup.ContractFields, function (index, contractField) {
                    var elem = $("#FieldValue-value_Fld" + contractField.EntryId + ContractData.ID);
                    if (contractField.IsSelectorField) {
                        elem.replaceWith("<select id='selectorFld-" + contractField.FieldGroupID + "-" + contractField.EntryId + "-" + contractField.CatalogFieldID + "' class='entitySelectorFld' style='width:100%;'></select>");

                        getSelectorFieldValues(contractField.FieldGroupID, contractField.EntryId, contractField.CatalogFieldID, (editable && contractField.FieldValue != null && contractField.FieldValue != undefined && contractField.FieldValue != "" ? contractField.FieldValue : ""), true);
                    }
                    else {
                        if (contractField.FieldType != FieldTypes.CalculatedRealNumber && contractField.FieldType != FieldTypes.CalculatedCurrency && contractField.FieldType != FieldTypes.Autonumber) {
                            var textFieldID = "txtFieldValue-value_Fld-" + contractField.EntryId + "-" + contractField.FieldGroupID + "-" + ContractData.ID;
                            if (contractField.IsDefaultEntityField)
                                textFieldID += "-" + contractField.CatalogFieldID;

                            if (contractField.FieldType == FieldTypes.Currency) {
                                elem.replaceWith('<input onkeyup="ShowCurrenctSelection(' + "'" + textFieldID + "'" + "," + "'" + "selCurrencyList_" + contractFieldGroup.EntryId + "_" + contractField.EntryId + "_" + contractField.CatalogFieldID + "_" + ContractData.ID + "'" + ');" id="' + textFieldID + '" style="width:63%;float: left;" value="' + (contractField.FieldValue != null ? contractField.FieldValue : "") + '"></input>');

                            } else {
                                elem.replaceWith('<input id="' + textFieldID + '" style="width:99%;" value="' + (contractField.FieldValue != null ? contractField.FieldValue : "") + '"></input>');
                            }

                            var fieldTypeVal = (contractField.FieldType == FieldTypes.EntityLink ? contractField.CatalogFieldType : contractField.FieldType);

                            //switch (contractField.FieldType) {
                            switch (fieldTypeVal) {
                                case FieldTypes.Text:
                                    break;
                                case FieldTypes.TextArea:
                                    $("#" + textFieldID).replaceWith('<textarea id="' + textFieldID + '" rows="3" style="width:99%;resize:vertical">' + (contractField.FieldValue != null ? contractField.FieldValue : "") + '</textarea>');
                                    break;
                                case FieldTypes.Date:
                                    $("#" + textFieldID).replaceWith('<input id="' + textFieldID + '" style="width:99%;" value="' + (contractField.FieldValue != null ? contractField.FieldValue : "") + '"></input>');
                                    $("#" + textFieldID).addClass(validator.rules.date.selector);
                                    initDatePicker("#" + textFieldID);
                                    break;
                                case FieldTypes.Integer:
                                    $("#" + textFieldID).addClass(validator.rules.numeric.selector);
                                    break;
                                case FieldTypes.ListSingle:
                                    var ListHtml = "<select id='" + textFieldID + "' style=\"width:100%;\">";
                                    ListHtml += "<option value=\"\"></option>";
                                    //                                    for (var index = 0; index <= contractField.FieldOptionIDs.length - 1; index++) {
                                    //                                        if (!(contractField.FieldOptionValues[index].indexOf('*') > -1 && contractField.FieldValue != contractField.FieldOptionIDs[index]))
                                    //                                            ListHtml += "<option value='" + contractField.FieldOptionIDs[index] + "'>" + contractField.FieldOptionValues[index] + "</option>";
                                    //                                    }

                                    if (contractField.FieldType == FieldTypes.EntityLink) {
                                        for (var index = 0; index <= contractField.CatalogFieldOptionIDs.length - 1; index++) {
                                            if (!(contractField.CatalogFieldOptionValues[index].indexOf('*') > -1 && contractField.FieldValue != contractField.CatalogFieldOptionIDs[index]))
                                                ListHtml += "<option value='" + contractField.CatalogFieldOptionIDs[index] + "'>" + contractField.CatalogFieldOptionValues[index] + "</option>";
                                        }
                                    }
                                    else {
                                        for (var index = 0; index <= contractField.FieldOptionIDs.length - 1; index++) {
                                            if (!(contractField.FieldOptionValues[index].indexOf('*') > -1 && contractField.FieldValue != contractField.FieldOptionIDs[index]))
                                                ListHtml += "<option value='" + contractField.FieldOptionIDs[index] + "'>" + contractField.FieldOptionValues[index] + "</option>";
                                        }
                                    }

                                    ListHtml += "</select>";
                                    $("#" + textFieldID).replaceWith(ListHtml);
                                    //                    if (!editable)
                                    //                    {
                                    //                        $("#FieldValue-value").html(field.FieldOptionValues[field.FieldOptionIDs.indexOf(fieldValue)]);
                                    //                    }
                                    //                    else
                                    //                    {
                                    if (($("#" + textFieldID).html()).length > 0) {
                                        $("#" + textFieldID).val(contractField.FieldValue);
                                    }
                                    //                    }
                                    break;
                                case FieldTypes.Currency:
                                    $("#" + textFieldID).addClass(validator.rules.numeric.selector);
                                    $('#CurrencyList_' + contractFieldGroup.EntryId + '_' + contractField.EntryId + '_' + contractField.CatalogFieldID + '_' + ContractData.ID + '').find('option').remove();
                                    initCombo(sysTableName_Currencies, Currencies, '#CurrencyList_' + contractFieldGroup.EntryId + '_' + contractField.EntryId + '_' + contractField.CatalogFieldID + '_' + ContractData.ID + '', contractField.FieldCurrencyID);
                                    //Currency Dropdown enabled if Curreny textbox contains any value other wise it must be disabled in single field group--Added by deepak dhamija (07 march,2013)
                                    if ($("#" + textFieldID).val() != "") {
                                        $("#selCurrencyList_" + contractFieldGroup.EntryId + "_" + contractField.EntryId + "_" + contractField.CatalogFieldID + "_" + ContractData.ID).val(contractField.FieldCurrencyID);
                                        $("#selCurrencyList_" + contractFieldGroup.EntryId + "_" + contractField.EntryId + "_" + contractField.CatalogFieldID + "_" + ContractData.ID).removeAttr('disabled');
                                    }
                                    else {
                                        $("#selCurrencyList_" + contractFieldGroup.EntryId + "_" + contractField.EntryId + "_" + contractField.CatalogFieldID + "_" + ContractData.ID + " option:eq(0)").attr("selected", "selected");
                                        $("#selCurrencyList_" + contractFieldGroup.EntryId + "_" + contractField.EntryId + "_" + contractField.CatalogFieldID + "_" + ContractData.ID).attr('disabled', "disabled");
                                    }

                                    //$("#selCurrencyList_" + contractFieldGroup.EntryId + "_" + contractField.EntryId + "_" + contractField.CatalogFieldID + "_" + ContractData.ID).attr("disabled", !contractField.IsEditable);
                                    //end code  
                                    break;
                                case FieldTypes.EventLink:
                                    var EventLinkID = "FieldValue-value_Fld_EN_" + contractFieldGroup.EntryId + '' + contractField.EntryId;
                                    //var id="EventLists_"+contractFieldGroup.EntryId+"_"+ contractField.EntryId +"";
                                    var eventFldHtml = "<div id='EventLists_" + contractFieldGroup.EntryId + "_" + contractField.EntryId + "' class='evtlists' style='width:72%;float: left;'></div>";
                                    if (role.AddActivities)
                                        eventFldHtml += "<button class=\"ec-button addEtFlds\" style=\"margin: 0 20px; float:right;\" data-fieldgroupid='" + contractFieldGroup.EntryId + "_" + contractField.EntryId + "'>" + environmentVars.resx.Add + "</button>";
                                    eventFldHtml += "<br/><br/>";
                                    $("#" + EventLinkID).replaceWith(eventFldHtml);
                                    buildComboControl($('#EventLists_' + contractFieldGroup.EntryId + "_" + contractField.EntryId), Activities, null);
                                    if (contractField.LinkedEventID != null) {
                                        $("#selEventLists_" + contractFieldGroup.EntryId + "_" + contractField.EntryId).val(contractField.LinkedEventID);
                                        addmultipleAct.push(contractFieldGroup.EntryId + "_" + contractField.EntryId + "val" + contractField.LinkedEventID);
                                    }
                                    break;
                                case FieldTypes.DocumentLink:
                                    var LinkedDocumentID = "FieldValue-value_Fld_Doc_" + contractFieldGroup.EntryId + '' + contractField.EntryId;
                                    var docFldHtml = "<div id='DocumentList_" + contractFieldGroup.EntryId + "_" + contractField.EntryId + "' class='docsinglelist' style='width:72%;float: left;'></div>";
                                    if (role.AddDocs)
                                        docFldHtml += "<button class=\"ec-button addDocFlds\" style=\"margin: 0 20px; float:right;\" data-fieldgroupid='" + contractFieldGroup.EntryId + "_" + contractField.EntryId + "'>" + environmentVars.resx.Add + "</button>";
                                    docFldHtml += "<br/><br/>";
                                    $("#" + LinkedDocumentID).replaceWith(docFldHtml);
                                    buildComboControl($('#DocumentList_' + contractFieldGroup.EntryId + "_" + contractField.EntryId), DocumentList, null);
                                    if (contractField.LinkedDocumentID != null) {
                                        $("#selDocumentList_" + contractFieldGroup.EntryId + "_" + contractField.EntryId).val(contractField.LinkedDocumentID);
                                        addmultipleDocs.push(contractFieldGroup.EntryId + "_" + contractField.EntryId + "val" + contractField.LinkedDocumentID);
                                    }
                                    break;
                                case FieldTypes.UserLink:
                                    var UserLinkID = "FieldValue-value_Fld_US_" + contractFieldGroup.EntryId + '' + contractField.EntryId;
                                    //$("#" + UserLinkID).replaceWith('<div id=UserLists_' + contractFieldGroup.EntryId + "_" + contractField.EntryId + ' class="usrlists" style="width:100%;float: left;"></div><button class="ec-button addUsFlds" style="margin: 0 20px; float:right;" data-fieldgroupid=' + contractFieldGroup.EntryId + "_" + contractField.EntryId + ">" + environmentVars.resx.Add + "</button><br/><br/>");
                                    $("#" + UserLinkID).replaceWith('<div id=UserLists_' + contractFieldGroup.EntryId + "_" + contractField.EntryId + ' class="usrlists" style="width:100%;float: left;"></div>');
                                    //buildComboControl($('#UserLists_' + contractFieldGroup.EntryId + "_" + contractField.EntryId), ConUsers, null);
                                    getSysTable(sysTableName_Users, function () {
                                        buildComboControl($('#UserLists_' + contractFieldGroup.EntryId + "_" + contractField.EntryId), Users, null);
                                    });
                                    if (contractField.LinkedUserID != null)
                                        $("#selUserLists_" + contractFieldGroup.EntryId + "_" + contractField.EntryId).val(contractField.LinkedUserID);
                                    break;
                                case FieldTypes.Boolean:
                                    var booleanrow = '<input type="radio"  style="width:6%;" value="1" name=rdo_' + contractFieldGroup.EntryId + "_" + contractField.EntryId;
                                    booleanrow += '>' + environmentVars.resx.Yes + '</input>';
                                    booleanrow += '<input type="radio" style="width:6%;" value="0" name=rdo_' + contractFieldGroup.EntryId + "_" + contractField.EntryId;
                                    booleanrow += '>' + environmentVars.resx.No + '</input>';
                                    booleanrow += "<button class=\"ec-button resetSelectionSingle\" style=\"margin: 0 20px; float:right;\" data-fieldgroupid='" + contractFieldGroup.EntryId + "_" + contractField.EntryId + "'>" + environmentVars.resx.Reset + "</button>";
                                    booleanrow += "</td></tr>";
                                    $("#" + textFieldID).replaceWith(booleanrow);
                                    if (contractField.FieldValue != null)
                                        $('input:radio[name=rdo_' + contractFieldGroup.EntryId + "_" + contractField.EntryId + '][value=' + contractField.FieldValue + ']').attr('checked', true);
                                    break;
                                default:
                                    break;
                            }

                            $("#" + textFieldID).attr("disabled", !contractField.IsEditable);
                        }
                    }
                });
            }
        });
    }

    setIndependentGroupsHeight();
}

// Mohit - 27
function saveSingleFieldGroups() {
    var singleFieldGroups = $.grep(ContractData.ContractFieldGroups, function (item, i) {
        return item.SingleRecord == true;
    });
    $.each(singleFieldGroups, function (i, contractFieldGroup) {
        if ((contractFieldGroup.AllowToAllRoles) || (contractFieldGroup.RoleIDsEditable.indexOf(role.ID) >= 0)) {
            $.each(contractFieldGroup.ContractFields, function (index, contractField) {
                //            var elem = $("#FieldValue-value_Fld" + contractField.EntryId);
                //            var textFieldID = "txtFieldValue-value_Fld" + contractField.EntryId;

                if (contractField.FieldType == FieldTypes.Currency) {
                    contractField.FieldValue = contractField.IsSelectorField ? $("#selectorFld-" + contractField.FieldGroupID + "-" + contractField.EntryId + " option:selected").text() : $("#txtFieldValue-value_Fld-" + contractField.EntryId + "-" + contractField.FieldGroupID + "-" + ContractData.ID).val();
                    contractField.FieldCurrencyID = $("#selCurrencyList_" + contractFieldGroup.EntryId + "_" + contractField.EntryId + "_" + contractField.CatalogFieldID + "_" + ContractData.ID).val();
                }
                else if (contractField.FieldType == FieldTypes.EventLink) {
                    contractField.LinkedEventID = $("#selEventLists_" + contractFieldGroup.EntryId + "_" + contractField.EntryId).val();
                }
                else if (contractField.FieldType == FieldTypes.DocumentLink) {
                    contractField.LinkedDocumentID = $("#selDocumentList_" + contractFieldGroup.EntryId + "_" + contractField.EntryId).val();
                }
                else if (contractField.FieldType == FieldTypes.UserLink) {
                    contractField.LinkedUserID = $("#selUserLists_" + contractFieldGroup.EntryId + "_" + contractField.EntryId).val();
                }
                else if (contractField.FieldType == FieldTypes.Boolean) {
                    contractField.FieldValue = $('input:radio[name=rdo_' + contractFieldGroup.EntryId + "_" + contractField.EntryId + ']:checked').val();
                }
                else {
                    contractField.FieldValue = contractField.IsSelectorField ? $("#selectorFld-" + contractField.FieldGroupID + "-" + contractField.EntryId + "-" + contractField.CatalogFieldID + " option:selected").data('contractid') : contractField.IsDefaultEntityField ? $("#txtFieldValue-value_Fld-" + contractField.EntryId + "-" + contractField.FieldGroupID + "-" + ContractData.ID + "-" + contractField.CatalogFieldID).val() : $("#txtFieldValue-value_Fld-" + contractField.EntryId + "-" + contractField.FieldGroupID + "-" + ContractData.ID).val();
                }
            });
        }
    });
}

function getFieldsByRecordCounter(datasource, RecordCounterID, FieldGroupID) {
    var selectedMultipleFG = $.grep(datasource, function (item, i) {
        return item.EntryId == FieldGroupID;
    });

    if ((selectedMultipleFG != null || selectedMultipleFG != undefined) && (selectedMultipleFG[0] != null || selectedMultipleFG[0] != undefined))
        var fieldsByRecordCounter = $.grep(selectedMultipleFG[0].ContractFields, function (field, i) {
            return field.RecordCounter == RecordCounterID;
        });

    return fieldsByRecordCounter;
}

$('.evtlist').live('change', function () {
    var SelectionID = $(this).attr("id");
    var actData = getActivityDataByEntryID($(this).find('select').find('option:selected').val());
    if (actData.EntryId > 0)
        $('#MultipleFld' + SelectionID).html(actData.EventTypeName + ', ' + formatDate(actData.ActivityStart));
    else
        $('#MultipleFld' + SelectionID).html("");
});

$('.evtlists').live('change', function () {
    var SelectionID = $(this).attr("id");
    var actData = getActivityDataByEntryID($(this).find('select').find('option:selected').val());
    if (actData.EntryId > 0)
        $('#SingleFld' + SelectionID).html(actData.EventTypeName + ', ' + formatDate(actData.ActivityStart));
    else
        $('#SingleFld' + SelectionID).html("");
});

var EntityTypeFieldsWithName = [];

function getEntityFieldsTableHeaderForParantContract(field, isNew, renderAsSummary, renderCatalogRecordSearchIcon, contractID) {
    var row = "";
    var selectedCatalogFieldID;
    if (renderAsSummary ? $("#SummaryDefEntTbl-" + field.EntryId + "-" + contractID).length > 0 : $("#DefEntTbl-" + field.EntryId + "-" + contractID).length > 0) {
    }
    else {
        var entityTypeFieldName = "";
        $.each(EntityTypeFieldsWithName, function (i, item) {
            if (item.FieldID == field.EntryId) {
                entityTypeFieldName = item.FieldName;
                selectedCatalogFieldID = item.FieldID;
            }
        });
        row = "<tr><td colspan='2'>";
        if (!renderAsSummary)
            row += "<table width='100%' id='DefEntTbl-" + field.EntryId + '-' + contractID + "' class='dialogTable entityfldtbl'>";
        else
            row += "<table width='100%' id='SummaryDefEntTbl-" + field.EntryId + '-' + contractID + "' class='dialogTable entityfldtbl'>";
        row += "<tr><td class='FieldName' style='text-align: left; font-weight: bold;'>" + entityTypeFieldName + "</td>";
        if (environmentVars.isRTL == "True")
            row += "<td align='left'>";
        else
            row += "<td align='right'>";

        if (renderCatalogRecordSearchIcon == null || renderCatalogRecordSearchIcon == undefined)
            renderCatalogRecordSearchIcon = true;
        if (!renderAsSummary && renderCatalogRecordSearchIcon)
            row += "<a class='viewCtrl gridActionButton searchCatalogRecord' style='display:none;' onclick='return displayCatalogRecordSearchDialog(this);' data-fieldId='" + selectedCatalogFieldID + "'></a>";
        //row += isNew == false && renderAsSummary == false ? "<a class='viewCtrl gridActionButton view' onclick='return displayEntityFldRecordDialog(this);'></a>" : "";
        row += renderAsSummary == false ? "<a class='viewCtrl gridActionButton view' onclick='return displayEntityFldRecordDialog(this);'></a>" : "";
        row += "</td></tr>";
        row += "</table>";
        row += "</td></tr>";
        //getFieldNameByID(field.AssociatedToFieldID);
    }
    return row;
}

//function fillSelectorFieldValues(contractId, fieldGroupId, fieldId, orgfieldgroupid, catalogFieldId) {

//Currency Dropdown enabled if we enter any value in Curreny textbox other wise it must be disabled--Added by deepak dhamija (06 march,2013)
function ShowCurrenctSelection(CurrentFieldvalueID, selectionbox) {
    if ($("#" + CurrentFieldvalueID).val() != null && $("#" + CurrentFieldvalueID).val() != "") {
        $("#" + selectionbox).removeAttr('disabled');
        if ($("#" + selectionbox).val() == 0) {
            if (environmentVars.defaultCurrencyId > 0)
                $("#" + selectionbox).val(environmentVars.defaultCurrencyId);
            else
                $("#" + selectionbox + " option:eq(1)").attr("selected", "selected");
        }
    }
    else {
        $("#" + selectionbox + " option:eq(0)").attr("selected", "selected");
        $("#" + selectionbox).attr('disabled', 'disabled');
    }
}
//end code

//#region #################### GALLERIES ##############################

var galleryImgsIndex = 0;

function renderGalleries() {
    $("#accordion").html("");
    if (ContractData.ContractGalleries != null && ContractData.ContractGalleries != undefined && ContractData.ContractGalleries.length > 0) {
        $.each(ContractData.ContractGalleries, function (i, gallery) {
            var imgIndex = 0;
            var galleryHtml = "";
            galleryHtml += "<h3 class=\"title cgRowActions\">" + formatDate(gallery.CreatedOn) + "  " + gallery.GalleryName;
            if (role != null) {
                if (role.DeleteGallery)
                    galleryHtml += "<a class=\"editCtrl gridActionButton delete\" data-itemid=\"" + gallery.EntryId + "\" style=\"float: right; display:none;\"></a>"; // Gallery icons
                if (role.EditGallery)
                    galleryHtml += "<a class=\"editCtrl gridActionButton edit\" data-itemid=\"" + gallery.EntryId + "\" style=\"float: right; display:none;\"></a>"; // Gallery icons
            }
            galleryHtml += "</h3>";
            galleryHtml += "<div class=\"content\" id=\"galleryContent-" + gallery.EntryId + "\">";
            galleryHtml += "<table width=\"100%\" class=\"tblImgContainer\"><tr>";
            if (gallery.GalleryDescription != null && gallery.GalleryDescription != undefined) {
                galleryHtml += "<td width=\"25%\">"; //First cell will display description.
                galleryHtml += "<div class=\"imgcontainer\">" + gallery.GalleryDescription + "</div></td>";
                imgIndex += 1;
            }

            if (gallery.Images != null && gallery.Images != undefined && gallery.Images.length > 0) {
                $.each(gallery.Images, function (idx, image) {
                    imgIndex += 1;
                    var imgPath = image.FileDirectory + '\\' + image.FileName
                    galleryHtml += "<td width=\"25%\">";
                    galleryHtml += "<div class=\"imgcontainer\"><div class=\"cgImgRowActions\"><span id=\"spnImgTitle-" + gallery.EntryId + "-" + image.EntryId + "\">" + image.ImageTitle + "</span>";
                    if (role != null) {
                        if (role.DeleteGallery)
                            galleryHtml += "<a class=\"editCtrl gridActionButton delete list\" style=\"float: right; display:none;\" data-galleryid=\"" + gallery.EntryId + "\" data-itemid=\"" + image.EntryId + "\"></a>"; // Gallery image icons
                        if (role.EditGallery)
                            galleryHtml += "<a class=\"editCtrl gridActionButton edit list\" data-galleryid=\"" + gallery.EntryId + "\" data-itemid=\"" + image.EntryId + "\" style=\"float: right; display:none;\"></a>"; // Gallery image icons
                    }
                    galleryHtml += "</div><br />";
                    galleryHtml += "<a id=\"imgAnch-" + gallery.EntryId + "-" + image.EntryId + "\" class=\"imgGroup" + gallery.EntryId + "\" href='" + image.FileUrl + "' title=\"" + image.ImageTitle + "\">";
                    galleryHtml += "<img id=\"glrImg-" + gallery.EntryId + "-" + image.EntryId + "\" src='" + image.FileUrl + "' width=\"100%\" height=\"100%\" />";
                    galleryHtml += "</a><br />";
                    galleryHtml += "<div id=\"divImgDesc-" + gallery.EntryId + "-" + image.EntryId + "\">" + (image.ImageDescription != null && image.ImageDescription != undefined ? image.ImageDescription : "") + "</div>";
                    galleryHtml += "</div></td>";

                    if (imgIndex == 4) {
                        galleryHtml += "</tr><tr>";
                        imgIndex = 0;
                    }
                });
            }

            for (var j = 0; j < 4 - imgIndex; j++) {
                galleryHtml += "<td width=\"25%\"></td>";
            }
            galleryHtml += "</tr></table></div>";

            $("#accordion").append(galleryHtml);

            $(".imgGroup" + gallery.EntryId).colorbox({ rel: 'gimgGrouproup1' + gallery.EntryId, transition: "none", width: "85%", height: "85%" });
            renderAccordion();
            initCgImgEventsBinding();
        });
    }
}

function renderAccordion() {
    $("#accordion").find(".title").die("click");
    $("#accordion").find(".title").live("click", function () {
        $("#accordion .title").not($(this)).next().slideUp();
        $("#accordion .title").not($(this)).removeClass("titlehover");

        $(this).next().slideToggle("fast");
        $(this).toggleClass("titlehover");
    });
}

function initCgEventsBinding() {
    $('.cgRowActions .gridActionButton.edit').live('click', function (e) {
        e.stopPropagation();
        var item = getCommonGridItemById(ContractData.ContractGalleries, $(this).data('itemid'));
        if (item != null)
            galleryShowDialog(item, true, false);
    });
    $('.cgRowActions .gridActionButton.delete').live('click', function (e) {
        e.stopPropagation();
        var item = getCommonGridItemById(ContractData.ContractGalleries, $(this).data('itemid'));
        var galleryTab = $(this).parents(".title");
        galleryTab.removeClass("title").addClass("deletedGallery");
        galleryTab.css({ "text-decoration": "line-through", "background": "#8C8C94" });
        galleryTab.find("a").remove();

        if (item != null) {
            item.Deleted = true;
        }

        isModified = true;
    });

    $('#btnCgAdd').live('click', function () {
        galleryShowDialog({}, true, true);
    }).button().hide();
}

function toggleCgEditMode(editable) {
    if (editable) {
        $('.cgRowActions .viewCtrl, .cgImgRowActions .viewCtrl').hide();
        $('.cgRowActions .editCtrl, .cgImgRowActions .editCtrl').show();
        if (role.AddGallery)
            $("#btnCgAdd").show();
    }
    else {
        $('.cgRowActions .editCtrl, .cgImgRowActions .editCtrl, #btnCgAdd').hide();
        $('.cgRowActions .viewCtrl, .cgImgRowActions .viewCtrl').show();
    }

}

function galleryShowDialog(item, editable, isNew) {
    /// <summary>Shows dialog for adding or editing a contract document.</summary>
    /// <param name="item">Document of a contract getting added or updated.</param>
    /// <param name="editable">Boolean value used to define whether dialog is required to be opened in edit mode or view mode.</param>
    /// <param name="isNew">Boolean value used to define whether dialog is required to be opened for adding a new event.</param>
    /// <return></return>

    var dialogTitle;
    if (isNew) {
        var galleryNew = new Object();
        galleryNew.EntryId = cDataBs.contractGalleries.newItemId = incrementId(cDataBs.contractGalleries.newItemId);
        galleryNew.Images = [];

        galleryWorkItem = galleryNew;
        dialogTitle = environmentVars.resx.GalleryDialogTitle;
    }
    else {
        galleryWorkItem = item;
        if (editable)
            if (item.EntryId > 0)
                dialogTitle = environmentVars.resx.EditGalleryDialogTitle + '- ' + item.GalleryName + ' ' + environmentVars.resx.Saved;
            else
                dialogTitle = environmentVars.resx.EditGalleryDialogTitle + '- ' + item.GalleryName + ' ' + environmentVars.resx.New;
        else
            dialogTitle = environmentVars.resx.ViewGalleryDialogTitle + '- ' + item.GalleryName;
    }

    buildDialog($("#cgDialog"), editable, function () { galleryDialogCommitItem(isNew) }, false, dialogTitle);
    galleryDialogInitItem(galleryWorkItem, editable, isNew);
}

function galleryDialogInitItem(gallery, editable, isNew) {
    var dataTable = $('#cgDialogData');

    dataTable.find(".files").hide();

    if (!isNew) {
        dataTable.find('#galleryName-value').html(gallery.GalleryName);
        dataTable.find('#galleryDate-value').html(gallery.CreatedOn != null ? formatDate(gallery.CreatedOn) : null);
        dataTable.find('#galleryDescription-value').html(gallery.GalleryDescription != null ? gallery.GalleryDescription.formatText() : null);
        dataTable.find('.fileupload-buttonbar').show();
        dataTable.find("#galleryImageMsg").hide();
    }
    else {
        dataTable.find('#galleryName-value').html('');
        dataTable.find('#galleryDate-value').html('');
        dataTable.find('#galleryDescription-value').html('');

        var isGalleryCreated = false;
        $.each(ContractData.ContractGalleries, function (i, gall) {
            if (gall.EntryId == gallery.EntryId) {
                isGalleryCreated = true;
            }
        });

        if (isGalleryCreated) {
            dataTable.find('.fileupload-buttonbar').show();
            dataTable.find("#galleryImageMsg").hide();
        }
        else {
            dataTable.find('.fileupload-buttonbar').hide();
            dataTable.find("#galleryImageMsg").show();
        }

    }

    if (editable) {
        editInPlace('#galleryName-value, #galleryDate-value', true);
        editInPlace('#galleryDescription-value', true, 'textarea');

        initDatePicker('#txtgalleryDate-value');
    }

    renderGalleryImagesGrid(gallery, isNew);
    initCgImgEventsBinding();

    dataTable.find('.fileupload .files').html('');

    galleryImagedUploaded = [];
    isGalleryImageUploaded = true;
    isDocumentUploaded = false;
}

function galleryDialogCommitItem(isNew) {
    /// <summary>Commits the changes done while adding or updating a document in a contract.</summary>
    /// <param name="isNew">Boolean value used to define whether a new document is added in the contract.</param>
    /// <return></return>
    if (isEditMode) {
        if (galleryWorkItem == null)
            return;

        var dataTable = $('#cgDialogData');
        if (!validator.validate(dataTable))
            return false;

        $("#cgDialog").dialog("close");

        galleryWorkItem.GalleryName = dataTable.find('#txtgalleryName-value').val().trim();
        galleryWorkItem.GalleryDescription = dataTable.find('#txtgalleryDescription-value').val().trim();
        galleryWorkItem.CreatedOn = dataTable.find('#txtgalleryDate-value').datepicker('getDate');

        if (isNew) {
            galleryWorkItem.New = true;
            //galleryWorkItem.CreatedOn = new Date(); // For displaying current date. For client side use only.
            //galleryWorkItem.Images = [];
            ContractData.ContractGalleries.push(galleryWorkItem);
        }

        renderGalleries();
        toggleCgEditMode(isEditMode);
        isModified = true;
    }
    galleryImagedUploaded = galleryImagedUploaded;
}

function galleryImageShowDialog(item, editable, isNew, isListIcon) {
    var dialogTitle;
    if (isNew) {
        galleryImageWorkItem = {};
        dialogTitle = environmentVars.resx.GalleryImageDialogTitle;
    }
    else {
        galleryImageWorkItem = item;
        if (editable)
            if (item.EntryId > 0)
                dialogTitle = environmentVars.resx.EditGalleryImageDialogTitle + '- ' + item.ImageTitle + ' ' + environmentVars.resx.Saved;
            else
                dialogTitle = environmentVars.resx.EditGalleryImageDialogTitle + '- ' + item.ImageTitle + ' ' + environmentVars.resx.New;
        else
            dialogTitle = environmentVars.resx.ViewGalleryImageDialogTitle + '- ' + item.ImageTitle;
    }

    buildDialog($("#cgImgDialog"), editable, function () { galleryImageDialogCommitItem(isNew, isListIcon) }, false, dialogTitle);
    galleryImageDialogInitItem(item, editable, isNew);
}

function galleryImageDialogInitItem(galleryImage, editable, isNew) {
    var dataTable = $('#cgImgDialogData');
    if (!isNew) {
        dataTable.find('#imageName-value').html(galleryImage.ImageTitle);
        dataTable.find('#imageDate-value').html(galleryImage.AddedOn != null ? formatDate(galleryImage.AddedOn) : null);
        dataTable.find('#imageDescription-value').html(galleryImage.ImageDescription != null ? galleryImage.ImageDescription.formatText() : null);
        dataTable.find('#imageSize-value').html(galleryImage.FileSize);
        dataTable.find('#imagePicture-value').attr('src', galleryImage.FileUrl);
    }
    else {
        dataTable.find('#imageName-value').html('');
        dataTable.find('#imageDate-value').html('');
        dataTable.find('#imageDescription-value').html('');
        dataTable.find('#imageSize-value').html('');
    }

    if (editable) {
        editInPlace('#imageName-value', true);
        editInPlace('#imageDescription-value', true, 'textarea');
    }
}

function galleryImageDialogCommitItem(isNew, isListIcon) {
    /// <summary>Commits the changes done while adding or updating a document in a contract.</summary>
    /// <param name="isNew">Boolean value used to define whether a new document is added in the contract.</param>
    /// <return></return>
    if (isEditMode) {
        if (galleryImageWorkItem == null)
            return;

        var dataTable = $('#cgImgDialogData');
        if (!validator.validate(dataTable))
            return false;

        $("#cgImgDialog").dialog("close");

        galleryImageWorkItem.ImageTitle = dataTable.find('#txtimageName-value').val().trim();
        galleryImageWorkItem.ImageDescription = dataTable.find('#txtimageDescription-value').val().trim();

        editInPlace('#txtimageName-value, #txtimageDescription-value', false);
        if (isListIcon) {
            $("#spnImgTitle-" + galleryImageWorkItem.GalleryID + "-" + galleryImageWorkItem.EntryId).html(galleryImageWorkItem.ImageTitle);
            $("#divImgDesc-" + galleryImageWorkItem.GalleryID + "-" + galleryImageWorkItem.EntryId).html(galleryImageWorkItem.ImageDescription);
        }
        else {
            initBsCgImg(getCommonGridItemById(ContractData.ContractGalleries, galleryImageWorkItem.GalleryID));
            RebindCommonGrid('#CgImgGrid', cDataBs.contractGalleryImages);
        }
        isModified = true;
    }
}

function renderGalleryImagesGrid(gallery, isNew) {

    if (isNew)
        cDataBs.contractGalleryImages.data = [];
    else
        var galleryImagesInitialized = initBsCgImg(gallery);

    var grid = $("#CgImgGrid");
    if (isGridInitialized(grid)) {
        grid.igGrid("dataSourceObject", cDataBs.contractGalleryImages.data);
        grid.igGrid("dataBind");
        return;
    }
    else {
        renderCommonGrid("#CgImgGrid", cDataBs.contractGalleryImages);
    }
}

function initBsCgImg(gallery) {
    if (gallery != null && gallery != undefined) {
        cDataBs.contractGalleryImages.data = [];

        galleryImgsIndex = -1;

        $.each(gallery.Images, function (i, item) {
            galleryImgsIndex += 1;
            var row = [];

            var actions = "<div class='cgImgRowActions'>"; /*+
            (role.ViewDocs ? "<a class='viewCtrl gridActionButton view' data-rowindex='" + galleryImgsIndex + "' data-itemid='" + item.EntryId + "' style=\"display:none;\"></a>" : "");*/
            actions += (role.EditGallery ? "<a class='editCtrl gridActionButton edit' data-rowindex='" + galleryImgsIndex + "' data-itemid='" + item.EntryId + "' data-galleryid=\"" + gallery.EntryId + "\"></a>" : "") +
            (role.DeleteGallery ? "<a class='editCtrl gridActionButton delete' data-rowindex='" + galleryImgsIndex + "' data-itemid='" + item.EntryId + "' data-galleryid=\"" + gallery.EntryId + "\"></a>" : "");
            actions += "</div>";

            row.push(actions);
            row.push(item.ImageTitle);
            row.push(replaceLineFeedsWithLineBreaks(item.ImageDescription));

            cDataBs.contractGalleryImages.data.push(row);
        });

        return true;
    }
    else {
        return false;
    }
}

function initCgImgEventsBinding() {
    $('.cgImgRowActions .gridActionButton.edit').die('click');
    $('.cgImgRowActions .gridActionButton.edit').live('click', function () {
        var item = getGalleryImage($(this).data('galleryid'), $(this).data('itemid'));
        if (item != null)
            galleryImageShowDialog(item, true, false, $(this).hasClass("list"));

    });
    $('.cgImgRowActions .gridActionButton.delete').die('click');
    $('.cgImgRowActions .gridActionButton.delete').live('click', function () {
        var item = getGalleryImage($(this).data('galleryid'), $(this).data('itemid'));

        if ($(this).hasClass("list")) {
            if (item != null) {
                item.Deleted = true;

                var imgRowAtionsObj = $(this).parents(".cgImgRowActions")
                imgRowAtionsObj.find("a").remove();
                $("#spnImgTitle-" + $(this).data('galleryid') + "-" + $(this).data('itemid')).css('text-decoration', 'line-through');
                $("#divImgDesc-" + $(this).data('galleryid') + "-" + $(this).data('itemid')).css('text-decoration', 'line-through');
                $("#glrImg-" + $(this).data('galleryid') + "-" + $(this).data('itemid')).animate({ opacity: 0.25 });
                $("#imgAnch-" + $(this).data('galleryid') + "-" + $(this).data('itemid')).removeClass("imgGroup3").removeClass("cboxElement").attr('href', '#');
                imgRowAtionsObj.parent().removeClass("imgcontainer").addClass("deletedGalleryImgContainer");
            }
        }
        else {
            $('#CgImgGrid').igGridUpdating('deleteRow', $(this).data('rowindex'));

            if (item != null) {
                item.Deleted = true;
                $(this).parent().hide();
            }
        }
        isModified = true;
    });
}

function getGalleryImage(galleryId, imageId) {
    var gallery = getCommonGridItemById(ContractData.ContractGalleries, galleryId);
    if (gallery != null) {
        var item = getCommonGridItemById(gallery.Images, imageId);
        return item;
    }
    else {
        return null;
    }
}

// This has been added to common.js
//function isGridInitialized(grid) {
//    return grid.hasClass('ui-iggrid-table');
//}

// ####################################################################

//function toggleParentContractRecordsVisibility(displayParentRecords) {
function toggleParentContractRecordsVisibility() {
    if (displayParentRecords) {
        displayParentContractRecords = true;
        $("#divShowParent").hide();
        $("#divHideParent").show();
    }
    else {
        displayParentContractRecords = false;
        $("#divShowParent").show();
        $("#divHideParent").hide();
    }

    resetContractGrids();
    initSingleFieldGroups(true); // To hide parent records from properties
    initSingleFieldGroups(false); // To hide parent records from summary

    HideWaitDialog();
}

function renderNewContractTab(FieldGroupID, FieldGroupName, isSingleRecordFieldGroup) {
    var dispFieldGroupName = "";
    var splittedFieldGroupName = FieldGroupName.split(' ');
    var addTitle = false;

    if (splittedFieldGroupName.length > 1) {
        if (splittedFieldGroupName[0].length > 24 || FieldGroupName.length > 24) {
            dispFieldGroupName = FieldGroupName.substring(0, 20) + "...";
            addTitle = true;
        }
        else {
            dispFieldGroupName = FieldGroupName;
        }
    }
    else if (splittedFieldGroupName.length == 1) {
        if (splittedFieldGroupName[0].length <= 20) {
            dispFieldGroupName = splittedFieldGroupName[0];
        }
        else if (splittedFieldGroupName[0].length > 20) {
            dispFieldGroupName = splittedFieldGroupName[0].substring(0, 20) + "...";
            addTitle = true;
        }
    }

    var newContractTabHtml = "<tr class=\"" + (isSingleRecordFieldGroup ? 'singleRecordGroupTab' : 'multipleRecordGroupTab') + " advanceTab\"><td width=\"5px\"></td><td id=\"tabFieldGroup-" + FieldGroupID + "\" class=\"vertical_tab_unselected\" " + (addTitle == true ? "title='" + FieldGroupName + "'" : "") + " style=\"word-break:break-word;\">";
    newContractTabHtml += dispFieldGroupName;
    newContractTabHtml += "</td><td class=\"vertical_tab_unselected_edge\"></td><td class=\"vertical_tab_unselected_right\"></td></tr>";
    $("#tabFields").parent().before(newContractTabHtml);

    var newTabDivHtml = "<div id=\"divFieldGroup-" + FieldGroupID + "\" style=\"display: none\" class=\"" + (isSingleRecordFieldGroup ? 'singleRecordGroupTabDiv' : 'multipleRecordGroupTabDiv') + "\">";
    newTabDivHtml += "</div>";
    $("#tabViewsArea").append(newTabDivHtml);
}

function getIGCombo(component) {
    $("#" + component).igCombo({
        autoComplete: true,
        dropDownOnFocus: true,
        selectionChanged: function (evt, ui) {
            if (ui.items.count() > 0)
                $(location).attr('href', 'ViewMode?SystemTableName=' + ui.items[0].value + '#' + getHashString());
        }
    });
}


function cDate(str1) {
    // str1 format should be dd/mm/yyyy. Separator can be anything e.g. / or -. It wont effect --added by salil saini (17 june,2013)
    var yr1 = parseInt(str1.substring(0, 4));
    var mon1 = parseInt(str1.substring(4, 6));
    var dt1 = parseInt(str1.substring(6, 8));
    var date1 = mon1 + '/' + dt1 + '/' + yr1;
    return date1;
}
function resetAllData() { }

//-----------------------------------------------------------------------------------------
function setIndependentGroupsHeight() {
    if (initialheight <= 0)
        initialheight = $("#ContractTabs").height();

    $(".multipleRecordGroupTabDiv, .singleRecordGroupTabDiv, .tabArea").each(function (i, item) {
        height = initialheight + 50;
        $(this).css('min-height', height);
    });
}

function showAllContractUsers() {
    ShowWaitDialog(environmentVars.resx.RetrievingRecords);
    $.ajax({
        type: 'POST',
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        url: "GetAllUsersOfContract",
        data: JSON.stringify({ "ContractID": ContractData.Properties.ContractID }),
        success: function (successData) {
            if (successData.hasOwnProperty("ErrorCause")) //The function returned an error...
            {
                ShowErrorDialog(successData);
                return;
            }
            else {
                ContractData.ContractUsers = successData;
                initBsUs();
                RebindCommonGrid("#usGrid", cDataBs.contractUsers);
                toggleUsEditMode(isEditMode);
                $("#ancShowAllUsers").hide();
            }
        },
        error: function (jqXHR, errorStatus, errorThrown) {     // Error Clause added by Viplav on 12 August 2013
            var excTitle = getExeptionMessageFromjqXHR(jqXHR);
            HandleClientSideError(jqXHR.status, errorThrown, excTitle, "ContractViewModel", "showAllContractUsers");
        },
        complete: function () {
            HideWaitDialog();
        }
    });
}

function showCompletionMsgs() {
    if ($("#completionMessageDialog").length > 0)
        ShowCompletionMsgsDialog($("#completionMessageDialog"), null);
}

function markContractFieldAsDeleted(gridId, fieldIndex) {
    var deletedEntry = new Object();
    deletedEntry.GridID = gridId;
    deletedEntry.RowIndex = fieldIndex;

    deletedContractFields.push(deletedEntry);
}

function setContractFieldAsDeleted() {
    $.each(deletedContractFields, function (i, item) {
        $("#" + item.GridID).igGridUpdating('deleteRow', item.RowIndex);
        $("#" + item.GridID).find(".editCtrl.gridActionButton.delete[data-rowindex='" + item.RowIndex + "']").hide();
    });
}

function getUniqueFieldIDs(ContractFields) {
    var counter = [];
    $.each(ContractFields, function (i, field) {
        counter.push((field.FieldType == FieldTypes.EntityLink ? field.CatalogFieldID : field.EntryId));
    });

    var unique = $.grep(counter, function (item, index) {
        return $.inArray(item, counter) == index;
    });
    return unique;
}

function reFetchContract() {
    window.location.href = eContractsRootPath + "Contract/ViewMode?contractID=" + ContractData.ID;
}