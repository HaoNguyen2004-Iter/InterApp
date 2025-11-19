using Service.Utility.Components;
using Service.Utility.Variables;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;
using F = System.IO.File;

namespace BMWindows.Controllers
{
    public class SaveChunkModel
    {
        public int count { get; set; }
        public string? path { get; set; }
        public string fileName { get; set; } = string.Empty;
        public string fileCode { get; set; } = string.Empty;
        public bool isSystem { get; set; }
        public string? size { get; set; }
        public string? dimensions { get; set; }
        public int? u { get; set; }
        public string? Type { get; set; }
        public bool CreateThumb { get; set; }
        public string? ThumbSize { get; set; }
        public string? ResizeType { get; set; }
    }

    public class SearchMediaModel
    {
        public bool isSystem { get; set; }
        public string? type { get; set; }
        public string? folderType { get; set; }
        public string? path { get; set; }
        public int? u { get; set; }
    }

    public class ApiMediaController : Controller
    {
        private readonly IWebHostEnvironment _env;

        public ApiMediaController(IWebHostEnvironment env)
        {
            _env = env;
        }

        /// <summary>
        /// Thay cho Server.MapPath trong .NET Core.
        /// Dùng wwwroot làm root cho các đường dẫn kiểu "/Content/..."
        /// </summary>
        private string MapPath(string relativePath)
        {
            if (string.IsNullOrWhiteSpace(relativePath))
                throw new ArgumentNullException(nameof(relativePath));

            var path = relativePath.Trim();
            if (path.StartsWith("~"))
                path = path[1..];
            if (path.StartsWith("/"))
                path = path[1..];

            path = path.Replace('/', Path.DirectorySeparatorChar);
            return Path.Combine(_env.WebRootPath, path);
        }

        public IActionResult MediaList(SearchMediaModel model, OptionResult option)
        {
            QueryResult<MediaItem> result;
            var list = new List<MediaItem>();

            if (model.isSystem)
            {
                if (!string.IsNullOrEmpty(model.path))
                {
                    // kiểm tra /media có private
                    if (model.path.IndexOf("private", StringComparison.CurrentCulture) < 0)
                    {
                        model.path += "/private";
                    }

                    list = FileComponent.GetFileAndFolders(model.path, model.type);
                    result = new QueryResult<MediaItem>(list, option);
                    return Json(result);
                }

                list.Add(new MediaItem
                {
                    path = "/media/private",
                    name = "Kho ảnh",
                    type = "folder",
                    isFull = false
                });

                result = new QueryResult<MediaItem>(list, option);
                return Json(result);
            }

            list = new List<MediaItem>();

            if (string.IsNullOrEmpty(model.path))
            {
                model.path = "/media/drive/";

                list.Add(new MediaItem
                {
                    path = model.path.Substring(0, model.path.Length - 1),
                    name = "My folder",
                    id = 0,
                    type = "folder"
                });
                return Json(new QueryResult<MediaItem>(list, option));
            }

            var t = model.path.Substring(1);
            model.path = t.Substring(t.IndexOf('/') + 1);

            foreach (var media in ConstantVariables.MediaConfigs)
            {
                var fp = FileComponent.GetFullPath('/' + media.name + '/' + model.path);
                if (Directory.Exists(fp))
                {
                    var data = FileComponent.GetFileAndFolders('/' + media.name + '/' + model.path, model.type);
                    if (data != null)
                    {
                        list.AddRange(data);
                    }
                }
            }

            result = new QueryResult<MediaItem>(list, option);
            return Json(result);
        }

