$(document).ready(function () {
    

    //to match the animation of other jqgrids. Since testhistory is .netgrid need to animate independently
    $(".testHistory").css('opacity', 0).show().animate({ opacity: 1 }, 400);

    //take to testgrid.aspx if any element on treeholder is clicked
    var pathname = document.location.href;
    $("#treeHolder").click(function () {
        var testPath;
        document.location.href = pathname.split("?path=")[0].replace("resultgrid.aspx", "testgrid.aspx");
    });

    //if the url contaings resultPage then do either of this
    //  suite results (loaded in testHistory table) or
    //  test reults  (loaded in resultGrid table)  
    // sample url 'localhost:59028/resultgrid.aspx?path=Root.OITInternational.RSSAT.TaxYear2011.AmtFgnRandDeeGiUsFloorAdj2011&resultPage=021314232219'
    if (pathname.indexOf("&resultPage=") > 0) {

        testPath = pathname.split("?path=")[1].split("&resultPage=")[0];
        testPath = testPath + "//" + pathname.split("&resultPage=")[1] + ".xml";

        if (isSuite(testPath)) 
            loadSuiteResults(testPath);
        else
            loadResultGrid(testPath);
       
    }//if

    //load run history table (loaded in testHistory table)
    //sample url localhost:59028/resultgrid.aspx?path=Root.OITInternational.RSSAT.TaxYear2011.AmtFgnRandDeeGiUsFloorAdj2011
    else if (pathname.indexOf("resultgrid.aspx?path=") > 0) {
        testPath = pathname.split("?path=")[1];
        testPath = "files/TestResults/" + testPath + "/TestHistory.xml";
        $.ajax({
            type: "POST",
            async: false,
            url: "resultgrid.aspx/getTestHistory",
            contentType: "application/json; charset=utf-8",
            data: "{strPath:'" + testPath + "'}",
            dataType: "text",            
            success: function (response) {
                if (response != "")              
                    loadTestHistory(response);                                
            },
            Error: function (response) { alert("Error: " + response.d); }
        }); //ajax        
    }//else if

    

}); //document.ready

