using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

using System.IO;
using System.Data.SqlClient;
using System.Data;
using System.Web.Services;
using System.Text.RegularExpressions;
using System.Xml.Serialization;
using System.Xml;
using System.Text;
using Newtonsoft.Json;

namespace stable
{
    public partial class ResultGrid : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {            

        }//page load

         [WebMethod]
         [System.Web.Script.Services.ScriptMethod(ResponseFormat = System.Web.Script.Services.ResponseFormat.Json)]
         public static string getGridModel(string strPath)
         {
             ResultGrid rg = new ResultGrid();
             string tempPath = strPath.Split(new string[] { "//" }, StringSplitOptions.None)[0];
             tempPath = HttpContext.Current.Server.MapPath(tempPath.Replace(".", "//"));
             int directoryCount = Directory.GetDirectories(tempPath).Length;
             
             strPath = "files//TestResults//" + strPath;
             string xmlPath = HttpContext.Current.Server.MapPath(@strPath);
             string json="";
             
             if (directoryCount > 0)
             {
                 json = rg.getSuiteGridModel(xmlPath);                 
             }
             else if (File.Exists(xmlPath))
             {
                #region testxml
                 DataSet actualDS = new DataSet();
                 actualDS.ReadXml(xmlPath);
                 DataTable actualDT = new DataTable();
                 DataTable queryDT = new DataTable();
                 DataTable statusDT = new DataTable();

                 string configStr = "", colName = "", colModel = "", colN;
                 string tblStatus="";

                 queryDT = actualDS.Tables["Config"];
                 configStr = queryDT.Rows[0]["query"].ToString();                 
                 configStr = configStr.Replace("\"", "'").Replace('\\', '/')+"";
                 configStr = JsonConvert.SerializeObject(configStr).ToString();
                 configStr = "\"configString\":" + configStr;



                 actualDT = actualDS.Tables["row"];
                 statusDT = actualDS.Tables["status"];
                 double maxLen;
                 if (actualDT == null)
                 {
                     json = "{" + configStr + "}";
                 }
                 else
                 {
                     foreach (DataColumn dc in actualDT.Columns)
                     {
                         colN = dc.ColumnName;
                         
                         if (colN != "test_Id")
                         {
                             var cFields = actualDT
                                             .AsEnumerable()
                                             .Select(row => row.Field<string>(colN)
                                             .Replace("</span>", "")
                                             .Replace("<span class='fail'>","")
                                             .Replace("<span class='exp'>","")
                                             .Replace("<span class='act'>", "")
                                             .Replace("expected", "expected   |~|")
                                             .Split(new string[] { "|~|" }, StringSplitOptions.None)[0])
                                             .ToArray();
                             maxLen = Convert.ToDouble(cFields.Max(w => w.Length));

                             if (colN.Length >= maxLen)
                                 maxLen = colN.Length * 12.5;
                             else
                                 maxLen = maxLen * 8.5;

                             colName = colName + "'" + colN + "',";
                             if (colN == "Status")
                                 colModel = colModel + "{name: '" + colN + "', index: '" + colN + "', xmlmap: '" + colN + "', width:" + maxLen + ", title:false, hidden: true" + "},";
                             else
                                 colModel = colModel + "{name: '" + colN + "', index: '" + colN + "', xmlmap: '" + colN + "', width:" + maxLen + ", title:false" + "},";

                             cFields = null; maxLen = 0;
                         } //if
                     }//for each

                     tblStatus = "pass: '" + statusDT.Rows[0]["pass"] + "', " +
                                    "fail: '" + statusDT.Rows[0]["fail"] + "', " +
                                    "errors: '" + statusDT.Rows[0]["errors"] + "', " +
                                    "duration: '" + statusDT.Rows[0]["duration"]  + "', " +
                                    "msg: '" + statusDT.Rows[0]["msg"].ToString() + "'";


                     
                     colName = "\"colName\":" + "\"[" + colName.Substring(0, colName.Length - 1) + "]\"";
                     colModel = "\"colModel\":" + "\"[" + colModel.Substring(0, colModel.Length - 1) + "]\"";
                     tblStatus = "\"tblStatus\":" + "\"" + tblStatus.Replace("\n", "").Replace("\r","") + "\"";

                     json = "{" + configStr + "," + tblStatus + "," + colName + "," + colModel + "}";
                    
                }
                 
                 actualDT = null; queryDT = null; statusDT = null;
                 actualDS = null;
                #endregion
             }
             else
             {
                 json = "{\"error\":\"[File does not exists]\"}";
             }
            
             return json;
         }//getGrid Model

        //get grid model if target is suite page
        public string getSuiteGridModel(string xmlPath){
            
            string colName = "\"colName\":" + "\"['Header','Pass','Fail','Errors', 'Test Name', 'Duration', 'Link']\"";

            string colModel = "\"colModel\":" + "\"[" +
                "{name: 'Header', index: 'Header', xmlmap: 'hdrContent', width:200 , title:false" + "}," +
                "{name: 'Pass', index: 'Pass', xmlmap: 'right', width:100 , title:false" + "}," +
                "{name: 'Fail', index: 'Fail', xmlmap: 'wrong', width:100 , title:false" + "}," +
                "{name: 'Errors', index: 'Errors', xmlmap: 'exceptions', width:100 , title:false" + "}," +
                "{name: 'Test Name', index: 'Test Name', xmlmap: 'relativePageName', width:500 , title:false" + "}," +
                "{name: 'Duration', index: 'Duration', xmlmap: 'runTimeInSeconds', width:200 , title:false" + "}," +
                "{name: 'Link', index: 'Link', xmlmap: 'pageHistoryLink', width:200 , title:false" + "}" + 
                "]\"";

            string json = "{" + colName + "," + colModel + "}";

            return json;
        }

