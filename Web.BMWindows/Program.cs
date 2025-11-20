using DBContext.BMWindows.Entities;
using Microsoft.EntityFrameworkCore;
using Service.BMWindows.Executes.Category;
using Service.BMWindows.Executes.Base;

var builder = WebApplication.CreateBuilder(args);

// MVC + Razor (add RazorPages to register JSON options for pages if you use them)
builder.Services
    .AddControllersWithViews()
    .AddJsonOptions(opts =>
    {
        opts.JsonSerializerOptions.PropertyNamingPolicy = null;
        opts.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });

// If you use Razor Pages elsewhere, register and apply same JSON options
builder.Services
    .AddRazorPages()
    .AddJsonOptions(opts =>
    {
        opts.JsonSerializerOptions.PropertyNamingPolicy = null;
        opts.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });

// DbContext SQL Server
builder.Services.AddDbContext<BMWindowDBContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("BMWindowDB"));
    if (builder.Environment.IsDevelopment())
    {
        options.EnableDetailedErrors();
        options.EnableSensitiveDataLogging();
    }
});

// Register Services
builder.Services.AddScoped<CategoryService>();
builder.Services.AddScoped<AppItemService>();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=UserIndex}");

// Map Razor pages if present
app.MapRazorPages();

// 1) Startup probe: log whether DB is reachable
using (var scope = app.Services.CreateScope())
{
    var ctx = scope.ServiceProvider.GetRequiredService<BMWindowDBContext>();
    try
    {
        var canConnect = await ctx.Database.CanConnectAsync();
        app.Logger.LogInformation("DB CanConnect: {CanConnect}", canConnect);
    }
    catch (Exception ex)
    {
        app.Logger.LogError(ex, "DB connection failed at startup.");
    }
}

// Dev-only debug endpoints
if (app.Environment.IsDevelopment())
{
    app.MapGet("/debug/db-connection", async (BMWindowDBContext ctx) =>
    {
        try
        {
            var canConnect = await ctx.Database.CanConnectAsync();
            var cnn = ctx.Database.GetDbConnection();
            return Results.Ok(new
            {
                canConnect,
                dataSource = cnn.DataSource,
                database = cnn.Database,
                state = cnn.State.ToString()
            });
        }
        catch (Exception ex)
        {
            return Results.Problem(ex.ToString());
        }
    });

    app.MapGet("/debug/category-count", async (BMWindowDBContext ctx) =>
    {
        try
        {
            var count = await ctx.Categories.CountAsync();
            return Results.Ok(new { count });
        }
        catch (Exception ex)
        {
            return Results.Problem(ex.ToString());
        }
    });
}

app.Run();