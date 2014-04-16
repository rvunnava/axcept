
$(document).ready(function () {
    var pathname = document.location.href;
    if (pathname.indexOf("testgrid.aspx?path=") < 0) {
        loadTree("default", "Root");
    }
    
    $("#dialog-form #submit").click(function () {

        var folderName = $("#folderName").val();
        var node = $("#treeHolder").jstree('get_selected');
        var xmlPath = "";
        if (node.length > 0) {
            nodeId = node.attr('id').toString();
            xmlPath = "Root" + "/" + getParents(node) + "/" + folderName; //gets complete path of the selected node
        }
        else {
            xmlPath = "Root/" + folderName;
        }

        $.ajax({
            type: "POST",
            async: false,
            url: "testgrid.aspx/createTest",
            contentType: "application/json; charset=utf-8",
            data: "{strPath:'" + xmlPath + "'}",
            dataType: "json",
            success: function (response) {
                location.reload();
            },
            Error: function (response) { alert("Error: " + response.d); }
        }); //ajax

        $("#dialog-form").hide();
        window.location.href = window.location.href;
    });


}); //document.ready


function loadTree(nodeStringVal, strIntialOpen) {    
    $("#treeHolder")
    .jstree({        
        "xml_data": {
            "ajax": {
                type: "Post",
                "async": true,
                url: "testgrid.aspx/getDirectory",
                contentType: "application/json; charset=utf-8",
                data: function (node) {
                    if (nodeStringVal == "default") {
                        var nodeString = "";
                        if (node == -1) {
                            nodeString = "Root";
                        }
                        else {
                            nodeString = getParents(node);
                            nodeString = "Root" + "/" + nodeString;
                        }
                    }
                    else {
                        nodeString = nodeStringVal;
                    }
                    
                    return "{rootFolder:'" + nodeString + "'}";

                }, //data
                dataType: "text"
            }, //ajax
            "xsl": "nest"
        }, //xml_data
        "core": {
            "animation": 5,
            "open_parents": true,
            "initially_open": [strIntialOpen.toString()]
        },
        "themes": { "theme": "default", "dots": false },
        "cookies": { "cookie_options": { "path": '/' } },
        "plugins": ["themes", "xml_data", "ui", "hotkeys", "cookies", "contextmenu"],
        "contextmenu": {
            items: {
                "create_tests": {
                    "label": "Create Test",
                    "action": function (node) {
                        $("#dialog-form").fadeIn();
                        $("#gridHolder").css({ opacity: 0.5 });
                    }
                },
                "copy_url": {
                    "label": "Test URL",
                    "action": function (node) { copyTestURL(node); }
                }               

            }//items    
        }//contextmenu

    })//jstree


    .bind('loaded.jstree', function (event, data) {

    })

    .bind('open_node.jstree', function (event, data) {
        var pathname = document.location.href;
        if (pathname.indexOf("?path=") > 0) {
            if (pathname.indexOf("&resultPage=") > 0) {
                var pName = pathname.split("&resultPage=")[0].split("?path=")[1].split(".");
            }
            else {
                var pName = pathname.split("?path=")[1].split(".");
            }
            var nodeName = ""; 
            for (i = 0; i < pName.length; i++) {
                nodeName = nodeName + pName[i];                
                $("#treeHolder").jstree("open_node", "#" + nodeName);
            }
            $("#treeHolder").jstree("select_node", "#" + nodeName);
            //$("#treeHolder").jstree("select_node", "#" + nodeName).trigger("select_node.jstree");
        }
    })
    
    .bind("select_node.jstree", function (event, data) {

        //Diables the querybox if enabled
        $("#BodyContent_queryBox").attr("disabled", "disabled");

        $("#editGrid").hide();
        $("#BodyContent_saveData").hide();
        $("#ui-testHistory").show();

        $(".cpanel #ui-run").show(); $(".cpanel #ui-edit").show(); $(".cpanel #ui-results").show();
        var pathname = document.location.href;
        if (pathname.indexOf("?path=") > 0) {
            if (pathname.indexOf("testgrid.aspx") > 0)
                //window.location.href = pathname.split("?path")[0];
		var t="";
        }
        else {
            var node = $("#treeHolder").jstree('get_selected');
            nodeId = node.attr('id').toString();
            var xmlPath = "";
            xmlPath = "Root" + "/" + getParents(node); //gets complete path of the selected node
            selectNode(xmlPath);
            
            $("#BodyContent_hiddenField").prop("disabled", false);
            $("#BodyContent_hiddenField").val(xmlPath);

            var testID = xmlPath.replace(/\//g, '.');
            if (!isSuite(testID)) {
                $("#ui-benchmark").show();
            }
        }

        //for toggling treeholder in collapse mode
        $(".collefttoggle").removeClass("collefttoggle");
               

           
    }) //bind select_node

    $("#treeHolder").delegate("a", "click", function (e) {
        document.location.href = this;
    })
   
}

function copyTestURL(node) {
    var nodeString = "Root/" + getParents(node);
    nodeString = nodeString.replace(/\//g, ".").replace(/\#/g, "");
    nodeString = document.location.href + "?path=" + nodeString;
    $("#urlText").text(nodeString);
    $("#gridHolder").css({ opacity: 0.5 });
    $("#popup").fadeIn();
}

function selectNode(xmlPath) {
    $("#testProperties").hide();
    $("#testContent").show();
    $("#gridHolder").css({ opacity: 0 });
    $("#loading").show();

    
    $("#ui-benchmark").hide();

    setTimeout(function () {
        $.ajax({
            type: "POST",
            async: false,
            url: "testgrid.aspx/testGridData",
            contentType: "application/json; charset=utf-8",
            data: "{strPath:'" + xmlPath + "',evalConfigStr:'y'}",
            dataType: "json",
            success: function (response) {
                var obj = $.parseJSON(response.d);
                if (obj.hasOwnProperty("configString")) {
                    $("#BodyContent_queryBox").text(obj.configString);
                    $("#BodyContent_commentsContent").text(obj.commentsString);
                    if (obj.hasOwnProperty("colModel") && obj.hasOwnProperty("colName")) {
                        loadGrid(xmlPath, obj.colName, obj.colModel);
                        $("#gridHolder").css('opacity', 0).show().animate({ opacity: 1 }, 600);
                    }
                    else {                        
                        $("#recordSet").jqGrid('GridUnload');
                        expandConfigSection();
                        $("#loading").hide();
                    }
                }
                else if (obj.hasOwnProperty("error")) {
                    //do something later to notify error
                    $("#loading").hide();
                    $("#BodyContent_queryBox").text("");
                }
            },
            Error: function (response) { alert("Error: " + response.d); }
        }); //ajax
    }, 500);
}//function

function getParents(node) {
    var parents;
    var nodeId = "#" + node.attr('id').toString();
    //Get all parents of selected node
    parents = $(nodeId).parents("li");
    var parName;
    var selector = "";

    //If Parents are null then just return the folder name
    if (parents.length <= 0) {
        selector = $(nodeId).children('a').text();
        selector = selector.replace(/^\s+|\s+$/g, ''); //to replace the white space
    }
    else { //else loop through all the parents and keep appending to selector
        for (var i = parents.length - 1; i >= 0; i--) {
            parName = $("#" + parents[i].id.toString()).children('a').text();
            selector += parName.replace(/^\s+|\s+$/g, '') + "/";
        }
        selector = selector + $(nodeId).children('a').text().replace(/^\s+|\s+$/g, '');
    }
    return selector;
}



