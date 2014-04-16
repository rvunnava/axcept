$(document).ready(function () {
    $("#editGrid").hide();
    

    //If loaded from url, load tree and call selectnode (loadgrid)         
    var pathname = document.location.href;
    if (pathname.indexOf("?path=") > 0) {
        var pName = pathname.split("?path=")[1].split(".");        
        loadTree("default", "Root" + pName[1]);
        var nodeName = ""; xmlPath = "";
        
        for (i = 0; i < pName.length; i++) {
            xmlPath = xmlPath + pName[i] + "/";
        }
        xmlPath = xmlPath.substring(0, xmlPath.length - 1);
        $("#loading").show();
        selectNode(xmlPath);
    }
    else {
        loadTree("default", "Root");
    }



}); //document.ready

function loadGrid(strpath, strColNames, strColModel) {

    //strpath = "Root/CompareTestDataSAT/626R/EPByBasketAfterDivLT/TY2009/BinderLocatorC000W5O9/BinderForC000W5O9/contents1.xml";
    $("#recordSet").jqGrid('GridUnload');
    strpath = strpath + "/contents.xml";
    
    if (strColNames.toString() == "['ColName1','ColName2','ColName3','ColName4','ColName5','ColName6','ColName7']") {
        expandConfigSection();
        $("#loading").hide();
        return;
    }

    jQuery("#recordSet").jqGrid({
        url: strpath,
        datatype: "xml",
        colNames: eval(strColNames),
        colModel: eval(strColModel),
        height: '10',
        gridview: true,
        loadonce: true,        
        scroll: 1,
        shrinkToFit: true,
        rownumbers: true,
        rownumWidth: 32,
        toolbar: [true, "top"],
        loadComplete: function () {
            collapseConfigSection();
            $("#ui-benchmark").show();            
            $("#loading").hide();
            calculateGridHeight("recordSet");
            calculateGridWidth("recordSet");            
        },
        rowNum: 300,                
        grouping: false,        
        groupingView: {
            groupField: [''],
            groupColumnShow: [true],
            //groupText: ['<b>{0}</b>'],
            groupCollapse: true,
            groupOrder: ['asc'],
            groupDataSorted: true
        },                
        xmlReader:
        {
            root: "test",
            row: "row",
            repeatitems: false
        }//xmlReader        
    });

    
    jQuery("#recordSet").jqGrid('bindKeys');    
    jQuery("#recordSet").jqGrid('filterToolbar', { stringResult: true, searchOnEnter: false, defaultSearch: "cn" });
    $(".ui-search-toolbar").hide();
    $("#t_recordSet").append('<div class="tableButtons" id="recordSetSearch"><i class="fa fa-search"> Search</i></div>');
    $("#t_recordSet").append('<div class="tableButtons" id="recordSetClearSearch"><i class="fa fa-eraser" > Clear Search</i></div>');
    $("#t_recordSet").append('<div class="tableButtons" id="recordSetGroupDIV"><i class="fa fa-indent" id="recordSetGroup" > Group By</i><select id="chngroup"></select></div>');
    
    var exportHTML = $("#recordSetExportDiv").html();
   // $("#recordSetExportDiv").remove();
    $("#t_recordSet").append('<div class="tableButtons" id="recordSetExportDIV">' + exportHTML + '</div>');

    $("#recordSetSearch").click(function () {  $("#recordSet")[0].toggleToolbar(); });
    $("#recordSetClearSearch").click(function () { $("#recordSet")[0].clearToolbar(); });
    //$("#recordSetGroup").click(function () { $('#chngroup').toggle(); });


    $("#recordSetGroup").click(function () {
        $('#chngroup').toggle(); 
        appendGroupByDropDown(strColNames);
    });
    
    jQuery("#chngroup").change(function(){
        var vl = $(this).val();
        if(vl) {
            if (vl == "None") {
                jQuery("#recordSet").jqGrid('groupingRemove', true);                
                $("#recordSet").jqGrid('setGridParam', { rowNum: 300 })
                .trigger('reloadGrid');
            } else {
                var windowHeight = window.innerHeight * .75;
               
                jQuery("#recordSet").jqGrid('groupingGroupBy', vl);                
                $("#recordSet").jqGrid('setGridParam', { rowNum: 50000})
              .trigger('reloadGrid', [{ current: true }]);

                 $(".ui-jqgrid-bdiv").css('height', windowHeight + 'px');

            }
        }
    });

}

