using System;
using System.Collections.Generic;
using System.IO;

namespace Service.Core.Variables
{
    public static class ConstantVariables
    {
        public static string DefaultMedia { get; set; }
        public static string BundleVersion { get; set; }
        public static void InitConstantData(string root)
        {
            BundleVersion = DateTime.Now.ToString("ddMMyyyyHmm");
            //var path = Directory.GetParent(Directory.GetParent(root).ToString()).FullName; 
            var path = root + "media\\"; 
            DefaultMedia = path.Replace("\\", "/");
        }

        public static List<MediaItem> MediaConfigs => new List<MediaItem>
        {
            new MediaItem {id = 0, name = "media", path = "", isFull = false},
            //new Media {name = "media", path = "C:/tfs/BDS/SGD/SGD/media/", state = ""},
            //new Media {id = 1,name = "media1", path = "D:/WebMedias/xemgia/", state = "full"}
        };


    }
}