        public void OptimizeABC(string path)
        {
            if (path.IndexOf("private", StringComparison.CurrentCulture) < 0)
            {
                path += "/private";
            }

            var medias = FileComponent.GetFileAndFolders(path, null);

            foreach (var m in medias)
            {
                if (m.type == "file")
                {
                    if (string.IsNullOrEmpty(m.dimensions))
                    {
                        var fp = FileComponent.GetFullPath(m.path);
                        try
                        {
                            using (Image img = Image.FromFile(fp))
                            {
                                m.dimensions = img.Width + " x " + img.Height;
                                var f = Path.Combine(Path.GetDirectoryName(fp) ?? string.Empty, "folder_info.txt");
                                var infos = System.IO.File.ReadAllLines(f, Encoding.UTF8);
                                var data = new StringBuilder();

                                foreach (var line in infos)
                                {
                                    if (!string.IsNullOrEmpty(line))
                                    {
                                        var clean = line.Replace("\r", string.Empty).Replace("\n", string.Empty);
                                        var arr = clean.Split(';');

                                        if (arr.Length > 2)
                                        {
                                            if (arr[1] == "file" && arr[2] == m.path)
                                            {
                                                data.AppendLine(line + ";" + m.dimensions);
                                            }
                                            else
                                            {
                                                data.AppendLine(line);
                                            }
                                        }
                                        else
                                        {
                                            data.AppendLine(line);
                                        }
                                    }
                                }

                                System.IO.File.WriteAllText(f, data.ToString(), Encoding.UTF8);
                            }
                        }
                        catch (Exception)
                        {
                            throw;
                        }
                    }
                }
                else
                {
                    OptimizeABC(m.path);
                }
            }
        }

        public JsonResult OptimizeMedia()
        {
            OptimizeABC("/media");
            return Json(true);
        }

        public IActionResult CreateOrUpdateFolder(MediaItem media, int? u, bool isSystem = false)
        {
            if (isSystem)
            {
                if (!string.IsNullOrEmpty(media.path) &&
                    media.path.IndexOf("private", StringComparison.CurrentCulture) < 0)
                {
                    media.path += "/private";
                }
            }
            else
            {
                if (u.HasValue)
                {
                    if (string.IsNullOrEmpty(media.path))
                    {
                        var path = FileComponent.IdFolder("/media/agents", u.Value);
                        media.path = path;
                    }
                }
            }

            var folder = "";
            switch (media.type)
            {
                case "new":
                    folder = CreateFolder(media.path!, media.name);
                    break;

                case "rename":
                    folder = RenameFileOrFolder("folder", media.path!, media.name);
                    break;
            }

            return Json(folder);
        }

        [HttpPost]
        public IActionResult PostChunk(string fileCode, string type, int index, IFormFile chunk)
        {
            if (string.IsNullOrEmpty(fileCode))
            {
                return BadRequest("fileCode is required.");
            }

            if (chunk == null || chunk.Length == 0)
            {
                return BadRequest("Chunk is empty.");
            }

            fileCode = fileCode.Replace("\"", string.Empty);

            try
            {
                var path = MapPath($"/Content/temp_upload/{fileCode}_{index}.chunk");
                Directory.CreateDirectory(Path.GetDirectoryName(path)!);

                using (var fs = new FileStream(path, FileMode.Create, FileAccess.Write))
                {
                    chunk.CopyTo(fs);
                }
            }
            catch (Exception e)
            {
                return Json(e.Message);
            }

            return Json(fileCode);
        }

        public bool IsFullMedia(string path)
        {
            if (string.IsNullOrEmpty(path)) return false;

            var parts = path.Split('/');
            if (parts.Length < 2) return false;

            var media = parts[1];
            var isFull = false;

            foreach (var m in ConstantVariables.MediaConfigs)
            {
                if (m.name == media)
                {
                    isFull = m.isFull;
                    break;
                }
            }

            return isFull;
        }

