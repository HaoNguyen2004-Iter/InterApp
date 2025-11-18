using DocumentFormat.OpenXml.Wordprocessing;
using Microsoft.EntityFrameworkCore;
using Service.BMWindows.Executes.Category;
using Service.Utility.Components;
using Service.Utility.Variables;

namespace Service.BMWindows.Executes.Base
{
    public partial class CategoryService
    {
        public async Task<CategoryViewModel> CategoryOne(int Id)
        {
            var categoryEntity = await Context.Categories.Where(x => x.Id == Id && x.Status >= 0).FirstOrDefaultAsync();
            if (categoryEntity == null)
            {
                return null; // Trả về null ngay lập tức nếu không tìm thấy
            }

            CategoryViewModel item = null;

            item = new CategoryViewModel
            {
                Id = categoryEntity.Id,
                Name = categoryEntity.Name,
                Prioritize = categoryEntity.Prioritize,
                Status = categoryEntity.Status,
                CreatedBy = categoryEntity.CreatedBy,
                CreatedDate = categoryEntity.CreatedDate,
                UpdatedBy = categoryEntity.UpdatedBy,
                UpdatedDate = categoryEntity.UpdatedDate,
            };

            return item;


        }
    }
}
