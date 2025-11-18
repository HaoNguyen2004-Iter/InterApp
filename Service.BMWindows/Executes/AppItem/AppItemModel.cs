using System;
using System.Text.Json.Serialization;
using Service.Utility.Components;
using Service.Utility.Variables;

namespace Service.BMWindows.Executes.AppItem
{

    public class SearchAppItemModel
    {
        public int Id { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = "";
        public string? Icon { get; set; }
        public string Name { get; set; } = "";
        public string? Size { get; set; }
        public string? Url { get; set; }
        public int? Status { get; set; }
        public string? Keyword { get; set; }
        public int Prioritize { get; set; }
        public DateTime CreatedDate { get; set; }
        public string CreatedBy { get; set; } = "";
        public DateTime? UpdatedDate { get; set; }
        public string? UpdatedBy { get; set; }

        public DateTime? CreatedDateFrom { get; set; }
        public DateTime? CreatedDateTo { get; set; }
        public DateTime? UpdatedDateFrom { get; set; }
        public DateTime? UpdatedDateTo { get; set; }
    }

    public class AppItemViewModel : DBContext.BMWindows.Entities.AppItem
    {
        public BaseItem? ObjOrganization { get; set; }

        public string CategoryName { get; set; } = "";

        [JsonPropertyName("iconObj")]
        public Icon? IconObj { get; set; }
    }

    public class Icon
    {
        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("path")]
        public string Path { get; set; }

        [JsonPropertyName("type")]
        public string Type { get; set; }

        [JsonPropertyName("size")]
        public string Size { get; set; }

        public string Code
        {
            get
            {
                if (Path.HasValue())
                {
                    var fn = System.IO.Path.GetFileNameWithoutExtension(Path);
                    return fn;
                }
                return "";
            }
        }
    }
    public class AppItemEditModel : DBContext.BMWindows.Entities.AppItem
    {
        [JsonPropertyName("iconObj")]
        public Icon? IconObj { get; set; }
    }
}