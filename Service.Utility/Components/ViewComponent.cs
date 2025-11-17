using Microsoft.AspNetCore.Http;
using Service.Utility.Variables;

namespace Service.Utility.Components
{
    public class ViewComponent
    {
        public HttpContext Context { get; set; }
        public AuthDataModel AuthData { get; set; }
        public string Project { get; set; }


        public ViewComponent(HttpContext context, AuthDataModel authData, string project)
        {
            Context = context;
            AuthData = authData;
            Project = project;
        }

        public void Hit()
        {
            new Task(Save).Start();
        }

        private void Save()
        {
            var exceptionViews = File.ReadAllLines(Context.Path.Combine("/app_data/exceptionViews.txt"));
            var m = ConstantVariables.MediaConfigs.FirstOrDefault(x => !x.isFull);
            if (m != null)
            {
                if(!exceptionViews.Contains(Context.Request.Path.ToLower()))
                {
                    var path = "/media" + (m.id > 0 ? m.id + "" : "") + "/views_log";
                    path = FileComponent.DateFolder(path, null) + "/" + DateTime.Now.Hour + ".txt";
                    var fp = FileComponent.GetFullPath(path);
                    if (!File.Exists(fp))
                    {
                        File.Create(fp).Dispose();
                    }
                    var data = DateTime.Now.ToString("dd/MM/yyyy HH:mm:ss")
                               + "***" + Project
                               + "***" + GetIpAddress()
                               + "***" + AuthData.UserId + ":" + AuthData.FullName
                               + "***" + Context.Request.Path.ToString().ToLower()
                               + "***" + (Context.Request.Headers["X-Requested-With"] == "XMLHttpRequest" ? "Ajax" : "Normal")
                               + "***" + Context.Request.Method.ToString().ToLower()
                               + "***" + Context.Request.Headers["User-Agent"].ToString();
                    var done = false;
                    while (!done)
                    {
                        try
                        {
                            File.AppendAllText(fp, data + Environment.NewLine);
                            done = true;
                        }
                        catch (Exception)
                        {
                            Thread.Sleep(100);
                        }
                    }
                }
                
            }
        }
        protected string GetIpAddress()
        {
            var ipAddress = Context.Request.Headers["X-Forwarded-For"].FirstOrDefault();

            if (ipAddress != null)
            { 
                if (!string.IsNullOrEmpty(ipAddress))
                {
                    string[] addresses = ipAddress.Split(',');
                    if (addresses.Length != 0)
                    {
                        return addresses[0];
                    }
                }
                return Context.Connection.RemoteIpAddress.ToString();
            }
            return "";
        }
    }
}