using DBContext.BMWindows.Entities;
using Service.Utility.Components;
using Service.Utility.Variables;
using System;

namespace Service.BMWindows.Executes.AppItem
{
    public class SearchAppItemModel
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Status { get; set; }
        public string? Keyword { get; set; }
        public int CategoryId { get; set; }
        public int Prioritize { get; set; }
        public Guid CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public Guid? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }

        public DateTime? CreatedDateFrom { get; set; }
        public DateTime? CreatedDateTo { get; set; }
        public DateTime? UpdatedDateFrom { get; set; }
        public DateTime? UpdatedDateTo { get; set; }
    }

    public class AppItemViewModel : DBContext.BMWindows.Entities.AppItem
    {
        public BaseItem? ObjCategory { get; set; }
    }

    public class AppItemEditModel : DBContext.BMWindows.Entities.AppItem
    {
    }
}