function submitReview() {
    var colName;
    var xmlString = '';
    var condString = '', actualString = '';
    var expText, actText = '';

    $('#resultSet tr').has('input[type=checkbox]:checked').each(function () {
        $(this).find('td').each(function () {
            colName = $('#resultSet th').eq($(this).index()).html();
            expText = $(this).html().replace(/\&amp;/g, "&");
            expText = expText.replace(/\"/g, '');

            //remove span and extract the expected data
            if (expText.toLowerCase().indexOf("<span class=exp>") != -1) {
                expText = $(this).html().replace(/\<SPAN/g, '<span');
                expText = expText.replace('<span class=fail>', '^').replace('<span class=exp>', '~');
                expText = expText.replace('<span class="fail">', '^').replace('<span class="exp">', '~');

                expText = expText.split('~')[0];
                expText = expText.split('^')[1];

                //form actual string only if the checkbox is checked
                if ($(this).has('input[type=checkbox]:checked').length > 0) {

                    if ($(this).find('[name="delete"]').length != 0) {
                        actText = "deleteRow";
                    }
                    else if ($(this).find('[name="add"]').length != 0) {
                        actText = "addRow";
                    }
                    else {
                        actText = $(this).html().replace(/\<HR>/g, '<hr>');
                        actText = actText.replace(/\&amp;/g, "&");
                        actText = actText.replace(/\<SPAN/g, '<span');
                        actText = actText.replace(/\<hr>/g, '^').replace(/\<span class=act>/g, '~');
                        actText = actText.replace(/\<hr>/g, '^').replace(/\<span class="act">/g, '~');
                        actText = actText.split('^')[1];
                        actText = actText.split('~')[0];
                        actText = actText.replace(/^\s+|\s+$/g, ''); actText = actText.replace('&nbsp;', '');
                    }
                    if (actText == "") { actText = " "; }
                }//end if checked box

            }//end if span exp

            expText = expText.replace(/^\s+|\s+$/g, ''); expText = expText.replace('&nbsp;', '');

            if (colName != "validate")
                condString = condString + colName + "='" + expText + "' and ";

            if (actText == "deleteRow" || actText == "addRow") {
                actualString = actText + "||";
            }
            else if (actText != "") {
                actText = actText.replace(/^\s+|\s+$/g, '');
                actualString = actualString + colName + "^^" + actText + "||";
            }
            colName = ""; expText = "", actText = "";

        }) //td loop

        condString = "<cond>" + condString.substring(0, condString.length - 5) + "</cond>"; //to remove last and
        //alert(condString);
        actualString = "<actual>" + actualString.substring(0, actualString.length - 2) + "</actual>";
        //alert(actualString);
        xmlString = xmlString + "<row>" + condString + actualString + "</row>";
        condString = ""; actualString = "";
    })//tr loop


    var testPath = document.URL.split("path=")[1];
    testPath = testPath.split("&resultPage")[0];
    testPath = testPath.replace(/\./g, "/");

    xmlString = "<root>" + xmlString + "</root>" + "#RootPath:" + testPath;

    xmlString = xmlString.replace(/\&/g, "&amp;");
    xmlString = xmlString.replace(/\</g, '&lt;');
    xmlString = xmlString.replace(/\>/g, '&gt;');


    $("#hiddenField").show();
    $("#hiddenField").val(xmlString);
    //$("#hiddenField").hide();

}

function resultsView() {
    if ($("#resultSet").length != 0) {
        $('#resultSet .act').append('&nbsp<input type="checkbox">update</input>');
    }
}

function loadResultGrid(testPath) {
    $("#gridHolder").css({ opacity: 0 });
    $("#loading").show();
    collapseTreePanel();

    populateBreadGrumNavigation(testPath);
    
    //$("#testName").text(testPath.split("//")[0]);

    setTimeout(function () {
        $.ajax({
            type: "POST",
            async: false,
            url: "resultgrid.aspx/getGridModel",
            contentType: "application/json; charset=utf-8",
            data: "{strPath:'" + testPath + "'}",
            dataType: "json",
            success: function (response) {
                $("#BodyContent_hiddenField").prop("disabled", false);
                $("#BodyContent_hiddenField").val(testPath);
                var obj = $.parseJSON(response.d);
                if (obj.hasOwnProperty("configString")) {                    
                    $("#BodyContent_queryBox").text(obj.configString);
                    if (obj.hasOwnProperty("colModel") && obj.hasOwnProperty("colName")) {
                        populateSummary(obj.tblStatus);
                        loadJQResultGrid(testPath, obj.colName, obj.colModel);
                        $("#gridHolder").css('opacity', 0).show().animate({ opacity: 1 }, 500);
                    }
                    else {
                        $("#resultSet").jqGrid('GridUnload');
                        $("#loading").hide();
                    }
                }
                else if (obj.hasOwnProperty("error")) {
                    //do something later to notify error
                    $("#loading").hide();
                }
            },
            Error: function (response) { alert("Error: " + response.d); }
        }); //ajax
    }, 500);
}//function

function populateSummary(tblStatus) {
    var strHead = ""; strRows = ""; strHTML = "";
    var strMetrics = tblStatus.split(",");
    var metric;

    for (var i = 0; i < strMetrics.length; i++) {
        metric = strMetrics[i].split(":");
        strHead = strHead + "<th>" + metric[0] + "</th>";
        strRows = strRows + "<td>" + metric[1] + "</td>";
    }

    strHead = "<tr>" + strHead + "</tr>";
    strRows = "<tr>" + strRows + "</tr>";
    strHTML = "<tbody>" + strHead + strRows + "</tbody>";
    strHTML = strHTML.replace(/\'/g, "");
    $("#testSummary").append(strHTML);
}

function loadJQResultGrid(strpath, strColNames, strColModel) {
    var strpath = "files/TestResults/" + strpath;
    $("#resultSet").jqGrid('GridUnload');

    jQuery("#resultSet").jqGrid({
        url: strpath,
        datatype: "xml",
        colNames: eval(strColNames),
        colModel: eval(strColModel),
        height: '10',
        gridview: true,
        loadonce: true,
        viewrecords: true,
        scroll: 1,        
        shrinkToFit: true,
        rownumbers: true,
        rownumWidth: 32,
        toolbar: [true, "top"],
        loadComplete: function () {
            //$("#loading").hide();
            //$("#gridHolder").css('opacity', 0).show().animate({ opacity: 1 }, 400);
            $("#resultSetExportDiv").css("display", "inline-block");
            $("#loading").hide();
            calculateGridHeight1("resultSet");
            calculateGridWidth("resultSet");
            testResults();
            $(".heading").toggleClass("displayClass");
        },
        rowNum: 300,
        grouping: false,
        groupingView: {
            groupField: [''],
            groupColumnShow: [true],
            //groupText: ['<b>{0}</b>'],
            groupCollapse: true,
            groupOrder: ['asc'],
            groupDataSorted: true,
            isInTheSameGroup: function (x, y) {
            }
        },        
        xmlReader:
        {
            root: "root",
            row: "row",
            repeatitems: false
        }//xmlReader        
    }).navGrid();

    jQuery("#resultSet").jqGrid('bindKeys');
    jQuery("#resultSet").jqGrid('filterToolbar', { stringResult: true, searchOnEnter: false, defaultSearch: "cn" });
    $(".ui-search-toolbar").hide();
    $("#t_resultSet").append('<div class="tableButtons" id="resultSetSearch"><i class="fa fa-search"> Search</i></div>');
    $("#t_resultSet").append('<div class="tableButtons" id="resultSetFilterFailures"><i class="fa fa-filter"> Filter Failures</i></div>');
    $("#t_resultSet").append('<div class="tableButtons" id="resultSetClearFilter"><i class="fa fa-eraser" > Clear Filter</i></div>');
    $("#t_resultSet").append('<div class="tableButtons" id="resultSetGroupDIV"><i class="fa fa-indent" id="resultSetGroup" > Group By</i><select id="chngroup"></select></div>');

    var exportHTML = $("#resultSetExportDiv").html();
    $("#resultSetExportDiv").remove();
    $("#t_resultSet").append('<div class="tableButtons" id="resultSetExportDiv">' + exportHTML + '</div>');


    $("#resultSetExport").click(function () {
        exportHTMLTableToExcel_NonIE('resultSet', 'RecordSet Sheet');
    });

    //filter failures
    $("#resultSetFilterFailures").click(function () {        
        $("#gs_Status").val("fail").trigger("change");
        jQuery("#resultSet")[0].triggerToolbar();
    });
    
    //Clear all filters
    $("#resultSetClearFilter").click(function () {        
        $("#resultSet")[0].clearToolbar();
    });

    //toggle search toolbar
    $("#resultSetSearch").click(function () { $("#resultSet")[0].toggleToolbar(); });
    //$("#recordSetClearSearch").click(function () { $("#recordSet")[0].clearToolbar(); });

    $("#resultSetGroup").click(function () {
        $('#chngroup').toggle();
        appendGroupByDropDown(strColNames);
    });



    jQuery("#chngroup").change(function () {
        var vl = $(this).val();
        if (vl) {
            if (vl == "None") {
                jQuery("#resultSet").jqGrid('groupingRemove', true);
                $("#resultSet").jqGrid('setGridParam', { rowNum: 300 })
                .trigger('reloadGrid');
            } else {
                jQuery("#resultSet").jqGrid('groupingGroupBy', vl);
                $("#resultSet").jqGrid('setGridParam', { rowNum: 50000 })
                    .trigger('reloadGrid', [{ current: true }]);

                var windowHeight = window.innerHeight * .70;
                $(".ui-jqgrid-bdiv").css('height', windowHeight + 'px');
            }
        }
    });

}

function loadSuiteResults(strpath) {
    var testPath = strpath;
    var strpath = "files/TestResults/" + strpath;
    $("#testHistory").jqGrid('GridUnload');

    jQuery("#testHistory").jqGrid({
        url: strpath,
        datatype: "xml",
        colNames: ['Header', 'Pass', 'Fail', 'Errors', 'Duration', 'Test Name', 'Link', 'Test Owner'],
        colModel: [
           { name: 'Header', index: 'Header', xmlmap: 'hdrContent', width: 200, title: false },
           { name: 'Pass', index: 'Pass', xmlmap: 'right', width: 70, title: false, formatter: 'number', summaryType: 'sum', align: "right" },
           { name: 'Fail', index: 'Fail', xmlmap: 'wrong', width: 70, title: false, formatter: 'number', summaryType: 'sum', align: "right" },
           { name: 'Errors', index: 'Errors', xmlmap: 'exceptions', width: 70, title: false, formatter: 'number', summaryType: 'sum', align: "right" },
           { name: 'Duration', index: 'Duration', xmlmap: 'runTimeInSeconds', width: 70, title: false, formatter: 'number', summaryType: 'sum', align: "right" },
           { name: 'Test Name', index: 'Test Name', xmlmap: 'relativePageName', width: 500, title: false, align: "left" },
           { name: 'Link', index: 'Link', xmlmap: 'pageHistoryLink', width: 200, title: false, hidden: true },
           { name: 'Test Owner', index: 'Test Owner', xmlmap: 'testowner', width: 150, title: false, align: "left" },
          ],
        height: 'auto',
        gridview: true,        
        loadComplete: function () {
            var strLink = "";

            $("#testHistory td[aria-describedby='testHistory_Test Name']").each(function () {
                strLink = $(this).parent().find("td[aria-describedby='testHistory_Link']").text();
                $(this).html('<a href="' + strLink + '">' + $(this).text() + '</a>');
                //.html('Whatever <b>HTML</b> you want here.')
            });

            highlightTestHistory();
            $(".heading").toggleClass("hideClass");

            /*
            var i = 0; var iFail;
            $("#testHistory .jqfoot").each(function () {
                iFail = $(this).find("td[aria-describedby='testHistory_Fail']").text();
                if (iFail > 0) {
                    $("#testHistory #testHistoryghead_0_" + i).css("background", "#FFAAAA");
                }
                else {
                    $("#testHistory #testHistoryghead_0_" + i).css("background", "#AAFFAA");
                }

                i = i + 1;
            });
            */

        },
        rowNum: 300,
        toolbar: [true, "top"],
        grouping: true,
        groupingView: {
            groupField: ['Header'],
            groupColumnShow: [false],
            //groupText: ['<b>{0}</b>'],
            groupCollapse: false,
            groupOrder: ['asc'],
            groupDataSorted: true,
            groupSummary: [false],
            showSummaryOnHide: true,
            groupDataSorted: true
        },
        xmlReader:
        {
            root: "testResults",
            row: "result",
            repeatitems: false
        }//xmlReader        
    }).navGrid();


    autoRefreshGrid(testPath);

    jQuery("#testHistory").jqGrid('filterToolbar', { stringResult: true, searchOnEnter: false, defaultSearch: "cn" });
    $(".ui-search-toolbar").hide();
    $("#t_testHistory").append('<div class="tableButtons" id="tHistorySearch"><i class="fa fa-search"> Search</i></div>');
    $("#t_testHistory").append('<div class="tableButtons" id="tHistoryFilterFailures"><i class="fa fa-filter"> Filter Failures</i></div>');
    $("#t_testHistory").append('<div class="tableButtons" id="tHistoryClearFilter"><i class="fa fa-eraser" > Clear Filter</i></div>');
    
    //toggle search toolbar
    $("#tHistorySearch").click(function () { $("#testHistory")[0].toggleToolbar(); });

    //filter failures
    $("#tHistoryFilterFailures").click(function () {
        //$('#testHistory td[aria-describedby="testHistory_Status"]:not(:contains("fail"))').parent().hide();
        var strFail, strError;
        var i = -1; showGroupRow = false;
        $("#testHistory .jqgroup").hide();
        
        $('#testHistory tr').each(function () {
            if ($(this).attr('class').indexOf("jqgrow") > 0) {
                strFail = $(this).find('td[aria-describedby="testHistory_Fail"]').text().trim();
                strError = $(this).find('td[aria-describedby="testHistory_Errors"]').text().trim();
                strTest = $(this).find('td[aria-describedby="testHistory_Test Name"]').text().trim();

                if (strFail == "0" && strError == "0")
                    $(this).hide();                
                else
                    showGroupRow = true;                
            }
            else if ($(this).attr('class').indexOf("jqgroup") > 0) {
                if (showGroupRow)
                    $("#testHistoryghead_0_" + i).show();
                showGroupRow = false;
                i = i + 1;
            }
        });

        //for last group
        if (showGroupRow) { $("#testHistoryghead_0_" + i).show(); }

    });


    $("#tHistoryClearFilter").click(function () {
        $("#testHistory")[0].clearToolbar()
        $('#testHistory tr').show();
    });

}

function autoRefreshGrid(testPath) {
    testPath = testPath.split("//")[0];
    //var fileName = testPath.split("//")[1];    
    var outFile = "files/outfiles/" + testPath + ".out.xml";
    //if(urlExists(outFile))

    var timesRun = 0;
    var interval = setInterval(function () {
        timesRun += 1;
        if (timesRun == 360) {
            clearInterval(interval);
            alert("Suspending Autorefresh..." + "\n" +
                  "Autorefreshing grid for more than 30 minutes may cause in slow response from server. Refresh the page manually to see latest results");            
        }
        if (urlExists(outFile)) {            
            $("#testHistory").setGridParam({ loadonce: true }).trigger("reloadGrid", [{ current: true }]);
            clearInterval(interval);
        }
        else {
            $("#testHistory").trigger("reloadGrid", [{ current: true }]);
          
        }
    }, 5000);


}

function loadTestHistory(xmlResults) {
    
    $("#testHistory").jqGrid('GridUnload');

    jQuery("#testHistory").jqGrid({        
        datatype: "xmlstring",
        datastr: xmlResults,
        colNames: ['Pass', 'Fail', 'Errors', 'Date', 'Duration"', 'Status'],
        colModel: [
           { name: 'Pass', index: 'Pass', xmlmap: 'Pass', width: 60, title: false, formatter: 'number', summaryType: 'sum', align: "right" },
           { name: 'Fail', index: 'Fail', xmlmap: 'Fail', width: 60, title: false, formatter: 'number', summaryType: 'sum', align: "right" },
           { name: 'Errors', index: 'Errors', xmlmap: 'Errors', width: 60, title: false, formatter: 'number', summaryType: 'sum', align: "right" },
           { name: 'myDate', index: 'myDate', xmlmap: 'Date', width: 170, title: false, align: "center" },
           { name: 'Duration', index: 'Duration', xmlmap: 'Duration', width: 70, title: false, formatter: 'number', summaryType: 'sum', align: "right" },           
           { name: 'Status', index: 'Status', xmlmap: 'Status', width: 100, align: "center", hidden: true }
        ],
        height: 'auto',        
        gridview: true,
        loadonce: true,        
        toolbar: [true, "top"],
        loadComplete: function () {
            highlightTestHistory();
            $(".heading").toggleClass("hideClass");
        },
        rowNum: 300,
        xmlReader:
        {
            root: "testResults",
            row: "row",
            repeatitems: false
        }//xmlReader
    }).navGrid();

    $("#t_testHistory").append('<div class="tableButtons" id="tHistoryFilterFailures"><i class="fa fa-filter"> Filter Failures</i></div>');
    $("#t_testHistory").append('<div class="tableButtons" id="tHistoryClearFilter"><i class="fa fa-eraser" > Clear Filter</i></div>');

    //filter failures
    $("#tHistoryFilterFailures").click(function () {
        //$('#testHistory td[aria-describedby="testHistory_Status"]:not(:contains("fail"))').parent().hide();
        var strFail, strError;

        $('#testHistory .jqgrow').each(function () {
            strFail = $(this).find('td[aria-describedby="testHistory_Fail"]').text().trim();
            strError = $(this).find('td[aria-describedby="testHistory_Errors"]').text().trim();
            if (strFail == 0 && strError == 0)
                $(this).hide();
        });
    });

    //clear filter
    $("#tHistoryClearFilter").click(function () {
        $('#testHistory tr').show();
    });

}

function highlightTestHistory() {
    $("#testHistory td[aria-describedby='testHistory_Fail']").each(function () {
        if ($(this).text() > 0) {
            $(this).parent().css("background", "#FFAAAA");
        }
        else if ($(this).parent().find("td[aria-describedby='testHistory_Errors']").text() > 0) {
            $(this).parent().css("background", "rgb(255, 255, 170)");
        }
        else if ($(this).parent().find("td[aria-describedby='testHistory_Pass']").text() > 0) {
            $(this).parent().css("background", "#AAFFAA");
        }
        else {
            $(this).parent().css("background", "rgb(255, 255, 170)");
        }
    });
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

function calculateGridHeight1(strElement) {
    var windowHeight =$(window).height() * .71;
    var tblHeight = $("#" + strElement).height();
    //$(".ui-jqgrid-bdiv > div").css('height', tblHeight);

    if (tblHeight > windowHeight) {
        $("#gview_" + strElement + " > .ui-jqgrid-bdiv").css('height', windowHeight);
    }
    else {
        $("#gview_" + strElement + " > .ui-jqgrid-bdiv").css('height', tblHeight + 35);
    }


    //$("#gview_recordSet > .ui-jqgrid-bdiv").css('height', window.innerHeight * .75);
}

function populateBreadGrumNavigation(testpath) {
    testpath = testPath.split("//")[0];
    var liHTMLString = "";
    var testGridPath = "Root";
    var breadGrum=testpath.split('.');
    for (i = 0; i < breadGrum.length ; i++) {
        if (breadGrum[i] != "Root") {
            testGridPath = testGridPath + "." + breadGrum[i];
            liHTMLString = liHTMLString + '<li><a href="testgrid.aspx?path=' + testGridPath  + '">' + breadGrum[i] + '</a></li>\n';
        }        
    } 

    $(".breadcrumb").append(liHTMLString);
}

function getXMLText(strPath, nodeValue) {
    $.ajax({
        type: "GET",
        url: strPath,
        dataType: "xml",
        success: function (xml) {
            if ($(xml).find('Status').length > 0) {
               
            }            
        }
    });

}

