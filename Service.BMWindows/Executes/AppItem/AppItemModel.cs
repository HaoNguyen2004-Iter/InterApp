using Service.Utility.Variables;
using System;

namespace Service.BMWindows.Executes.AppItem
{
    /// <summary>
    /// Model ð? search AppItem
    /// </summary>
    public class SearchAppItemModel
    {
        public string? Keyword { get; set; }
        public int? CategoryId { get; set; }
        public int? Status { get; set; }
    }

    /// <summary>
    /// ViewModel ð? hi?n th? thông tin AppItem
    /// </summary>
    public class AppItemViewModel
    {
        public int Id { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = "";
        public string Name { get; set; } = "";
        public string? Icon { get; set; }
        public string? Size { get; set; }
        public string? Url { get; set; }
        public int Status { get; set; }
        public string? Keyword { get; set; }
        public int Prioritize { get; set; }
        public DateTime CreatedDate { get; set; }
        public string CreatedBy { get; set; } = "";
        public DateTime? UpdatedDate { get; set; }
        public string? UpdatedBy { get; set; }
    }

    /// <summary>
    /// Model ð? thêm/s?a AppItem
    /// </summary>
    public class AppItemEditModel
    {
        public int Id { get; set; }
        public int CategoryId { get; set; }
        public string Name { get; set; } = "";
        public string? Icon { get; set; }
        public string? Size { get; set; }
        public string? Url { get; set; }
        public int Status { get; set; } = (int)ObjectStatus.Active;
        public string? Keyword { get; set; }
        public int Prioritize { get; set; }
    }
}
