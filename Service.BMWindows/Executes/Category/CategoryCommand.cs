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
        public async Task<CommandResult<DBContext.BMWindows.Entities.Category>> CreateCategory(CategoryEditModel model)
        {
			try
			{
				var d = new DBContext.BMWindows.Entities.Category
				{
					Name = model.Name,
					Prioritize = model.Prioritize,
					Status = 1,
					CreatedBy = model.CreatedBy,
					CreatedDate = model.CreatedDate,
					UpdatedBy = model.UpdatedBy,
					UpdatedDate = model.UpdatedDate,
				};
				
				Context.Categories.Add(d);
				await Context.SaveChangesAsync();
				return new CommandResult<DBContext.BMWindows.Entities.Category>(d);
			}
			catch (Exception ex)
			{

                return new CommandResult<DBContext.BMWindows.Entities.Category>(ex.Message);
            }
        }
		public async Task<CommandResult<DBContext.BMWindows.Entities.Category>> EditCategory(CategoryEditModel model)
		{
            var d = await Context.Categories.FirstOrDefaultAsync(x => x.Id == model.Id);
            if (d == null)
                return new CommandResult<DBContext.BMWindows.Entities.Category>("Không tìm thấy nhóm ứng dụng: " + model.Id);
			d.Name = model.Name;
			d.Prioritize = model.Prioritize;
			d.Status = model.Status;
			d.UpdatedBy = model.UpdatedBy;
			d.UpdatedDate =  System.DateTime.UtcNow;

			await Context.SaveChangesAsync();
            return new CommandResult<DBContext.BMWindows.Entities.Category>(d);
        }
    }

}