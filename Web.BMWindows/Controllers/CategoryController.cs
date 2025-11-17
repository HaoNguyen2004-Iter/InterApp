using Microsoft.AspNetCore.Mvc;
using Service.BMWindows.Executes.Category;
using Service.Utility.Components;
using Service.Utility.Variables;
using System.Text.Json;
using System.IO.Compression;

namespace BMWindows.Controllers
{
    public class CategoryController : Controller
    {
        private readonly CategoryService _categoryService;
       
        public CategoryController(CategoryService categoryService)
        {
            _categoryService = categoryService;
        }
        public IActionResult Index()
        {
            return View("~/Views/Web/Admin/Category.cshtml");
        }

        public async Task<IActionResult> CategoryList(SearchCategoryModel model, OptionResult option)
        {
            var result = await _categoryService.CategoryMany(model, option);
            return Json(result);
        }
    }
}
