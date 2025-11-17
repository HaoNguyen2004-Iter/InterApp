using DBContext.BMWindows.Entities;
using Service.BMWindows.Executes;
using Service.Utility.Components;
using Service.Utility.Variables;
using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Service.BMWindows.Executes.Category
{
    public class SearchCategoryModel
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public int Status { get; set; }
        public string? Keyword { get; set; }
        public Guid CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public Guid? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public int Prioritize { get; set; }

        public DateTime? CreatedDateFrom { get; set; }
        public DateTime? CreatedDateTo { get; set; }
        public DateTime? UpdatedDateFrom { get; set; }
        public DateTime? UpdatedDateTo { get; set; }
    }

    public class CategoryViewModel : DBContext.BMWindows.Entities.Category
    {
        public BaseItem? ObjOrganization { get; set; }
    }

    public class CategoryEditModel : DBContext.BMWindows.Entities.Category
    {

    }

}