        [WebMethod]
        [System.Web.Script.Services.ScriptMethod(ResponseFormat = System.Web.Script.Services.ResponseFormat.Json)]
        public static int getDirectoryCount(string strPath)
         {
             string tempPath = strPath;
            if (strPath.Contains("//"))            
                tempPath = strPath.Split(new string[] { "//" }, StringSplitOptions.None)[0];
            
             tempPath = HttpContext.Current.Server.MapPath(tempPath.Replace(".", "//"));
             int directoryCount = Directory.GetDirectories(tempPath).Length;
             return directoryCount;
         }

        [WebMethod]
        [System.Web.Script.Services.ScriptMethod(ResponseFormat = System.Web.Script.Services.ResponseFormat.Xml)]
        public static string getTestHistory(string strPath)
        {
            string result = "";
            strPath = HttpContext.Current.Server.MapPath(@strPath);
            if (File.Exists(strPath))
            {

                DataSet ds = new DataSet();
                DataTable dt = new DataTable();

                ds.ReadXml(strPath);
                dt = ds.Tables["row"];

                if (dt != null)
                {
                    dt.DefaultView.Sort = "Date desc";
                    dt = dt.DefaultView.ToTable();
                }

                dt.AcceptChanges();
                ds.AcceptChanges();
                StringWriter sw = new StringWriter();
                dt.WriteXml(sw);
                result = sw.ToString();

                result = result.Replace("DocumentElement", "testResults");

                sw = null; dt = null; ds = null;
            }

            return result;

        }

        protected void resultSetExport_Click(object sender, EventArgs e)
        {

            string xmlPath = hiddenField.Text.ToString();
            xmlPath = "files\\TestResults\\" + xmlPath;
            xmlPath = HttpContext.Current.Server.MapPath(@xmlPath);

            XmlDocument doc = new XmlDocument();
            doc.Load(xmlPath);
            string xmlcontents = doc.InnerXml;
            xmlcontents = @xmlcontents.Replace("<test>", "").Replace("</test>", "");
            doc = null;

            DataSet ds = new DataSet();
            ds.ReadXml(XmlReader.Create(new StringReader(xmlcontents)));
            DataTable dt = new DataTable();
            dt = ds.Tables["row"];

            String htmlContent = ConvertDataTable2HTMLString(dt);
            var filename = xmlPath.Split('.');
            string fName = filename[filename.Length - 2].Split('\\')[0];

            Response.Clear();
            Response.AddHeader("Content-Disposition", "attachment;filename=" + fName + ".xls");
            Response.ContentType = "application/vnd.xls";
            Response.Cache.SetCacheability(HttpCacheability.NoCache); // not necessarily required
            Response.Charset = "";

            Response.Output.Write(HttpUtility.HtmlDecode(htmlContent));
            Response.End();
            dt.Clear(); dt = null;
            ds.Clear(); ds = null;
        }

        public static string ConvertDataTable2HTMLString(DataTable dt)
        {
            StringBuilder sb = new StringBuilder();

            //for now the styles are appended inside .cs file, but this needs to be seperated out in later release
            sb.Append("<html>" +
                "<head> "+
                    "<style>" +
                        ".exp {color:rgb(192, 128, 128); }" +
                        ".act {color:rgb(192, 128, 128); }" +
                        ".tblHeader{background-color:#EEE;margin: 4px}" + 
                        ".fail{background: #FFAAAA;}" +
                        ".pass{ background: #AAFFAA;}" +
                        "br {mso-data-placement:same-cell;}" +
                    "</style>" +
                "</head>" +
                "<body><table><thead><tr>"
            );

            Boolean missingFlag=false;

            foreach (DataColumn c in dt.Columns)
            {
                sb.AppendFormat("<th class='tblHeader'>{0}</th>", c.ColumnName);
            }

            string tdString="";
            sb.AppendLine("</tr></thead><tbody>");
            foreach (DataRow dr in dt.Rows)
            {
                missingFlag = false;
                sb.Append("<tr>");
                foreach (object o in dr.ItemArray)
                {                    
                    tdString = o.ToString();

                    if (tdString.Contains("<span class='fail'>"))
                    {
                        tdString = tdString.Replace("<span class='fail'>", "").Replace("<span class='exp'>", " <span class='exp'>");
                        tdString = tdString.Replace("<hr>", "<br/>");                        
                        tdString = tdString.Replace("<span class='act'>", " <span class='act'>");
                        sb.AppendFormat("<td class='fail'>{0}</td>", HttpContext.Current.Server.HtmlEncode(tdString));

                        if (tdString.Contains("missing") || tdString.Contains("surplus"))
                            missingFlag = true;
                    }
                    else if (missingFlag)
                    {
                        sb.AppendFormat("<td>{0}</td>", HttpContext.Current.Server.HtmlEncode(tdString));
                    }
                    else
                    {
                        sb.AppendFormat("<td class='pass'>{0}</td>", HttpContext.Current.Server.HtmlEncode(tdString));
                    }
                }
                sb.AppendLine("</tr>");
            }
            sb.AppendLine("</tbody></table></body></html>");
            return sb.ToString();
        }


    }
}