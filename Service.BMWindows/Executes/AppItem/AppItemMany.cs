using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Service.BMWindows.Executes.AppItem;
using Service.Utility.Components;
using Service.Utility.Variables;

namespace Service.BMWindows.Executes.Base
{
    public partial class CategoryService
    {
        public async Task<QueryResult<AppItemViewModel>> AppItemMany(SearchAppItemModel model, OptionResult optionResult)
        {
            return await AppItemData(model, optionResult);
        }

        private async Task<QueryResult<AppItemViewModel>> AppItemData(SearchAppItemModel model, OptionResult optionResult)
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

            if (model.Status >= 0)
                q = q.Where(x => x.Status == model.Status);

            if (model.CategoryId > 0)
                q = q.Where(x => x.CategoryId == model.CategoryId);

            if (model.CreatedBy != Guid.Empty)
                q = q.Where(x => x.CreatedBy == model.CreatedBy);

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

            var result = new QueryResult<AppItemViewModel>(optionResult);

            result.Count = await q.CountAsync();

            // join to get category basic info if available
            var r = from x in q
                    join c in Context.Categories on x.CategoryId equals c.Id into cj
                    from c in cj.DefaultIfEmpty()
                    select new AppItemViewModel
                    {
                        Id = x.Id,
                        CategoryId = x.CategoryId,
                        Name = x.Name,
                        Icon = x.Icon,
                        Size = x.Size,
                        Url = x.Url,
                        Status = x.Status,
                        Keyword = x.Keyword,
                        Prioritize = x.Prioritize,
                        CreatedBy = x.CreatedBy,
                        CreatedDate = x.CreatedDate,
                        UpdatedBy = x.UpdatedBy,
                        UpdatedDate = x.UpdatedDate,
                        ObjCategory = c != null ? new BaseItem { Id = c.Id, Name = c.Name } : null
                    };

            r = r.OrderBy(x => x.Id);

            result.Many = await r.Skip(result.Skip).Take(result.Take).ToListAsync();

            return result;
        }
    }
}