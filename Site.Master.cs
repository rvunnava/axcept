using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.Services;
using System.IO;
using System.DirectoryServices;


namespace stable
{
    public partial class Site : System.Web.UI.MasterPage
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            if (System.Security.Principal.WindowsIdentity.GetCurrent().IsAuthenticated)
            {
                //userLabel.Text = System.DirectoryServices.AccountManagement.UserPrincipal.Current.DisplayName;
                //System.Security.Principal.WindowsPrincipal p = System.Threading.Thread.CurrentPrincipal as System.Security.Principal.WindowsPrincipal;
                //userLabel.Text = p.Identity.Name;
                
                /*
                System.Security.Principal.WindowsPrincipal p = System.Threading.Thread.CurrentPrincipal as System.Security.Principal.WindowsPrincipal;

                string displayName="";

                using (System.DirectoryServices.AccountManagement.PrincipalContext pc = new System.DirectoryServices.AccountManagement.PrincipalContext(System.DirectoryServices.AccountManagement.ContextType.Domain))
                {
                    System.DirectoryServices.AccountManagement.UserPrincipal up = System.DirectoryServices.AccountManagement.UserPrincipal.FindByIdentity(pc, p.Identity.Name);
                    displayName = up.DisplayName;
                }
                userLabel.Text = displayName.Split('(')[0];
                */

               // userLabel.Text = HttpContext.Current.User.Identity.Name.ToString();

                
            }
        }
    }
}