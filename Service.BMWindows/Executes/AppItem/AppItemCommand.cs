using System;
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
        public async Task<CommandResult<DBContext.BMWindows.Entities.AppItem>> CreateAppItem(AppItemEditModel model)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(model.Name))
                {
                    return new CommandResult<DBContext.BMWindows.Entities.AppItem>("Tên ứng dụng không được để trống");
                }

                if (model.CategoryId <= 0)
                {
                    return new CommandResult<DBContext.BMWindows.Entities.AppItem>("Vui lòng chọn nhóm ứng dụng");
                }

                int prioritize = model.Prioritize;
                if (prioritize <= 0)
                {
                    var maxPrioritize = await Context.AppItems.MaxAsync(c => (int?)c.Prioritize);
                    prioritize = (maxPrioritize ?? 0) + 1;
                }

                var item = new DBContext.BMWindows.Entities.AppItem
                {
                    CategoryId = model.CategoryId,
                    Name = model.Name.Trim(),
                    Icon = model.Icon,
                    Url = model.Url,
                    Status = model.Status,
                    Keyword = model.Keyword,
                    Prioritize = prioritize,
                    CreatedDate = DateTime.UtcNow,
                    CreatedBy = Guid.Empty,
                    UpdatedDate = DateTime.UtcNow,
                    UpdatedBy = Guid.Empty
                };

                Context.AppItems.Add(item);
                await Context.SaveChangesAsync();

                return new CommandResult<DBContext.BMWindows.Entities.AppItem>(item);
            }
            catch (Exception ex)
            {
                var innerMsg = ex.InnerException != null ? " | Inner: " + ex.InnerException.Message : "";
                return new CommandResult<DBContext.BMWindows.Entities.AppItem>("Lỗi: " + ex.Message + innerMsg);
            }
        }

        public async Task<CommandResult<DBContext.BMWindows.Entities.AppItem>> EditAppItem(AppItemEditModel model)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(model.Name))
                {
                    return new CommandResult<DBContext.BMWindows.Entities.AppItem>("Tên ứng dụng không được để trống");
                }

                if (model.CategoryId <= 0)
                {
                    return new CommandResult<DBContext.BMWindows.Entities.AppItem>("Vui lòng chọn nhóm ứng dụng");
                }

                var item = await Context.AppItems.FirstOrDefaultAsync(x => x.Id == model.Id);
                if (item == null)
                {
                    return new CommandResult<DBContext.BMWindows.Entities.AppItem>("Không tìm thấy ứng dụng: " + model.Id);
                }

                item.CategoryId = model.CategoryId;
                item.Name = model.Name.Trim();
                item.Icon = model.Icon;
                item.Url = model.Url;
                item.Status = model.Status;
                item.Keyword = model.Keyword;
                item.Prioritize = model.Prioritize;
                item.UpdatedDate = DateTime.UtcNow;
                item.UpdatedBy = Guid.Empty;

                await Context.SaveChangesAsync();

                return new CommandResult<DBContext.BMWindows.Entities.AppItem>(item);
            }
            catch (Exception ex)
            {
                var innerMsg = ex.InnerException != null ? " | Inner: " + ex.InnerException.Message : "";
                return new CommandResult<DBContext.BMWindows.Entities.AppItem>("Lỗi: " + ex.Message + innerMsg);
            }
        }
    }
}
