$(document).ready(function () {
    $("#ui-edit").click(function () {
        $("#editGrid").show();
        if ($("#resultSet").length != 0) {
            $('#resultSet .act').append("<br><input type='checkbox' name='update'/>update");
            $("#resultSet .exp:contains('missing')").append("<br><input type='checkbox' name='delete'/>delete");
            $("#resultSet .exp:contains('surplus')").append("<br><input type='checkbox' name='add'/>add row");
        }

        else {
            var node = $("#treeHolder").jstree('get_selected');
            var testPath = "Root" + "/" + getParents(node);            
            $("textarea").attr('disabled', false);
            resetConfigString(testPath);

            //ui handlers
            $("#ui-run").hide(); $("#ui-edit").hide(); $("#ui-results").hide(); $("#ui-benchmark").hide();
            $("#ui-Properties").hide();

            $("#ui-testHistory").hide();
            
            $("#gbox_recordSet").hide();
            $(".ui-jqgrid-htable").hide();
            $("#BodyContent_saveData").show();

            getTableData();
            //var rows = getTableData();
            
        }

    }); // click function
});// document.ready

function getTableData() {
    var $table = $("#recordSet"),
            //$headerCells = $table.find("tbody th"),
            $headerCells = $(".ui-jqgrid-htable").find(".ui-jqgrid-labels th div"),
            $rows = $table.find("tbody tr");

    var rows = [];
    var row = [];
    $headerCells.each(function (k, v) {
        if (k != 0) {
            row[k-1] = $(this).text();
        }
    });
    rows.push(row);

    var node = $("#treeHolder").jstree('get_selected');
    nodeId = node.attr('id').toString();
    var xmlPath = "";
    xmlPath = "Root" + "/" + getParents(node) + "/contents.xml"; //gets complete path of the selected node
    
    $.ajax({
        type: "GET",
        url: xmlPath,
        cache: false,
        dataType: "xml",
        success: function (xml) {
            $(xml).find('row').each(function () {
                var row = []; var iCol = 0;
                $(this).children().each(function () {
                    //var name = $(this).text();
                    row[iCol] = $(this).text();
                    iCol = iCol + 1;
                });//cols
                if (row.length != 0)
                    rows.push(row);
            });//rows
            populateEditor(rows);
        }
    });



    /*
    $rows.each(function (row, v) {
        var row = [];
        if ($(this).attr("class") != "jqgfirstrow") {
            $(this).find("td").each(function (cell, v) {
                row[cell] = $(this).text();
            }); // td for each
        }
        if (row.length != 0)
            rows.push(row);
    });// tr for each
    */

    //return rows;

}

function getTableData_XML() {


    var $container = $("#editGrid");
    var handsontable1 = $container.data('handsontable');

    var changedData = handsontable1.getData();
    var strNode;
    var xmlSchema = "";
    var tblRow = [];
    var headerRow = [];

    for (row = 0; row < changedData.length-1; row++) {
        if (row != 0) xmlSchema += "<row>\n";        
        for (col = 0; col < changedData[row].length; col++) {
            changedData[row][col] = changedData[row][col] + "";
            changedData[row][col]=changedData[row][col].replace(/^\s+|\s+$/g, "");            
            //if (changedData[row][col] != "" && changedData[row][col].toLowerCase()!= "null") {
                if (row == 0) {
                    headerRow[col] = "<" + changedData[row][col] + ">" + "||" + "</" + changedData[row][col] + ">";
                }
                else {
                    if (headerRow[col] != "<>||</>") {
                        strNode = "";
                        strNode = headerRow[col].split('||');                    
                        changedData[row][col] = changedData[row][col].replace(/\&/g, "&amp;");
                        tblRow[col] = strNode[0] + changedData[row][col] + strNode[1];
                        xmlSchema += tblRow[col] + "\n";
                    }
                }
            //}
        }// col loop
        if (row != 0) xmlSchema += "</row>\n";
    }// row lop

    return xmlSchema;
}

function populateEditor(data) {
    resizeEditorDiv();

    if (data[0].length == 0) {        
        data[0] = ['ColName1','ColName2','ColName3','ColName4','ColName5','ColName6','ColName7']
    }
    
    $("#editGrid").handsontable({
        data: data,
        contextMenu: false,
        colHeaders: true,
        rowHeaders: true,
        scrollH: 'auto',
        scrollV: 'auto',
        minSpareRows: 1,
        minCols: 26,
        stretchH: 'all'
    });

    //handsontableInputHolder htHidden
    $(".handsontableInputHolder").css("overflow", "hidden");

}

function sData() {

    var tblMarkUp = getTableData_XML();
    
    var strConfigMarkUp;
    strConfigMarkUp = "<Config>\n" +
        "<query>" + $("#BodyContent_queryBox").val() + "</query>\n" +
    "</Config>\n"

    var node = $("#treeHolder").jstree('get_selected');
    var testPath = "Root" + "/" + getParents(node);

    changedData = "<root>" + strConfigMarkUp + tblMarkUp + "</root>" +
     "#RootPath:" + testPath;
    changedData = changedData.replace(/\</g, '&lt;');
    changedData = changedData.replace(/\>/g, '&gt;');

    $("#BodyContent_hiddenField").show();
    $("#BodyContent_hiddenField").val(changedData);
    //alert($("#hiddenField").text());
    $("#BodyContent_hiddenField").hide();

}

function resetConfigString(xmlPath) {
    
        $.ajax({
            type: "POST",
            async: false,
            url: "testgrid.aspx/testGridData",
            contentType: "application/json; charset=utf-8",
            data: "{strPath:'" + xmlPath + "',evalConfigStr:'n'}",
            dataType: "json",
            success: function (response) {
                var obj = $.parseJSON(response.d);
                if (obj.hasOwnProperty("configString")) {
                    $("#BodyContent_queryBox").text(obj.configString);
                }
                else if (obj.hasOwnProperty("error")) {
                    //do something later to notify error
                    $("#loading").hide();
                    $("#BodyContent_queryBox").text("");
                }
            },
            Error: function (response) { alert("Error: " + response.d); }
        }); //ajax
    

}