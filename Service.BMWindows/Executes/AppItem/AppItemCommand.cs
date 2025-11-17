using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Service.BMWindows.Executes.AppItem;
using Service.Utility.Components;
using Service.Utility.Variables;

namespace Service.BMWindows.Executes.Base
{
    public partial class CategoryService
    {
        public async Task<CommandResult<DBContext.BMWindows.Entities.AppItem>> CreateAppItem(AppItemEditModel model)
        {
            try
            {
                var d = new DBContext.BMWindows.Entities.AppItem
                {
                    CategoryId = model.CategoryId,
                    Name = model.Name,
                    Icon = model.Icon,
                    Size = model.Size,
                    Url = model.Url,
                    Status = 1,
                    Keyword = model.Keyword,
                    Prioritize = model.Prioritize,
                    CreatedBy = model.CreatedBy,
                    CreatedDate = model.CreatedDate,
                    UpdatedBy = model.UpdatedBy,
                    UpdatedDate = model.UpdatedDate,
                };

                Context.AppItems.Add(d);
                await Context.SaveChangesAsync();
                return new CommandResult<DBContext.BMWindows.Entities.AppItem>(d);
            }
            catch (Exception ex)
            {
                return new CommandResult<DBContext.BMWindows.Entities.AppItem>(ex.Message);
            }
        }

        public async Task<CommandResult<DBContext.BMWindows.Entities.AppItem>> EditAppItem(AppItemEditModel model)
        {
            var d = await Context.AppItems.FirstOrDefaultAsync(x => x.Id == model.Id);
            if (d == null)
                return new CommandResult<DBContext.BMWindows.Entities.AppItem>("Không tìm thấy ứng dụng: " + model.Id);

            d.CategoryId = model.CategoryId;
            d.Name = model.Name;
            d.Icon = model.Icon;
            d.Size = model.Size;
            d.Url = model.Url;
            d.Status = model.Status;
            d.Keyword = model.Keyword;
            d.Prioritize = model.Prioritize;
            d.UpdatedBy = model.UpdatedBy;
            d.UpdatedDate = System.DateTime.UtcNow;

            await Context.SaveChangesAsync();
            return new CommandResult<DBContext.BMWindows.Entities.AppItem>(d);
        }
    }
}