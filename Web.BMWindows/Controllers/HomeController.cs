using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Service.BMWindows.Executes.Base;
using Service.BMWindows.Executes.AppItem;
using Service.BMWindows.Executes.Category;
using Service.Utility.Variables;
using System.Threading.Tasks;

namespace Web.BMWindows.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly AppItemService _appItemService;
        private readonly CategoryService _categoryService;

        public HomeController(ILogger<HomeController> logger, AppItemService appItemService, CategoryService categoryService)
        {
            _logger = logger;
            _appItemService = appItemService;
            _categoryService = categoryService;
        }

        [HttpGet]
        [Route("User/Index")]
        public async Task<IActionResult> UserIndex(int categoryId)
        {
            // Load all active Categories (Status = 1)
            var categorySearchModel = new SearchCategoryModel
            {
                Status = 1 // Only active categories
            };

            var categoryOption = new OptionResult
            {
                Unlimited = true // Get all categories without pagination
            };

            var categories = await _categoryService.CategoryMany(categorySearchModel, categoryOption);
            ViewBag.Categories = categories.Many;

            // Load all active AppItems (Status = 1)
            var appItemSearchModel = new SearchAppItemModel
            {
                Status = 1, // Only active items
                CategoryId = categoryId // Filter by category if provided
            };

            var appItemOption = new OptionResult
            {
                Unlimited = true // Get all items without pagination
            };

            var appItems = await _appItemService.AppItemMany(appItemSearchModel, appItemOption);

            ViewBag.SelectedCategoryId = categoryId;

            return View("~/Views/Web/User/Home/Index.cshtml", appItems.Many);
        }

        [HttpGet]
        [Route("User/LoadAppItems")]
        public async Task<IActionResult> LoadAppItems(int categoryId)
        {
            var appItemSearchModel = new SearchAppItemModel
            {
                Status = 1, // Only active items
                CategoryId = categoryId 
            };

            var appItemOption = new OptionResult
            {
                Unlimited = true // Get all items without pagination
            };

            var appItems = await _appItemService.AppItemMany(appItemSearchModel, appItemOption);

            return PartialView("~/Views/Web/User/Home/_AppItemsPartial.cshtml", appItems.Many);
        }
    }
}