        public IActionResult SaveChunksForUpload(SaveChunkModel model)
        {
            if (!string.IsNullOrEmpty(model.fileCode))
            {
                model.fileCode = model.fileCode.Replace("\"", string.Empty);
            }

            var file = FileComponent.DateFolder("/media/upload", null);
            var ext = Path.GetExtension(model.fileName).ToLower();
            file += "/" + model.fileCode + ext;

            var fp = FileComponent.GetFullPath(file);

            var dir = Path.GetDirectoryName(fp);
            if (!string.IsNullOrEmpty(dir) && !Directory.Exists(dir))
            {
                Directory.CreateDirectory(dir);
            }

            if (!System.IO.File.Exists(fp))
            {
                System.IO.File.Create(fp).Dispose();
            }

            if (model.count > 0)
            {
                for (int i = 0; i < model.count; i++)
                {
                    var chunk = MapPath($"/Content/temp_upload/{model.fileCode}_{i}.chunk");
                    MergeFiles(fp, chunk);
                }
            }

            var formats = new List<string> { ".jpg", ".jpeg", ".png", ".gif" };
            if (formats.Contains(ext))
            {
                FileComponent.ResizeBySizeConfig(file, "drop", new[] { "880x660", "375x250" });
            }

            if (model.CreateThumb && !string.IsNullOrEmpty(model.ThumbSize))
            {
                var arr = model.ThumbSize.Split(';').ToArray();
                FileComponent.ResizeBySizeConfig(file, model.ResizeType ?? "zoom", arr);
            }

            return Json(file);
        }

        public string RenameFileOrFolder(string type, string path, string name)
        {
            var fp = FileComponent.GetFullPath(path);
            var f = Path.Combine(Path.GetDirectoryName(fp) ?? string.Empty, "folder_info.txt");
            var infos = System.IO.File.ReadAllLines(f, Encoding.UTF8);
            var data = new StringBuilder();

            foreach (var line in infos)
            {
                if (!string.IsNullOrEmpty(line))
                {
                    var clean = line.Replace("\r", string.Empty).Replace("\n", string.Empty);
                    var arr = clean.Split(';');
                    if (arr.Length > 2)
                    {
                        if (arr[1] == type && arr[2] == path)
                        {
                            data.AppendLine(name + line.Substring(line.IndexOf(';')));
                        }
                        else
                        {
                            data.AppendLine(line);
                        }
                    }
                    else
                    {
                        data.AppendLine(line);
                    }
                }
            }

            System.IO.File.WriteAllText(f, data.ToString(), Encoding.UTF8);
            return path;
        }

        public IActionResult SaveChunksForLibrary(SaveChunkModel model)
        {
            if (!string.IsNullOrEmpty(model.fileCode))
            {
                model.fileCode = model.fileCode.Replace("\"", string.Empty);
            }

            if (string.IsNullOrEmpty(model.path))
            {
                model.path = "/media/drive";
            }

            if (model.path.EndsWith("/"))
            {
                model.path = model.path.Substring(0, model.path.Length - 1);
            }

            if (model.path.IndexOf("/media", StringComparison.Ordinal) != 0)
            {
                model.path = "/media" + model.path;
            }

            var folder = model.path;
            var ext = Path.GetExtension(model.fileName).ToLower();
            var file = folder + "/" + model.fileCode + ext;

            var outPath = FileComponent.GetFullPath(file);

            if (model.count > 0)
            {
                var rootFile = MapPath($"/Content/temp_upload/{model.fileCode}{Path.GetExtension(outPath)}");
                Directory.CreateDirectory(Path.GetDirectoryName(rootFile)!);

                for (int i = 0; i < model.count; i++)
                {
                    var chunk = MapPath($"/Content/temp_upload/{model.fileCode}_{i}.chunk");
                    MergeFiles(rootFile, chunk);
                }

                F.Move(rootFile, outPath);

                using (var image = Image.FromFile(outPath, true))
                {
                    var w = image.Width;
                    var h = image.Height;

                    if (w > 1024 || h > 1024)
                    {
                        FileComponent.ResizeBySizeConfig(file, "zoom", new[] { "1024x1024" });
                    }
                }

                FileComponent.ResizeBySizeConfig(file, "zoom", new[] { "400x180" });
                FileComponent.ResizeBySizeConfig(file, "drop", new[] { "880x660", "375x250" });
            }

            AddFolderInfo(folder!, new MediaItem
            {
                path = file,
                size = model.size,
                type = "file",
                name = model.fileName,
                dimensions = model.dimensions
            });

            return Json(file);
        }

