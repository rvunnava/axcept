  <%@ Page Language="C#" AutoEventWireup="true" CodeBehind="resultgrid.aspx.cs" Inherits="stable.ResultGrid"  MasterPageFile="~/Site.Master"%>

<asp:Content ID="HeaderContent" runat="server" ContentPlaceHolderID="HeadContent">

        <script src="_resources/scripts/resultgrid.js"></script>

        <script type="text/javascript">
            
            $(document).ready(function () {
                if ($("#BodyContent_testHistory").length != 0) {
                    $(".heading").hide();
                    $("#configBox").hide();
                }
                else {                    
                    $(".heading").show();
                }

                $('#buttonholder').tooltip({
                    tooltipClass: 'customTooltip',
                    show: {
                        effect: "explode",
                        delay: 275
                    }
                });

            });

</script>


</asp:Content>


<asp:Content ID="MainContent" runat="server" ContentPlaceHolderID="BodyContent">
    <div id="buttonholder" class="resultsCpanel">
        <div id="ui-edit"class="iclass" title="Edit Test"><i class="fa fa-pencil-square-o" ></i></div>
        <div id="testName"></div>
       <ul class="breadcrumb"></ul>
    </div>        
    <div id="testContent" class="resultsTestContent">
    <p class="heading"> <span id="expanderSign">+</span>&nbsp Config Section</p> 
    <div id="configBox">                        
        <asp:TextBox ID="queryBox" runat="server" TextMode="multiline" class="textArea"></asp:TextBox>
        <asp:TextBox ID="hiddenField" runat="server" TextMode="multiline" class="textArea" Visible="True"></asp:TextBox>
    </div>
    <div id="gridHolder"> 
        <div class="tableButtons" id="resultSetExportDiv">
            <asp:LinkButton ID="resultSetExport" runat="server" OnClick="resultSetExport_Click" ><i class="fa fa-download" >&nbsp;Download</i></asp:LinkButton>
        </div>
        <table id="testSummary"></table>   
        <table id="resultSet"></table>
        <table id="testHistory" ></table>
        <%-- <asp:GridView ID="testHistory" runat="server" class="testHistory" ></asp:GridView>  --%>
    </div>
    </div>
</asp:Content>