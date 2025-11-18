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
        /// <summary>
        /// Tạo mới Category
        /// </summary>
        public async Task<CommandResult<DBContext.BMWindows.Entities.Category>> CreateCategory(CategoryEditModel model)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(model.Name))
                {
                    return new CommandResult<DBContext.BMWindows.Entities.Category>("Tên nhóm không trống");
                }


                // Tạo Category mới
                var d = new DBContext.BMWindows.Entities.Category
                {
                    Name = model.Name.Trim(),
                    Prioritize = model.Prioritize,
                    Status = model.Status,
                    CreatedBy = Guid.Empty,
                    CreatedDate = DateTime.UtcNow,
                    UpdatedBy = null,
                    UpdatedDate = null,
                };

                Context.Categories.Add(d);
                await Context.SaveChangesAsync();

                return new CommandResult<DBContext.BMWindows.Entities.Category>(d);
            }
            catch (Exception ex)
            {
                var innerMsg = ex.InnerException != null ? " | Inner: " + ex.InnerException.Message : "";
                return new CommandResult<DBContext.BMWindows.Entities.Category>("L?i: " + ex.Message + innerMsg);
            }
        }

        /// <summary>
        /// Cập nhật Category với logic tự động đẩy Prioritize các Category khác
        /// </summary>
        public async Task<CommandResult<DBContext.BMWindows.Entities.Category>> EditCategory(CategoryEditModel model)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(model.Name))
                {
                    return new CommandResult<DBContext.BMWindows.Entities.Category>("Tên nhóm không được để trống");
                }

                var d = await Context.Categories.FirstOrDefaultAsync(x => x.Id == model.Id);
                if (d == null)
                {
                    return new CommandResult<DBContext.BMWindows.Entities.Category>("Không tìm thấy nhóm ứng dụng: " + model.Id);
                }

                d.Name = model.Name.Trim();
                d.Prioritize = model.Prioritize;
                d.Status = model.Status;
                d.UpdatedDate = DateTime.UtcNow;

                await Context.SaveChangesAsync();

                return new CommandResult<DBContext.BMWindows.Entities.Category>(d);
            }
            catch (Exception ex)
            {
                var innerMsg = ex.InnerException != null ? " | Inner: " + ex.InnerException.Message : "";
                return new CommandResult<DBContext.BMWindows.Entities.Category>("Lỗi: " + ex.Message + innerMsg);
            }
        }
    }
}