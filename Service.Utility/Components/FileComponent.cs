// FileComponent.cs (optimized static version for .NET 8)
using HtmlAgilityPack;
using Microsoft.AspNetCore.Http;
using Service.Utility.Variables;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;
using System.Text;

namespace Service.Utility.Components
{
    public class FileAttach
    {
        public string Name { get; set; }
        public string Path { get; set; }
    }

    public static class FileComponent
    {
        public static string _mediaRoot { get; set; } = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "media");

        private static readonly HttpClient _httpClient = new HttpClient();

        public static string DateFolder(string basePath, DateTime? date)
        {
            var now = date ?? DateTime.Now;
            if (!basePath.StartsWith("/"))
            {
                basePath = "/" + basePath;
            }
            if (basePath.EndsWith("/"))
            {
                basePath = basePath[..^1];
            }
            basePath += $"/{now:yyyy}/{now:MM}/{now:dd}";

            var fullPath = GetFullPath(basePath);
            Directory.CreateDirectory(fullPath);
            return basePath.Replace("\\", "/");
        }

        public static async Task<Image> GetImageFromUrl(string url)
        {
            var stream = await _httpClient.GetStreamAsync(url);
            return await Image.LoadAsync(stream);
        }

        public static async Task<string> SaveImageFromPostFileBase(IFormFile file, string oldImg = "")
        {
            var ext = Path.GetExtension(file.FileName);
            var path = Path.Combine(DateFolder("/media/upload", null).TrimStart('/'), Guid.NewGuid().ToString("N") + ext);
            var fullPath = Path.Combine(_mediaRoot, path);

            Directory.CreateDirectory(Path.GetDirectoryName(fullPath));

            if (!string.IsNullOrEmpty(oldImg))
            {
                var oldFullPath = Path.Combine(_mediaRoot, oldImg);
                if (File.Exists(oldFullPath))
                    File.Delete(oldFullPath);
            }

            using var stream = new FileStream(fullPath, FileMode.Create);
            await file.CopyToAsync(stream);

            return path.Replace("\\", "/");
        }

        public static async Task ResizeZoomExcess(Image img, int maxWidth, int maxHeight, string outPath)
        {
            img.Mutate(x => x.Resize(new ResizeOptions
            {
                Size = new Size(maxWidth, maxHeight),
                Mode = ResizeMode.Max
            }));
            await img.SaveAsync(outPath);
        }

        public static async Task ResizeCropExcess(Image img, int dstWidth, int dstHeight, string outPath)
        {
            img.Mutate(x => x.Resize(new ResizeOptions
            {
                Size = new Size(dstWidth, dstHeight),
                Mode = ResizeMode.Crop,
                Position = AnchorPositionMode.Center
            }));
            await img.SaveAsync(outPath);
        }

        public static async Task ResizeZoomByPath(string path, int maxWidth, int maxHeight, string fileName)
        {
            var inputPath = Path.Combine(_mediaRoot, path);
            if (!File.Exists(inputPath)) return;

            var thumbDir = inputPath + ".thumb";
            Directory.CreateDirectory(thumbDir);
            var ext = Path.GetExtension(path);
            var outPath = Path.Combine(thumbDir, fileName + ext);

            using var img = await Image.LoadAsync(inputPath);
            await ResizeZoomExcess(img, maxWidth, maxHeight, outPath);
        }

        public static Image Zoom(Image img, double ratio)
        {
            var newWidth = (int)(img.Width * ratio);
            var newHeight = (int)(img.Height * ratio);
            img.Mutate(x => x.Resize(newWidth, newHeight));
            return img;
        }