        private static void MergeFiles(string newPath, string chunk)
        {
            try
            {
                using (var fs1 = System.IO.File.Open(newPath, FileMode.Append))
                using (var fs2 = System.IO.File.Open(chunk, FileMode.Open))
                {
                    byte[] fs2Content = new byte[fs2.Length];
                    fs2.Read(fs2Content, 0, (int)fs2.Length);
                    fs1.Write(fs2Content, 0, (int)fs2.Length);
                }

                if (System.IO.File.Exists(chunk))
                {
                    System.IO.File.Delete(chunk);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message + " : " + ex.StackTrace);
            }
        }

        // Kiem tra trinh duyet Wap, web
        public IActionResult GetMediaManagerModal(bool isMobile = false)
        {
            string browser = isMobile ? "Wap" : "Web";
            ViewData["Browser"] = browser;
            return PartialView("~/Views/Api/MediaManagerModal.cshtml");
        }

        [HttpPost]
        public JsonResult DeleteFiles(string[] paths)
        {
            foreach (var p in paths)
            {
                FileComponent.DeleteFile(p, true);
            }
            return Json(true);
        }

        [HttpPost]
        public JsonResult DeleteFolder(string path)
        {
            var temp = path.Substring(1);
            path = temp.Substring(temp.IndexOf('/') + 1);

            foreach (var media in ConstantVariables.MediaConfigs)
            {
                var mn = "media" + (media.id > 0 ? media.id + "" : "");
                FileComponent.DeleteFolder('/' + mn + '/' + path);
            }

            return Json(ErrorCode.None.ToString().ToLower());
        }

        [HttpPost]
        public JsonResult RenameFile(string path, string name)
        {
            RenameFileOrFolder("file", path, name);
            return Json(ErrorCode.None.ToString().ToLower());
        }

        [HttpPost]
        public IActionResult TempUpload(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return Json("");

            // 1. Tạo thư mục theo ngày giống hệt SaveChunksForUpload
            var dateFolder = $"/upload/{DateTime.Now:yyyy/MM/dd}";
            var fullDateFolder = FileComponent.DateFolder("/upload", null); 

            var ext = Path.GetExtension(file.FileName);
            var filename = DateTime.Now.ToString("yyyyMMdd_HHmmss_") +
                           StringComponent.Guid(8) +
                           ext.ToLower();

            var relativePath = fullDateFolder + "/" + filename;   // ví dụ: /media/upload/2025/11/19/20251119_143022_A1B2C3D4.jpg
            var physicalPath = FileComponent.GetFullPath(relativePath);

            // 3. Tạo thư mục nếu chưa có
            Directory.CreateDirectory(Path.GetDirectoryName(physicalPath)!);

            // 4. Lưu file
            using (var fs = new FileStream(physicalPath, FileMode.Create, FileAccess.Write))
                file.CopyTo(fs);

            // 5. (Tuỳ chọn) Nếu là ảnh thì tự động resize luôn như SaveChunksForUpload
            var imageExt = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            if (imageExt.Contains(ext.ToLower()))
                FileComponent.ResizeBySizeConfig(relativePath, "drop", new[] { "880x660", "375x250" });

            relativePath = "/media" + relativePath;

            return Json(relativePath);
        }

        public void AddFolderInfo(string folder, MediaItem media)
        {
            string t = media.type switch
            {
                "folder" => $"{media.name};folder;{media.path};none{Environment.NewLine}",
                "file" => $"{media.name};file;{media.path};{media.size};{media.dimensions}{Environment.NewLine}",
                _ => string.Empty
            };

            var info = FileComponent.GetFullPath(folder + "/folder_info.txt");
            if (!System.IO.File.Exists(info))
            {
                System.IO.File.Create(info).Dispose();
            }

            t += System.IO.File.ReadAllText(info, Encoding.UTF8);
            System.IO.File.WriteAllText(info, t, Encoding.UTF8);
        }

