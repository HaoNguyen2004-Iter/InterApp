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

                int prioritize = model.Prioritize;

                // Nếu không nhập số ưu tiên (0), tự động lấy số tiếp theo
                if (prioritize <= 0)
                {
                    var maxPrioritize = await Context.Categories.MaxAsync(c => (int?)c.Prioritize);
                    prioritize = (maxPrioritize ?? 0) + 1;
                }
                else
                {
                    // Kiểm tra xem có Category nào đang dùng số ưu tiên này không
                    var exists = await Context.Categories.AnyAsync(c => c.Prioritize == prioritize);

                    if (exists)
                    {
                        // Tự đông đẩy các Category có Prioritize >= prioritize lên +1
                        var categoriesToShift = await Context.Categories
                            .Where(c => c.Prioritize >= prioritize)
                            .OrderByDescending(c => c.Prioritize)
                            .ToListAsync();

                        if (categoriesToShift.Any())
                        {
                            // BƯỚC 1: Chuyển sang số âm tạm tránh UNIQUE constraint
                            int tempOffset = -1000000;
                            foreach (var cat in categoriesToShift)
                            {
                                cat.Prioritize = tempOffset;
                                tempOffset--;
                                cat.UpdatedDate = DateTime.UtcNow;
                            }
                            await Context.SaveChangesAsync();

                            // BƯỚC 2: Chuyển về số dương mới (+1)
                            int newPrioritize = prioritize + 1;
                            foreach (var cat in categoriesToShift.OrderBy(c => c.Prioritize))
                            {
                                cat.Prioritize = newPrioritize;
                                newPrioritize++;
                                cat.UpdatedDate = DateTime.UtcNow;
                            }
                            await Context.SaveChangesAsync();
                        }
                    }
                }

                // Tạo Category mới
                var d = new DBContext.BMWindows.Entities.Category
                {
                    Name = model.Name.Trim(),
                    Prioritize = prioritize,
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

                int oldPrioritize = d.Prioritize;
                int newPrioritize = model.Prioritize;

                // Nếu không thay đổi Prioritize, chỉ cập nhật thông tin khác
                if (oldPrioritize == newPrioritize)
                {
                    d.Name = model.Name.Trim();
                    d.Status = model.Status;
                    d.UpdatedDate = DateTime.UtcNow;
                    await Context.SaveChangesAsync();
                    return new CommandResult<DBContext.BMWindows.Entities.Category>(d);
                }

                // Nếu nhập số ưu tiên <= 0, đặt về cuối danh sách
                if (newPrioritize <= 0)
                {
                    var maxPrioritize = await Context.Categories.MaxAsync(c => (int?)c.Prioritize);
                    newPrioritize = (maxPrioritize ?? 0) + 1;
                }

                // Kiểm tra xem có Category nào khác đang dùng số ưu tiên mới này không
                var exists = await Context.Categories.AnyAsync(c => c.Id != model.Id && c.Prioritize == newPrioritize);

                if (exists)
                {
                    // TH1: Di chuyển LÊN 
                    if (newPrioritize < oldPrioritize)
                    {
                        var categoriesToShift = await Context.Categories
                            .Where(c => c.Id != model.Id && c.Prioritize >= newPrioritize && c.Prioritize < oldPrioritize)
                            .OrderByDescending(c => c.Prioritize)
                            .ToListAsync();

                        if (categoriesToShift.Any())
                        {
                            // Chuyển sang số âm tạm 
                            int tempOffset = -1000000;
                            foreach (var cat in categoriesToShift)
                            {
                                cat.Prioritize = tempOffset;
                                tempOffset--;
                                cat.UpdatedDate = DateTime.UtcNow;
                            }
                            await Context.SaveChangesAsync();

                            // Chuyển về số dương mới ( +1)
                            int targetPrioritize = newPrioritize + 1;
                            foreach (var cat in categoriesToShift.OrderBy(c => c.Prioritize))
                            {
                                cat.Prioritize = targetPrioritize;
                                targetPrioritize++;
                                cat.UpdatedDate = DateTime.UtcNow;
                            }
                            await Context.SaveChangesAsync();
                        }
                    }
                    // TH2: Di chuyển xuống (từ 2 --> 5)
                    else
                    {
                        var categoriesToShift = await Context.Categories
                            .Where(c => c.Id != model.Id && c.Prioritize > oldPrioritize && c.Prioritize <= newPrioritize)
                            .OrderBy(c => c.Prioritize)
                            .ToListAsync();

                        if (categoriesToShift.Any())
                        {
               
                            int tempOffset = -1000000;
                            foreach (var cat in categoriesToShift)
                            {
                                cat.Prioritize = tempOffset;
                                tempOffset--;
                                cat.UpdatedDate = DateTime.UtcNow;
                            }
                            await Context.SaveChangesAsync();
                                   
                            int targetPrioritize = oldPrioritize;
                            foreach (var cat in categoriesToShift.OrderBy(c => c.Prioritize))
                            {
                                cat.Prioritize = targetPrioritize;
                                targetPrioritize++;
                                cat.UpdatedDate = DateTime.UtcNow;
                            }
                            await Context.SaveChangesAsync();
                        }
                    }
                }

                // Cập nhật Category hiện tại
                d.Name = model.Name.Trim();
                d.Prioritize = newPrioritize;
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