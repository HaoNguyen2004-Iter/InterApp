using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using DBContext.BMWindows.Entities;

namespace Service.BMWindows.Executes.Base
{
    public partial class CategoryService : BaseService, IAsyncDisposable
    {
        public BMWindowDBContext Context { get; }


        public CategoryService(BMWindowDBContext context)
        {
            Context = context;
        }

        public async Task SaveContextAsync<T>(T obj = default!)
        {
            try
            {
                await Context.SaveChangesAsync();
            }
            catch (DbUpdateException e)
            {
                var msg = e.InnerException?.Message ?? e.Message;
                throw new Exception($"Lỗi khi lưu dữ liệu: {msg}", e);
            }
        }

        public async ValueTask DisposeAsync()
        {
            if (Context != null)
            {
                await Context.DisposeAsync();
            }
        }

        public void Dispose() => Context?.Dispose();
    }
}
