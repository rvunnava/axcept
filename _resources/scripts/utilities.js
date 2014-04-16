//checks if a path is suite or tests.Returns true or false
//sample argument:Root.OITInternational.RSSAT.TaxYear2011
function isSuite(testPath) {
    var suiteFlag;
    $.ajax({
        type: "POST",
        async: false,
        url: "resultgrid.aspx/getDirectoryCount",
        contentType: "application/json; charset=utf-8",
        data: "{strPath:'" + testPath + "'}",
        dataType: "json",
        success: function (response) {
            if (response.d > 0) {
                suiteFlag = true;
            }
            else if (response.d == 0) {
                suiteFlag = false;
            }
        }
    });
    return suiteFlag;
}

//checks if file exists
//sample argument:Root.OITInternational.RSSAT.TaxYear2011/files/outfilestestresult.xml
function urlExists(fileName) {
    //var http = new XMLHttpRequest();
    //http.open('HEAD', url, false);
    //http.send();
    //return http.status != 404;
    
    var response = $.ajax({
        url: fileName,
        type: 'HEAD',
        async: false
    }).status;

    return (response != "200") ? false : true;

}




