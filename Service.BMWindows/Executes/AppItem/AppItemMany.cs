using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Service.BMWindows.Executes.AppItem;
using Service.Utility.Components;
using Service.Utility.Variables;

namespace Service.BMWindows.Executes.Base
{
    public partial class AppItemService
    {
        public async Task<QueryResult<AppItemViewModel>> AppItemMany(SearchAppItemModel model, OptionResult option)
        {
            var query = Context.AppItems.AsQueryable();

            // Filter by keyword
            if (!string.IsNullOrWhiteSpace(model.Keyword))
            {
                query = query.Where(x => x.Name.Contains(model.Keyword) || 
                                        (x.Keyword != null && x.Keyword.Contains(model.Keyword)));
            }

            // Filter by CategoryId
            if (model.CategoryId.HasValue && model.CategoryId.Value > 0)
            {
                query = query.Where(x => x.CategoryId == model.CategoryId.Value);
            }

            // Filter by Status
            if (model.Status.HasValue)
            {
                query = query.Where(x => x.Status == model.Status.Value);
            }

            var result = new QueryResult<AppItemViewModel>(option);

            result.Count = await query.CountAsync();

            // Order by Prioritize, then by Id
            var r = query
                .OrderBy(x => x.Prioritize)
                .ThenBy(x => x.Id)
                .Select(x => new AppItemViewModel
                {
                    Id = x.Id,
                    CategoryId = x.CategoryId,
                    CategoryName = Context.Categories.Where(c => c.Id == x.CategoryId).Select(c => c.Name).FirstOrDefault() ?? "",
                    Name = x.Name,
                    Icon = x.Icon,
                    Size = x.Size,
                    Url = x.Url,
                    Status = x.Status,
                    Keyword = x.Keyword,
                    Prioritize = x.Prioritize,
                    CreatedDate = x.CreatedDate,
                    CreatedBy = "Administrator", // TODO: Get from User table
                    UpdatedDate = x.UpdatedDate,
                    UpdatedBy = "Administrator" // TODO: Get from User table
                });

            result.Many = await r.Skip(result.Skip).Take(result.Take).ToListAsync();

            return result;
        }
    }
}
