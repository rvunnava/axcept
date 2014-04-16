using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

using System.IO;
using System.Data;
using System.Data.SqlClient;
using System.Web.Services;
using System.Xml.Linq;
using System.Text.RegularExpressions;
using System.Diagnostics;
using System.Xml;

using Newtonsoft.Json;
using System.Text;

namespace stable
{
    public partial class sample : System.Web.UI.Page
    {   
        public static string pComments="";
        public Dictionary<string, string> queryVar = new Dictionary<string, string>();


        [WebMethod]
        [System.Web.Script.Services.ScriptMethod(ResponseFormat = System.Web.Script.Services.ResponseFormat.Json)]
        public static string testGridData(string strPath,string evalConfigStr)        
        {   
            strPath = strPath + "\\contents.xml";
            string xmlPath = HttpContext.Current.Server.MapPath(@strPath);
            string json;
            sample _obj = new sample();
            pComments = "";
            if (File.Exists(xmlPath))
            {
                DataSet actualDS = new DataSet();
                actualDS.ReadXml(xmlPath);
                DataTable actualDT = new DataTable();
                DataTable queryDT = new DataTable();                

                string configStr = "", colName = "", colModel = "", colN;
                string commentsStr = "";
                queryDT = actualDS.Tables["Config"];

                //form query string
                configStr = queryDT.Rows[0]["query"].ToString();
                if(evalConfigStr=="y") configStr = _obj.evaluateExpression(configStr, xmlPath);
                configStr = configStr.Replace("\"", "'").Replace('\\', '/').Trim() +"";
                configStr = JsonConvert.SerializeObject(configStr).ToString();
                configStr = "\"configString\":" + configStr ;
                
                //form comments string
                if (queryDT.Columns.Contains("comments")) commentsStr = queryDT.Rows[0]["comments"].ToString().Trim();
                if (commentsStr == "") commentsStr = pComments.Trim() + "";                
                commentsStr = commentsStr.Replace("\"", "'").Replace('\\', '/');
                commentsStr = JsonConvert.SerializeObject(commentsStr).ToString();
                commentsStr = "\"commentsString\":" + commentsStr ;

                actualDT = actualDS.Tables["row"];
                double maxLen;
                if (actualDT == null)
                {
                    json = "{" + configStr + "," + commentsStr + "}";
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
                                            .Select(row => row.Field<string>(colN))
                                            .ToArray();
                            maxLen = Convert.ToDouble(cFields.Max(w => w.Length));

                            if (colN.Length >= maxLen) 
                                maxLen = colN.Length * 12.5 ;                            
                            else
                                maxLen = maxLen *8.5;   

                            colName = colName + "'" + colN + "',";
                            colModel = colModel + "{name: '" + colN + "', index: '" + colN + "', xmlmap: '" + colN + "', width:" + maxLen + ", title:false" + "},";

                            cFields = null; maxLen = 0;
                        }
                    }

                    colName = "\"colName\":" + "\"[" + colName.Substring(0, colName.Length - 1) + "]\"";
                    colModel = "\"colModel\":" + "\"[" + colModel.Substring(0, colModel.Length - 1) + "]\"";
                    json = "{" + configStr + "," + colName + "," + colModel + "," + commentsStr + "}";                    
                }
            }
            else
            {
                json = "{\"error\":\"[File does not exists]\"}";
                
            }

