$(document).ready(function () {
    
    $(".textArea").css("display", "block");    
    textAreaMisc();
    $("#configBox").hide();
    //splitter();

    //expand collapse of config box
    $(".heading").click(function () { toggleConfigSection(); });

    //testSummary();
    //testResults();
    formatTestHistory();

    $("#loading").hide();
    $("#popup").hide();

    //For Close on pop up to copy test url
    $("#dialogClose").click(function () { $("#popup").fadeOut();$("#gridHolder").css({ opacity: 1}); });

}); //document.ready

//##########################################################################
function toggleConfigSection() {
    $(".heading").next("#configBox").slideToggle(250);
        if ($("#expanderSign").text() == "+") {
            $("#expanderSign").html("−")
        }
        else {
            $("#expanderSign").text("+")
        }
}
//##########################################################################
function expandConfigSection() {
    $("#configBox").show();
    $("#expanderSign").html("−")
}

function collapseConfigSection() {
    $("#configBox").hide();
    $("#expanderSign").html("+")
}



//##########################################################################


//##########################################################################

//##########################################################################
function splitter() {
    //Splitter
    $("#bodyContainer").splitter({
        outline: false,
        sizeLeft: true,
        sizeRight: true
    });
}

//##########################################################################
function textAreaMisc() {
    //Query Box Related
    $(".textArea").attr("disabled", "disabled");    
}

//##########################################################################
function formatTestHistory() {
    $(".testHistory td:contains('a href')").each(function () {
        str = $(this).text();
        $(this).contents().remove();
        $(this).append(str);
    })
}
//##########################################################################

function testResults() {
    //test summary
    
    var warningFlag = false;
    var fail = $('#testSummary td:eq(1)');
    var error = $('#testSummary td:eq(2)');
    var pass = $('#testSummary td:eq(0)');


    if (error.text() > 0) {
        $('#testSummary').css({ 'background': '#FFFFAA' });
        warningFlag = true;
    }
    else if (fail.text() > 0) {
        $('#testSummary').css({ 'background': '#FFAAAA' });
    }
    else if (pass.text() > 0) {
        $('#testSummary').css({ 'background': '#AAFFAA' });
    }
    else {
        $('#testSummary td:eq(2)').text("1");
        $('#testSummary td:eq(4)').text("Unknown Error");
        $('#testSummary').css({ 'background': '#FFFFAA' });
        $("#resultSet td").addClass("exception");
    }
    
    if (warningFlag) {
        $("#resultSet td").removeClass("pass");
        $("#resultSet td").addClass("exception");
    }
    
    $("td .fail").each(function () {
        $(this).parent().removeClass("pass");
        $(this).parent().addClass("fail");
    });

    //to remove the class pass from missing rows
    $("td .fail:contains('missing')").each(function () {
        $(this).parent().parent().find("td").each(function () {
            if ($(this).attr("class") != "fail")
                $(this).addClass("missing");
        });
    });

    //to remove the class pass from suprlus rows

    $("td .fail:contains('surplus')").each(function () {
        $(this).parent().parent().find("td").each(function () {
            if ($(this).attr("class") != "fail")
                $(this).addClass("missing");
        });
    });

    /*
    $("td .fail:contains('surplus')").each(function () {
        $(this).parent().parent().find("td").each(function () {
            if ($(this).attr("class") != "fail")
                $(this).addClass("missing");
        });
    });*/


    $("#resultSet td[aria-describedby='resultSet_Status']:contains('fail')").each(function () {
        $(this).parent().find("td:eq(0)").addClass("fail");
    });




}

//##########################################################################
function testResults1() {

    $(".testResults td:contains('span class='fail'')").each(function () {
        $(this).removeClass("pass");
        $(this).addClass("fail");
        str = $(this).text();
        $(this).contents().remove();
        //var html = $.parseHTML(str);
        $(this).append(str);
    });
}

//##########################################################################
function resizeEditorDiv() {
    vpw = $(window).width();
    vph = $(window).height() - 150;
    $("#editGrid").css({ "height": vph + "px" });
    //$(".htCore").css({ "width": "90%" });
}

//##########################################################################

function filterFailures() {

    $('#resultSet tr td:first-child').each(function () {
        //alert($(this).text() + "  " + company + ": " + $(this).text().indexOf(company));
        if ($(this).text().indexOf('surplus') > -1) {
            $(this).parent().find("td:last-child").text('y');
        }
    });

    $('#resultSet tr td:last-child').each(function () {
        //alert($(this).text() + "  " + company + ": " + $(this).text().indexOf(company));
        if ($(this).text().indexOf('y') == -1) {
            $(this).parent().hide();
        }
    });
}

function filterCompany() {
    var company = $('#Text1').val();
    $('#resultSet tr td:first-child').each(function () {
        //alert($(this).text() + "  " + company + ": " + $(this).text().indexOf(company));

        if (company == "") {
            $(this).parent().show();
        }
        else if ($(this).text().indexOf(company) == -1) {
            $(this).parent().hide();
        }
    });
}