using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Service.BMWindows.Executes.AppItem;
using Service.Utility.Components;
using Service.Utility.Variables;

namespace Service.BMWindows.Executes.Base
{
    public partial class CategoryService
    {
        public async Task<AppItemViewModel> AppItemOne(int Id)
        {
            var appEntity = await Context.AppItems.Where(x => x.Id == Id && x.Status >= 0).FirstOrDefaultAsync();

            AppItemViewModel item = null;

            item = new AppItemViewModel
            {
                Id = appEntity.Id,
                CategoryId = appEntity.CategoryId,
                Name = appEntity.Name,
                Icon = appEntity.Icon,
                Size = appEntity.Size,
                Url = appEntity.Url,
                Status = appEntity.Status,
                Keyword = appEntity.Keyword,
                Prioritize = appEntity.Prioritize,
                CreatedBy = appEntity.CreatedBy,
                CreatedDate = appEntity.CreatedDate,
                UpdatedBy = appEntity.UpdatedBy,
                UpdatedDate = appEntity.UpdatedDate,
                ObjCategory = await Context.Categories.Where(c => c.Id == appEntity.CategoryId)
                                .Select(c => new BaseItem { Id = c.Id, Name = c.Name }).FirstOrDefaultAsync()
            };

            return item;
        }
    }
}