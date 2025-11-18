using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Service.BMWindows.Executes.AppItem;
using Service.BMWindows.Executes.Category;
using Service.Utility.Components;
using Service.Utility.Variables;

namespace Service.BMWindows.Executes.Base
{
    public partial class AppItemService
    {
        public async Task<QueryResult<AppItemViewModel>> AppItemMany(SearchAppItemModel model, OptionResult option)
        {
           return await AppItemData(model, option);
        }

        public async Task<QueryResult<AppItemViewModel>> AppItemData(SearchAppItemModel model, OptionResult option)
        {
            if (model == null) model = new SearchAppItemModel();

            IQueryable<DBContext.BMWindows.Entities.AppItem> q = Context.AppItems.Where(x => x.Status >= 0);

            if (model.Id > 0)
                q = q.Where(x => x.Id == model.Id);

            if (!string.IsNullOrEmpty(model.Keyword))
            {
                var k = model.Keyword.OptimizeKeyword();
                q = q.Where(x =>
                    (x.Name != null && x.Name.Contains(k)) ||
                    (x.Keyword != null && x.Keyword.Contains(k)));
            }

            if (!string.IsNullOrEmpty(model.Name))
            {
                var k = model.Name.OptimizeKeyword();
                q = q.Where(x => x.Name != null && x.Name.Contains(k));
            }

            if (model.CategoryId > 0)
                q = q.Where(x => x.CategoryId == model.CategoryId);

            if (model.Status.HasValue)
                q = q.Where(x => x.Status == model.Status.Value);

            if (!string.IsNullOrEmpty(model.CreatedBy) && Guid.TryParse(model.CreatedBy, out var cb))
            {
                q = q.Where(x => x.CreatedBy == cb);
            }

            if (model.CreatedDateFrom.HasValue)
                q = q.Where(x => x.CreatedDate >= model.CreatedDateFrom.Value);

            if (model.CreatedDateTo.HasValue)
            {
                var td = model.CreatedDateTo.Value.Date.AddDays(1).AddTicks(-1);
                q = q.Where(x => x.CreatedDate <= td);
            }

            if (model.UpdatedDateFrom.HasValue)
                q = q.Where(x => x.UpdatedDate >= model.UpdatedDateFrom.Value);

            if (model.UpdatedDateTo.HasValue)
            {
                var td = model.UpdatedDateTo.Value.Date.AddDays(1).AddTicks(-1);
                q = q.Where(x => x.UpdatedDate <= td);
            }

            if (model.Prioritize > 0)
                q = q.Where(x => x.Prioritize == model.Prioritize);

            var result = new QueryResult<AppItemViewModel>(option);

            result.Count = await q.CountAsync();

            var r = q.Select(x => new AppItemViewModel
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
                CreatedBy = x.CreatedBy,
                UpdatedDate = x.UpdatedDate,
                UpdatedBy = x.UpdatedBy
            });

            r = r.OrderBy(x => x.Prioritize).ThenBy(x => x.Id);

            result.Many = await r.Skip(result.Skip).Take(result.Take).ToListAsync();

            return result;
        }
    }
}