        public static void DeleteFile(string path, bool inLibrary)
        {
            var fullPath = Path.Combine(_mediaRoot, path);
            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
                var thumbDir = fullPath + ".thumb";
                if (Directory.Exists(thumbDir)) Directory.Delete(thumbDir, true);
            }
        }

        public static async Task<bool> IsValidImage(Stream imageStream)
        {
            try
            {
                var img = await Image.LoadAsync(imageStream);
                return img != null;
            }
            catch { return false; }
        }

        public static async Task ResizeBySizeConfig(string path, string resizeType, string[] sizes)
        {
            var inputPath = Path.Combine(_mediaRoot, path);
            if (!File.Exists(inputPath)) return;

            var thumbDir = inputPath + ".thumb";
            Directory.CreateDirectory(thumbDir);

            using var img = await Image.LoadAsync(inputPath);

            foreach (var size in sizes)
            {
                var parts = size.Split('x');
                if (parts.Length != 2) continue;
                var w = int.Parse(parts[0]);
                var h = int.Parse(parts[1]);
                var outPath = Path.Combine(thumbDir, size + Path.GetExtension(path));

                if (resizeType == "zoom")
                    await ResizeZoomExcess(img.Clone(x => { }), w, h, outPath);
                else
                    await ResizeCropExcess(img.Clone(x => { }), w, h, outPath);
            }
        }

        public static async Task OptimizeImageMaxSize(string path)
        {
            var inputPath = Path.Combine(_mediaRoot, path);
            if (!File.Exists(inputPath)) return;

            using var img = await Image.LoadAsync(inputPath);
            if (img.Width > 1920 || img.Height > 1080)
            {
                var outputPath = Path.Combine(Path.GetDirectoryName(inputPath), Guid.NewGuid().ToString("N") + Path.GetExtension(path));
                await ResizeZoomExcess(img.Clone(x => { }), 1920, 1080, outputPath);

                File.Delete(inputPath);
                File.Move(outputPath, inputPath);
            }
        }

        public static async Task<string> CropFile(string srcPath, int w, int h)
        {
            var inputPath = Path.Combine(_mediaRoot, srcPath);
            if (!File.Exists(inputPath)) return null;

            var path = Path.Combine(DateFolder("/upload", null).TrimStart('/'), Guid.NewGuid().ToString("N") + Path.GetExtension(srcPath));
            var outputPath = Path.Combine(_mediaRoot, path);

            using var img = await Image.LoadAsync(inputPath);
            await ResizeCropExcess(img, w, h, outputPath);

            return path.Replace("\\", "/");
        }
        public static string SaveDetailImages(string d, string code, string folder, string url)
        {
            var beforeD = d;

            var doc = new HtmlDocument();
            doc.LoadHtml(d);

            if (string.IsNullOrWhiteSpace(folder))
            {
                folder = "upload";
            }

            var imgDoms = doc.DocumentNode.SelectNodes("//img");
            if (imgDoms != null)
            {
                foreach (var imgDom in imgDoms)
                {
                    var src = imgDom.GetAttributeValue("src", "");
                    if (!string.IsNullOrWhiteSpace(src))
                    {
                        var path = DateFolder("/media/" + folder, null) + "/" + code + "-" + Guid.NewGuid();
                        string ext;

                        if (src.StartsWith("data:image"))
                        {
                            ext = GetImageExtensionFromBase64(src);
                            var imgData = src.Substring(src.IndexOf("base64,", StringComparison.OrdinalIgnoreCase) + 7);
                            byte[] bytes = Convert.FromBase64String(imgData);

                            path += ext;
                            var fullPath = Path.Combine(_mediaRoot, path.TrimStart('/').Replace("/", Path.DirectorySeparatorChar.ToString()));

                            Directory.CreateDirectory(Path.GetDirectoryName(fullPath)!);

                            using (var ms = new MemoryStream(bytes))
                            {
                                using (var image = Image.Load(ms))
                                {
                                    image.Save(fullPath);
                                }
                            }

                            var urlSrc = !string.IsNullOrWhiteSpace(url) ? url + path : path;
                            beforeD = beforeD.Replace($"src=\"{src}", $"src=\"{urlSrc}");
                        }
                        else if (src.StartsWith("http", StringComparison.OrdinalIgnoreCase))
                        {
                            if (string.IsNullOrWhiteSpace(url) || !src.Contains(url))
                            {
                                ext = Path.GetExtension(src);
                                if (ext.Contains("?"))
                                {
                                    ext = ext[..ext.IndexOf("?")];
                                }

                                if (string.IsNullOrWhiteSpace(ext))
                                    ext = ".jpg";

                                path += ext;

                                var fullPath = Path.Combine(_mediaRoot, path.TrimStart('/').Replace("/", Path.DirectorySeparatorChar.ToString()));
                                Directory.CreateDirectory(Path.GetDirectoryName(fullPath)!);

                                using (var client = new HttpClient())
                                {
                                    var imageBytes = client.GetByteArrayAsync(src).Result;
                                    File.WriteAllBytes(fullPath, imageBytes);
                                }

                                var urlSrc = !string.IsNullOrWhiteSpace(url) ? url + path : path;
                                beforeD = beforeD.Replace($"src=\"{src}", $"src=\"{urlSrc}");
                            }
                        }
                    }
                }
            }
            return beforeD;
        }
        private static string GetImageExtensionFromBase64(string base64)
        {
            if (base64.StartsWith("data:image/jpeg")) return ".jpg";
            if (base64.StartsWith("data:image/png")) return ".png";
            if (base64.StartsWith("data:image/gif")) return ".gif";
            return ".jpg";
        }
        public static async Task<string> SaveImageFromUrl(string url, string path, bool async, bool optimizeSize)
        {
            var outputPath = Path.Combine(_mediaRoot, path);

            try
            {
                var data = await _httpClient.GetByteArrayAsync(url);
                using var ms = new MemoryStream(data);
                var img = await Image.LoadAsync(ms);
                if (optimizeSize)
                    await ResizeZoomExcess(img, 1024, 1024, outputPath);
                else
                    await img.SaveAsync(outputPath);

                return path;
            }
            catch
            {
                return "";
            }
        }

        public static bool IsValidImage(string path)
        {
            string[] validExtensions = { ".jpg", ".bmp", ".gif", ".png", ".jpeg" };
            var ext = Path.GetExtension(path);
            return validExtensions.Contains(ext);
        }

        public static Image<Rgba32> Base64ToImage(string base64String)
        {
            if (base64String.Contains("base64,"))
            {
                base64String = base64String[(base64String.IndexOf("base64,") + 7)..];
            }
            // Xử lý chuỗi nếu có tiền tố "data:image/png;base64,..."
            var base64Data = base64String.Contains(",")
                ? base64String.Substring(base64String.IndexOf(",") + 1)
                : base64String;

            byte[] imageBytes = Convert.FromBase64String(base64Data);

            using var ms = new MemoryStream(imageBytes);
            var image = Image.Load<Rgba32>(ms); // Load đồng bộ

            return image;
        }

        public static string GetFullPath(string relativePath)
        {
            return Path.Combine(_mediaRoot, relativePath.TrimStart('/').Replace("/", Path.DirectorySeparatorChar.ToString()));
        }

        public static List<MediaItem> GetFileAndFolders(string path, string type)
        {
            var result = new List<MediaItem>();
            path = path + "/folder_info.txt";
            var fp = GetFullPath(path);
            if (File.Exists(fp))
            {
                var lines = File.ReadAllLines(fp);
                foreach (var l in lines)
                {
                    var line = l;
                    if (!string.IsNullOrEmpty(line))
                    {
                        line = line.Replace("\n", string.Empty).Replace("\r", string.Empty).ToString();
                        var arr = line.Split(';');
                        if (arr.Length > 2)
                        {
                            if (string.IsNullOrEmpty(type) || type == arr[1])
                            {
                                if (arr[1] == "folder")
                                {
                                    result.Add(new MediaItem
                                    {
                                        name = arr[0],
                                        type = "folder",
                                        path = arr[2],
                                        share_status = arr[3]
                                    });
                                }
                                else
                                {
                                    result.Add(new MediaItem
                                    {
                                        name = arr[0],
                                        type = "file",
                                        path = arr[2],
                                        size = arr[3],
                                        dimensions = arr.Length == 5 ? arr[4] : ""
                                    });
                                }
                            }
                        }
                    }
                }
                return result;
            }
            File.Create(fp).Dispose();
            return result;
        }

        public static string IdFolder(string path, int id)
        {
            if (!path.StartsWith("/"))
            {
                path = "/" + path;
            }
            if (!path.EndsWith("/"))
            {
                path += "/";
            }
            var fp = "";
            if (id > 100)
            {
                var idstr = id + "";
                var i = 1;
                while (i < idstr.Length - 1)
                {
                    path += idstr.Substring(0, i) + "/";
                    fp = GetFullPath(path);
                    if (!Directory.Exists(fp))
                    {
                        Directory.CreateDirectory(fp);
                    }
                    i++;
                }
            }

            path += id + "/";
            fp = GetFullPath(path);
            if (!Directory.Exists(fp))
            {
                Directory.CreateDirectory(fp);
            }
            return path;
        }
        public static ErrorCode DeleteFolder(string path)
        {
            var fp = GetFullPath(path);

            if (!Directory.Exists(fp))
            {
                return ErrorCode.ObjectIsNotFound;
            }

            // Xóa thư mục (bao gồm file con, thư mục con)
            Directory.Delete(fp, recursive: true);

            // Update folder_info.txt
            var folder = Path.GetDirectoryName(fp);
            if (string.IsNullOrEmpty(folder))
            {
                return ErrorCode.None; // không có folder cha thì thôi
            }

            var folderInfoPath = Path.Combine(folder, "folder_info.txt");
            if (!File.Exists(folderInfoPath))
            {
                return ErrorCode.None; // không có file info thì thôi
            }

            var infos = File.ReadAllLines(folderInfoPath, Encoding.UTF8);
            var data = new StringBuilder();

            foreach (var line in infos)
            {
                if (string.IsNullOrWhiteSpace(line))
                {
                    data.AppendLine(); // giữ dòng trống
                    continue;
                }

                var arr = line.Split(';');
                if (arr.Length > 2)
                {
                    // chỉ loại bỏ khi đúng là folder + path
                    if (arr[1] == "folder" && arr[2] == path)
                    {
                        continue; // bỏ qua
                    }
                }

                data.AppendLine(line);
            }

            File.WriteAllText(folderInfoPath, data.ToString(), Encoding.UTF8);

            return ErrorCode.None;
        }
    }
}