function testHistory() {
    var node = $("#treeHolder").jstree('get_selected');
    nodeId = node.attr('id').toString();
    var testPath = ""; strhref = "";
    //Redirect to resultgrid.aspx
    strhref = window.location.href.replace(/\#/g, "").replace("testgrid.aspx", "resultgrid.aspx");
    //for test path query string
    testPath = "?path=" + "Root" + "." + getParents(node).replace(/\//g, ".");
    //replace url
    window.location.href = strhref + testPath;
}  

function runTest() {
    //$("#loading").show();

    var node = $("#treeHolder").jstree('get_selected');
    nodeId = node.attr('id').toString();
    var xmlPath = "";
    xmlPath = "Root" + "/" + getParents(node); //gets complete path of the selected node
    
    $.ajax({
        type: "POST",
        async: false,
        url: "testgrid.aspx/runTest",
        contentType: "application/json; charset=utf-8",        
        data: "{testPage:'" + xmlPath + "'," + "takeSnapshot:'false'" + "}",
        dataType: "json",
        success: function (response) {
            if (response.d != "Error"); {
                var variables = response.d.split("^");
                loadResults(variables[0], variables[1]);
            }
        },
        Error: function (response) { alert("Error: " + response.d); }
    }); //ajax
}//function



function takeSnapShot() {
    //$("#loading").show();

    var node = $("#treeHolder").jstree('get_selected');
    nodeId = node.attr('id').toString();
    var xmlPath = "";
    xmlPath = "Root" + "/" + getParents(node); //gets complete path of the selected node

    $.ajax({
        type: "POST",
        async: false,
        url: "testgrid.aspx/runTest",
        contentType: "application/json; charset=utf-8",
        data: "{testPage:'" + xmlPath + "'," + "takeSnapshot:'true'" + "}",
        dataType: "json",
        success: function (response) {
            if (response.d != "Error"); {
                //var variables = response.d.split("^");
                refreshTestGrid(xmlPath);
            }
        },
        Error: function (response) { alert("Error: " + response.d); }
    }); //ajax
}//function




function loadResults(strResultPath, strfileName) {

    var strResultFile = "files/TestResults/" + strResultPath + "/" + strfileName;
    //var strhref = window.location.href.replace(/\#/g, "").replace("testgrid.aspx", "resultgrid.aspx");
    //strResultFile = "files/TestResults/Root.CompareTestDataSAT.626R.Form8865ScheduleKByBasketAndCountryCode.TY2009.BinderLocatorC000W5O9.BinderForC000W5O9/120513021450.xml"                                    

    strhref = window.location.href.replace(/\#/g, "").replace("testgrid.aspx", "resultgrid.aspx");
    $("#gridHolder").css({ opacity: 0 });
    $("#loading").show();
    var timesRun = 0;
    var interval = setInterval(function () {
        timesRun += 1;
        if (timesRun == 360) {
            clearInterval(interval);
        }

        if (urlExists(strResultFile)) {
            testPath = "?path=" + strResultPath + "&resultPage=" + strfileName.replace(/\.xml/g, "");
            //replace url
            $("#loading").hide();
            window.location.href = strhref + testPath;
            clearInterval(interval);
        }
    }, 5000);
}


function refreshTestGrid(xmlPath) {

    xmlPath = xmlPath + "/" + "contents.xml";
    

    $("#gridHolder").css({ opacity: 0 });
    $("#loading").show();
    var timesRun = 0;
    var interval = setInterval(function () {
        timesRun += 1;
        if (timesRun == 360) {
            clearInterval(interval);
        }

        if (urlExists(xmlPath)) {
            //replace url
            $("#loading").hide();
            location.reload();
            clearInterval(interval);
        }
    }, 5000);
}


function calculateGridHeight(strElement) {
    var windowHeight = $(window).height() * .75;
        
    var tblHeight = $("#" + strElement).height();
    if (tblHeight > windowHeight)
        $("#gview_" + strElement + " > .ui-jqgrid-bdiv").css('height', windowHeight);
    else
        $("#gview_" + strElement + " > .ui-jqgrid-bdiv").css('height', tblHeight + 35);

    //$("#gview_recordSet > .ui-jqgrid-bdiv").css('height', window.innerHeight * .75);
}

function appendGroupByDropDown(strColNames) {

    $('#chngroup').empty();

    var colArray = eval(strColNames);
    colArray.push("None");

    var option = '';
    for (i = 0; i < colArray.length; i++) {
        option += '<option value="' + colArray[i] + '">' + colArray[i] + '</option>';
    }
    $('#chngroup').append(option);
    $('#chngroup option[value="None"]').attr("selected", true);

}

function testProperties() {
    $("#testProperties").show();
    $("#testContent").hide();    
}