using System;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;

namespace Service.Utility.Variables
{
    public class DownloadResult : ActionResult
    {
        private readonly IWebHostEnvironment? _hostingEnvironment;

        public DownloadResult() { }

        public DownloadResult(string virtualPath)
        {
            this.VirtualPath = virtualPath;
        }

        public string VirtualPath
        {
            get;
            set;
        }

        public string FileDownloadName
        {
            get;
            set;
        }

        public override void ExecuteResult(ActionContext context)
        {
            var hostingEnvironment = context.HttpContext.RequestServices.GetService<IWebHostEnvironment>();
            
            if (!String.IsNullOrEmpty(FileDownloadName))
            {
                context.HttpContext.Response.Headers["content-disposition"] =
                    "attachment; filename=" + this.FileDownloadName;
            }

            string filePath;
            if (hostingEnvironment != null && !string.IsNullOrEmpty(this.VirtualPath))
            {
                filePath = System.IO.Path.Combine(hostingEnvironment.WebRootPath, this.VirtualPath.TrimStart('~', '/'));
            }
            else
            {
                filePath = this.VirtualPath ?? string.Empty;
            }

            if (System.IO.File.Exists(filePath))
            {
                var fileBytes = System.IO.File.ReadAllBytes(filePath);
                context.HttpContext.Response.Body.WriteAsync(fileBytes, 0, fileBytes.Length);
            }
        }
    }
}
