
<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="testgrid.aspx.cs" Inherits="stable.sample" MasterPageFile="~/Site.Master" validateRequest="false"%>


<asp:Content ID="HeaderContent" runat="server" ContentPlaceHolderID="HeadContent">
    <script src="_resources/scripts/testgrid.js"></script>    
    

    <script type="text/javascript">

        $(document).ready(function () {
            $('#buttonholder').tooltip({
                tooltipClass: 'customTooltip',
                show: {
                    effect: "explode",
                    delay: 275
                }
            });

            $('#treeControls').tooltip({
                tooltipClass: 'customTooltip',
                show: {
                    effect: "explode",
                    delay: 275
                }
            });


        });//document ready


        function selectall() {
            var grid = $("#recordSet");
            grid.resetSelection();
            //$('#cb_my_grid').click();
            var ids = grid.getDataIDs();
            for (var i = 0, il = ids.length; i < il; i++)
                grid.setSelection(ids[i], false);
        }


</script>

</asp:Content>

<asp:Content ID="MainContent" runat="server" ContentPlaceHolderID="BodyContent">
    <div id="popup"> 
        <div id="copyLinkTitle" class="dialogTitle">
            <span id="Span1" class="ui-dialog-title">Copy test url</span>
            <img id="dialogClose" src="images/delete.png" class="dialogClose"/>
        </div>
        <p id="urlText"> </p>        
        
    </div>
    <div id="dialog-form" title="Create new test">
        <div id="newTestTitle" class="dialogTitle">
            <span id="ui-id-1" class="ui-dialog-title">Create new test</span>
            <img id="cancel" src="images/delete.png" class="dialogClose"/>
        </div>
        <input type="text" name="name" id="folderName" class="textBox"/>
        <div id="submit" class="button">OK</div>        
    </div>

    
    <div id="buttonholder" class="cpanel">    
        <div id="ui-run" onclick="runTest()" class="iclass" title="Run Test"><i class="fa fa-play"></i></div>
        <div id="ui-results" onclick="testHistory()" class="iclass" title="Results"><i class="fa fa-files-o"></i></div>
        <asp:LinkButton ID="saveData" runat="server" OnClick="saveToServer" OnClientClick="sData()" class="iclass" title="Save Benchmark Data">                    
            <i class="fa fa-save"></i>
        </asp:LinkButton>

        <div id="secondGroup">
            <div id="ui-edit"class="iclass" title="Edit Test"><i class="fa fa-pencil-square-o" ></i></div>
            <div id="ui-benchmark" onclick="takeSnapShot()" class="iclass" title="New data snapshot"><i class="fa fa-camera"></i></div>
            <div id="ui-testHistory" onclick="" class="iclass" title="Test Archive"><i class="fa fa-archive"></i></div>

        </div>        

        <%-- UI for tags and Test Owner for next iteration
        <div id="thirdGroup">


            <div id="ui-Properties" onclick="testProperties()" class="iclass" title="Properties"><i class="fa fa-tag"></i></div>
            <div id="ui-save-Properties" onclick="" class="iclass" title="Save"><i class="fa fa-save"></i></div>
        </div>
        --%>

    </div>

    <div id="testContent">
        <p class="heading"> <span id="expanderSign">+</span>&nbsp Config Section  </p> 
        <div id="configBox">            
            Comments:             
            <asp:TextBox ID="commentsContent" runat="server" TextMode="multiline" class="textArea"></asp:TextBox>        
            Query:            
            <asp:TextBox ID="queryBox" runat="server" TextMode="multiline" class="textArea"></asp:TextBox>        
            <asp:TextBox ID="hiddenField" runat="server" TextMode="multiline" class="textArea" Visible="True"></asp:TextBox>             
        </div> 
        <div id="gridHolder" >            
            <div class="tableButtons" id="recordSetExportDiv">
                <asp:LinkButton ID="recordSetExport" runat="server" OnClick="recordSetExport_Click"><i class="fa fa-download">&nbsp;Download</i></asp:LinkButton>
            </div>      
            <table id="recordSet"></table>
            <div id="editGrid" style="overflow:auto; width:100%"> </div>
        </div>       
    </div>

    <%-- Div for test Properties for tagging and Test Owners, for next iteration
     <div id="testProperties">
        <div><label class="propertiesLabel">Test Owner:</label><input type="text" name="FirstName" value="Mickey" class="propertiesText"/></div>
        <div><label class="propertiesLabel">Tags:</label><input type="text" name="LastName" value="Mouse" class="propertiesText"/></div>
    </div>
    --%>
    
</asp:Content>