            return json;
        }

        protected string evaluateExpression(string configStr, string xmlPath)
        {
            string rootPath = xmlPath.Split(new string[] { "Root" }, StringSplitOptions.None)[0];
            string traverseFolder = xmlPath.Split(new string[] { "Root" }, StringSplitOptions.None)[1];
            traverseFolder = traverseFolder.Replace("\\contents.xml", "");

            string[] folders;
            folders=traverseFolder.Split(new string[] { "\\" }, StringSplitOptions.None);
            string contentsPath="Root\\";

            XmlNode node;
            string strCmd = "", strVar="", strVal="";
            string tempVar;

            foreach (string folder in folders)
            {
                if (folder != "")                
                    contentsPath = contentsPath + folder + "\\";

                XmlDocument doc = new XmlDocument();
                if (File.Exists(rootPath + contentsPath + "contents.xml") && contentsPath!="Root\\")
                {
                    doc.Load(rootPath + contentsPath + "contents.xml");
                    node = (XmlNode)doc.DocumentElement;
                    node = node.SelectSingleNode("test/Config/query");

                    //comments entered at suite level should show in test
                    if (doc.SelectSingleNode("root/test/Config/comments") != null)
                    {
                        if (doc.SelectSingleNode("root/test/Config/comments").InnerText!="")
                            pComments = doc.SelectSingleNode("root/test/Config/comments").InnerText.ToString();
                    }
                    strCmd = node.InnerText.ToString();

                    foreach (var cmd in strCmd.Split(';'))
                    {
                        if (cmd.ToLower().Contains("set @"))
                        {
                            tempVar = cmd.Split(new string[] { "set @" }, StringSplitOptions.None)[1].Split('\n')[0];
                            strVar = "@" + tempVar.Split('=')[0].Trim();                            
                            strVal = tempVar.Split('=')[1].Trim();

                            if (!queryVar.ContainsKey(strVar))
                                queryVar.Add(strVar, strVal);
                            else
                                queryVar[strVar] = strVal;
                        }
                        else if (cmd.ToLower().Contains("@"))
                        {
                            tempVar = cmd;
                            foreach (var variable in queryVar.Keys)
                            {
                                if (cmd.Contains(variable))
                                {
                                    tempVar = tempVar.Replace(variable, queryVar[variable]);                                    
                                }
                            }//for each variable
                            strCmd = strCmd.Replace(cmd, tempVar);
                        }//if
                    }//for each cmd


                    node = null;
                }
            }


            return strCmd;

        }
        
        [WebMethod]
        [System.Web.Script.Services.ScriptMethod(ResponseFormat = System.Web.Script.Services.ResponseFormat.Xml)]
        public static XElement getDirectory(string rootFolder)
        {
            //Get the directory information of root folder into an array
            //Use HttpContext.Current.Server.MapPath only instead of Server.MapPath the method is static method.
            try
            {
                DirectoryInfo serverDir = new System.IO.DirectoryInfo(HttpContext.Current.Server.MapPath(@rootFolder));
                DirectoryInfo[] subDirectories = serverDir.GetDirectories();

                string treeID = "";
                //1 is addded infornt as the HTML DOM requires id to start with number
                if (rootFolder.ToLower() == "root") { treeID = "Root"; }//treeID = "1"; }
                else { treeID = Regex.Replace(rootFolder, "[^0-9a-zA-Z]+", "").ToString(); }

                //Convert the array into XMLElement using LINQ
                XElement rootDirectory =
                    new XElement("root",
                        from c in subDirectories
                        select new XElement
                                    ("item", new XAttribute("id", treeID + Regex.Replace(c.ToString(), "[^0-9a-zA-Z]+", "").ToString()),
                                        new XAttribute("state", "closed"),
                                        new XElement("content", new XElement("name", c.ToString()))
                                    )
                                );

                //new XElement("content", new XElement("name", new XAttribute("href", "?path=" + rootFolder.Replace("/", ".") + "." + c.ToString()), c.ToString()))
                return rootDirectory;
            }
            catch (Exception e)
            {
                return null;
            }

        }

        protected void saveToServer(object sender, EventArgs e)
        {
            string formData = hiddenField.Text;
            string commentsData = commentsContent.Text;

            formData = formData.Replace("#RootPath:", "<");
            string rootPath = formData.Split('<')[1];
            string xmlText = formData.Split('<')[0];

            string xmlPath = HttpContext.Current.Server.MapPath(@rootPath + "\\contents.xml");
            XmlDocument doc = new XmlDocument();

            if (File.Exists(xmlPath))
            {                
                doc.Load(xmlPath);
                File.Copy(xmlPath, HttpContext.Current.Server.MapPath(@rootPath) + "\\contents" + DateTime.Now.ToString("MMddyyhhmmss") + ".xml");
                File.Delete(xmlPath);
            }

            commentsData = "\n<comments>\n" + commentsData + "\n</comments>\n";
            xmlText = xmlText.Replace("&lt;", "<").Replace("&gt;", ">");
            xmlText = xmlText.Replace("<root>", "<test>");
            xmlText = xmlText.Replace("<Config>", "<Config>\n" + commentsData);
            xmlText = xmlText.Replace("</root>", "\n</test>\n");
            
            string xmlTags="";
            if(doc.SelectSingleNode("root/tags")!=null)
                xmlTags = "\n<tags>\n" + doc.SelectSingleNode("root/tags").InnerXml + "\n</tags>\n";

            xmlText = "<root>" + xmlTags + xmlText + "\n</root>";
            File.WriteAllText(xmlPath, xmlText);
            string testPage = rootPath.Replace("/", ".");
            //Response.Redirect("~/stable.aspx?path=" + testPage); */
        }

        [WebMethod]
        public static string runTest(string testPage, Boolean takeSnapshot = false)
        {
            string runnerPath = HttpContext.Current.Server.MapPath(@"Root\contents.xml");
            DataSet ds = new DataSet();
            ds.ReadXml(runnerPath);
            DataTable dt = new DataTable();
            dt = ds.Tables["Config"];

            string runner = dt.Rows[0]["query"].ToString().ToLower();
            runner = runner.Split('\n')[0].Trim().Replace("runner:","");
            dt.Clear(); ds.Clear();
            dt = null; ds = null;

            ds = new DataSet();
            ds.ReadXml(HttpContext.Current.Server.MapPath(@testPage + "\\contents.xml"));
            dt = ds.Tables["Config"];
            
            string groupLevel="";

            if (dt.Columns.Contains("grouplevel"))
                groupLevel = dt.Rows[0]["grouplevel"].ToString().ToLower();            

            dt.Clear(); ds.Clear(); dt = null; ds = null;
                        
            testPage = testPage.Replace("/", ".");
            Process p = new Process();
            p.StartInfo.FileName = HttpContext.Current.Server.MapPath(@"bin\" + runner);
            p.StartInfo.UseShellExecute = true;
            p.StartInfo.CreateNoWindow = false;
            //p.StartInfo.Arguments = "Root.LargeDataSet.LtQbuCalculations2012.TestApportBaseAuditTrailAfterDivLt";
            string timeStamp = DateTime.Now.ToString();
            string[] args;

            if(!takeSnapshot)
                args = new string[] { testPage, "\"" + "timestamp=" + timeStamp + ";hdrLevel=" + groupLevel + "\"" };
            else
                args = new string[]  { testPage, "\"" + "takesnapshot=y" + "\"" };


            p.StartInfo.Arguments = String.Join(" ", args);
            timeStamp = Convert.ToDateTime(timeStamp).ToString("MMddyyHHmmss");

            try
            {
                 p.Start();
                 testPage = testPage + "^" + timeStamp + ".xml";
                //testPage = "files/TestResults/" + testPage;
                return testPage;
            }
            catch (Exception e)
            {
                return "Error";
            }
            
        }
        
        [WebMethod]
        public static void createTest(string strPath)
        {
            strPath = HttpContext.Current.Server.MapPath(@strPath);
            Directory.CreateDirectory(strPath);
            strPath = strPath + "\\contents.xml";

            string xmlString =
                "<root>" + Environment.NewLine +
                "<test>" + Environment.NewLine +
                    "<Config>" + Environment.NewLine +
                        "<query></query>" + Environment.NewLine  +
                    "</Config>" + Environment.NewLine +
                    "<row><ColName1>Sample Row</ColName1><ColName2>Sample Row</ColName2><ColName3>Sample Row</ColName3><ColName4>Sample Row</ColName4><ColName5>Sample Row</ColName5><ColName6>Sample Row</ColName6><ColName7>Sample Row</ColName7></row>" + Environment.NewLine +
                "</test>" + Environment.NewLine +
                "</root>";
            File.WriteAllText(strPath, xmlString);
        }

        protected void recordSetExport_Click(object sender, EventArgs e)
        {
            string xmlPath = hiddenField.Text;            
            xmlPath = HttpContext.Current.Server.MapPath(@xmlPath) + "/contents.xml";
                
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
            var filename = xmlPath.Split('\\');
            string fName = filename[filename.Length - 1].Split('/')[0];

            Response.Clear();
            Response.AddHeader("Content-Disposition", "attachment;filename=" + fName + ".xls");
            Response.ContentType = "application/vnd.xls";
            Response.Cache.SetCacheability(HttpCacheability.NoCache); // not necessarily required
            Response.Charset = "";
            Response.Output.Write(htmlContent);
            Response.End();
            dt.Clear(); dt = null;
            ds.Clear(); ds = null;
        }


        public static string ConvertDataTable2HTMLString(DataTable dt)
        {
            StringBuilder sb = new StringBuilder();
            sb.Append("<html>" +
                "<head> <style> .tblHeader{background-color:#EEE;} </style> </head>" + 
                "<body><table><thead><tr>"
            );
            foreach (DataColumn c in dt.Columns)
            {
                sb.AppendFormat("<th class='tblHeader'>{0}</th>", c.ColumnName);
            }
            sb.AppendLine("</tr></thead><tbody>");
            foreach (DataRow dr in dt.Rows)
            {
                sb.Append("<tr>");
                foreach (object o in dr.ItemArray)
                {
                    sb.AppendFormat("<td>{0}</td>", HttpContext.Current.Server.HtmlEncode(o.ToString()));
                }
                sb.AppendLine("</tr>");
            }
            sb.AppendLine("</tbody></table></body></html>");
            return sb.ToString();
        }
    }
}