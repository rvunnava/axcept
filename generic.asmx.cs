using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Services;
using System.Diagnostics;
using System.IO;
using System.ComponentModel;

namespace stable
{
    /// <summary>
    /// Summary description for generic
    /// </summary>
    [WebService(Namespace = "http://axcept.org/")]
    [WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
    [System.ComponentModel.ToolboxItem(false)]
    // To allow this Web Service to be called from script, using ASP.NET AJAX, uncomment the following line. 
    [System.Web.Script.Services.ScriptService]
    public class generic : System.Web.Services.WebService
    {

        [WebMethod]
        public string svcRunTest(string testPage, string runParms)
        {

            string runner = "runner_sql.exe";


            Process p = new Process();
            p.StartInfo.FileName = HttpContext.Current.Server.MapPath(@"bin\" + runner);
            p.StartInfo.UseShellExecute = false;
            p.StartInfo.CreateNoWindow = false;
            p.StartInfo.RedirectStandardOutput = true;
            p.StartInfo.RedirectStandardError = true;
            
            string[] args = { testPage, "\"" +  runParms + "\"" };
            p.StartInfo.Arguments = String.Join(" ", args);
            
            string strline = "";

            try
            {
                p.Start();
                strline = p.StandardOutput.ReadToEnd();
                p.WaitForExit();

                return strline;
            }
            catch (Exception e)
            {
                return "testError";
            }

          
        }
    }
}
