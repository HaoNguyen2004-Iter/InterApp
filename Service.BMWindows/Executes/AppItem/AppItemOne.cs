using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Service.BMWindows.Executes.AppItem;

namespace Service.BMWindows.Executes.Base
{
    public partial class AppItemService
    {
        public async Task<AppItemViewModel?> AppItemOne(int id)
        {
            var item = await Context.AppItems
                .Where(x => x.Id == id)
                .Select(x => new AppItemViewModel
                {
                    Id = x.Id,
                    CategoryId = x.CategoryId,
                    CategoryName = Context.Categories.Where(c => c.Id == x.CategoryId).Select(c => c.Name).FirstOrDefault() ?? "",
                    Name = x.Name,
                    Icon = x.Icon,
                    Url = x.Url,
                    Status = x.Status,
                    Keyword = x.Keyword,
                    Prioritize = x.Prioritize,
                    CreatedDate = x.CreatedDate,
                    CreatedBy = x.CreatedBy,     
                    UpdatedDate = x.UpdatedDate,
                    UpdatedBy = x.UpdatedBy      
                })
                .FirstOrDefaultAsync();

            return item;
        }
    }
}