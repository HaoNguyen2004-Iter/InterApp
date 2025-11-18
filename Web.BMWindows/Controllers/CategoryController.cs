using Microsoft.AspNetCore.Mvc;
using Service.BMWindows.Executes.Category;
using Service.BMWindows.Executes.Base;
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

        public async Task<IActionResult> CategoryEdit(int? id)
        {
            CategoryViewModel model;
            
            if (id.HasValue && id.Value > 0)
            {
                model = await _categoryService.CategoryOne(id.Value);
                if (model == null)
                {
                    model = new CategoryViewModel();
                }
            }
            else
            {
                model = new CategoryViewModel();
            }
            
            return PartialView("~/Views/Web/Admin/CategoryDetail.cshtml", model);
        }

        [HttpPost]
        public async Task<IActionResult> CategoryEdit(CategoryEditModel model)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();
                    
                    return Json(new { 
                        success = false, 
                        message = "Vui lòng nhập đầy đủ dữ liệu: " + string.Join(", ", errors) 
                    });
                }

                CommandResult<DBContext.BMWindows.Entities.Category> result;
                
                if (model.Id > 0)
                {
                    // Cập nhật
                    result = await _categoryService.EditCategory(model);
                }
                else
                {
                    // Tạo mới
                    result = await _categoryService.CreateCategory(model);
                }

                if (result.Success)
                {
                    return Json(new 
                    { 
                        success = true, 
                        message = model.Id > 0 ? "Cập nhật thành công" : "Tạo mới thành công",
                        data = result.Data
                    });
                }
                else
                {
                    return Json(new { success = false, message = result.Message });
                }
            }
            catch (Exception ex)
            {
                // Log chi tiết lỗi 
                var errorMessage = ex.Message;
                if (ex.InnerException != null)
                {
                    errorMessage += " | Inner: " + ex.InnerException.Message;
                                   
                }
                
               
                
                return Json(new { 
                    success = false, 
                    message = "Có lỗi xảy ra: " + errorMessage 
                });
            }
        }
    }
}
