using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Service.BMWindows.Executes.Category;
using Service.Utility.Components;
using Service.Utility.Variables;

namespace Service.BMWindows.Executes.Base
{
    public partial class CategoryService
    {

        public async Task<QueryResult<CategoryViewModel>> CategoryMany(SearchCategoryModel model, OptionResult optionResult)
        {
            return await CategoryData(model, optionResult);
        }

        private async Task<QueryResult<CategoryViewModel>> CategoryData(SearchCategoryModel model, OptionResult optionResult)
        {
            if (model == null) model = new SearchCategoryModel();

            IQueryable<DBContext.BMWindows.Entities.Category> q = Context.Categories.Where(x => x.Status >= 0);

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

            if (model.Status.HasValue)
                q = q.Where(x => x.Status == model.Status.Value);

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

            var result = new QueryResult<CategoryViewModel>(optionResult);

            result.Count = await q.CountAsync();

            var r = q.Select(x => new CategoryViewModel
            {
                Id = x.Id,
                Name = x.Name,
                Keyword = x.Keyword,
                Status = x.Status,
                CreatedBy = x.CreatedBy,
                CreatedDate = x.CreatedDate,
                UpdatedBy = x.UpdatedBy,
                UpdatedDate = x.UpdatedDate,
                Prioritize = x.Prioritize
            });

            r = r.OrderBy(x => x.Prioritize);

            result.Many = await r.Skip(result.Skip).Take(result.Take).ToListAsync();

            return result;
        }
    }
}