using System;
using DBContext.BMWindows.Entities;
using Service.Utility.Components;
using System.Threading.Tasks;

namespace Service.BMWindows.Executes.Base
{
    public partial class AppItemService : BaseService, IAsyncDisposable
    {
        public BMWindowDBContext Context { get; }

        public AppItemService(BMWindowDBContext context)
        {
            Context = context;
        }

        public async Task SaveContextAsync<T>(T obj = default!)
        {
            try
            {
                await Context.SaveChangesAsync();
            }
            catch (Microsoft.EntityFrameworkCore.DbUpdateException e)
            {
                var msg = e.InnerException?.Message ?? e.Message;
                throw new Exception($"L?i khi lýu d? li?u: {msg}", e);
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
