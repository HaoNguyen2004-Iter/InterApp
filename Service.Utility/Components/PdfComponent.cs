using System;
using System.Collections.Generic;
using System.Text;
using System.Web;
using Service.Utility.Variables;
using Microsoft.AspNetCore.Hosting;

namespace Service.Utility.Components
{
    public class PdfComponent
    {
        private readonly IWebHostEnvironment _env; 

        public PdfComponent()
        {

        }

        public PdfComponent(IWebHostEnvironment env)
        {
            _env = env;
        }

        public CommandResult<bool> Export(string url, string dest)
        {
            try
            {
                var controller = Path.Combine(_env.WebRootPath, "Rotativa", "wkhtmltopdf.exe");
                var fp = FileComponent.GetFullPath(dest);
                var arg = new StringBuilder().AppendFormat("/K {0} \"{1}\" {2} & exit",
                 controller,
                 url,
                 fp).ToString();

                System.Diagnostics.Process process = new System.Diagnostics.Process();
                process.StartInfo = new System.Diagnostics.ProcessStartInfo()
                {
                    UseShellExecute = false,
                    CreateNoWindow = true,
                    WindowStyle = System.Diagnostics.ProcessWindowStyle.Hidden,
                    FileName = "cmd.exe",
                    Arguments = arg,
                    RedirectStandardError = true,
                    RedirectStandardOutput = true
                };
                process.Start();
                // Now read the value, parse to int and add 1 (from the original script)
                process.WaitForExit();

                return new CommandResult<bool>(true);
            }
            catch (Exception e)
            {
                return new CommandResult<bool>(e.Message);
            }
        }

        public CommandResult<bool> Export(string url, string dest, List<string> options)
        {
            try
            {
                var controller = Path.Combine(@"\Rotativa\wkhtmltopdf.exe ");
                var fp = FileComponent.GetFullPath(dest);
                var arg = new StringBuilder().AppendFormat("/K {0} {1} {2} {3} & exit",
                    controller,
                    string.Join(" ", options),
                    url,
                    fp).ToString();

                System.Diagnostics.Process process = new System.Diagnostics.Process();
                process.StartInfo = new System.Diagnostics.ProcessStartInfo()
                {
                    UseShellExecute = false,
                    CreateNoWindow = true,
                    WindowStyle = System.Diagnostics.ProcessWindowStyle.Hidden,
                    FileName = "cmd.exe",
                    Arguments = arg,
                    RedirectStandardError = true,
                    RedirectStandardOutput = true
                };
                process.Start();
                // Now read the value, parse to int and add 1 (from the original script)
                process.WaitForExit();

                return new CommandResult<bool>(true);
            }
            catch (Exception e)
            {
                return new CommandResult<bool>(e.Message);
            }
        }
    }
}