        public string? GetStoreFolderById(string path)
        {
            try
            {
                var fp = FileComponent.GetFullPath(path);
                var infoPath = Path.Combine(fp, "folder_info.txt");

                if (!System.IO.File.Exists(infoPath))
                {
                    System.IO.File.Create(infoPath).Dispose();
                }

                return path;
            }
            catch
            {
                return null;
            }
        }

        public void CreateDefaultAgent(int media, int id, string name)
        {
            var path = "/media" + (media > 0 ? media + "" : "") + "/agents/";
            path = FileComponent.IdFolder(path, id);
            var fp = FileComponent.GetFullPath(path);
            if (fp != null)
            {
                var src = FileComponent.GetFullPath("/media/default");

                name = name.ToCode().ToLower();

                if (System.IO.File.Exists(Path.Combine(src, "cover", "cover.jpg")) &&
                    !System.IO.File.Exists(Path.Combine(fp, "cover.jpg")))
                {
                    System.IO.File.Copy(Path.Combine(src, "cover", "cover.jpg"), Path.Combine(fp, "cover.jpg"));
                    FileComponent.ResizeBySizeConfig(path + "/cover.jpg", "zoom", new[] { "100x100" });
                }

                var avatarSrc = Path.Combine(src, "agents", name[0] + ".jpg");
                var avatarDest = Path.Combine(fp, "avatar.jpg");

                if (System.IO.File.Exists(avatarSrc) && !System.IO.File.Exists(avatarDest))
                {
                    System.IO.File.Copy(avatarSrc, avatarDest);
                    FileComponent.ResizeBySizeConfig(path + "/avatar.jpg", "zoom", new[] { "100x100" });
                }
            }
        }

        public string CreateFolder(string path, string name)
        {
            if (path.EndsWith("/"))
            {
                path = path[..^1];
            }

            var newFolder = path + "/" + StringComponent.Guid(6);
            var fp = FileComponent.GetFullPath(newFolder);
            if (!Directory.Exists(fp))
            {
                Directory.CreateDirectory(fp);
            }

            System.IO.File.Create(Path.Combine(fp, "folder_info.txt")).Dispose();

            AddFolderInfo(path, new MediaItem
            {
                type = "folder",
                name = name,
                path = newFolder
            });

            return newFolder;
        }

        [HttpPost]
        public IActionResult SaveBase64Image(string imgData, string imgType)
        {
            if (string.IsNullOrEmpty(imgData))
                return Json(false);

            // data:image/png;base64,xxxx
            var headerEnd = imgData.IndexOf(';');
            if (headerEnd < 0) return Json(false);

            var header = imgData.Substring(5, headerEnd - 5); // bỏ "data:"
            var parts = header.Split('/');
            var mimeExt = parts.Length == 2 ? parts[1].ToLower() : "";
            var ext = ".jpg";

            switch (mimeExt)
            {
                case "jpeg":
                case "jpg":
                    ext = ".jpg";
                    break;
                case "png":
                    ext = ".png";
                    break;
                case "gif":
                    ext = ".gif";
                    break;
            }

            var base64Index = imgData.IndexOf("base64,", StringComparison.CurrentCulture);
            if (base64Index < 0) return Json(false);

            var data = imgData.Substring(base64Index + "base64,".Length);
            byte[] bytes = Convert.FromBase64String(data);

            var path = FileComponent.DateFolder("/media/upload", null) + "/" + StringComponent.Guid(10) + ext;
            var fp = FileComponent.GetFullPath(path);

            using (MemoryStream ms = new MemoryStream(bytes))
            using (var img = Image.FromStream(ms))
            {
                img.Save(fp);
            }

            return Json(path);
        }
    }
}
