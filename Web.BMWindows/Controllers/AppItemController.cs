using Microsoft.AspNetCore.Mvc;
using Service.BMWindows.Executes.AppItem;
using Service.BMWindows.Executes.Base;
using Service.BMWindows.Executes.Category;
using Service.Utility.Components;
using Service.Utility.Variables;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace BMWindows.Controllers
{
    public class AppItemController : Controller
    {
        private readonly AppItemService _appItemService;
        private readonly CategoryService _categoryService;

        public AppItemController(AppItemService appItemService, CategoryService categoryService)
        {
            _appItemService = appItemService;
            _categoryService = categoryService;
        }

        public IActionResult Index()
        {
            return View("~/Views/Web/Admin/AppItem.cshtml");
        }

        public async Task<IActionResult> AppItemList(SearchAppItemModel model, OptionResult option)
        {
            var result = await _appItemService.AppItemMany(model, option);
            return Json(result);
        }

        public async Task<IActionResult> AppItemEdit(int? id)
        {
            AppItemViewModel model;

            if (id.HasValue && id.Value > 0)
            {
                model = await _appItemService.AppItemOne(id.Value);
                if (model == null)
                {
                    model = new AppItemViewModel();
                }
            }
            else
            {
                model = new AppItemViewModel();
            }

            // Load danh sách Category cho dropdown
            var categories = await _categoryService.CategoryMany(new SearchCategoryModel(), new OptionResult { Limit = 100 });
            ViewBag.Categories = categories.Many;

            return PartialView("~/Views/Web/Admin/AppItemDetail.cshtml", model);
        }

        [HttpPost]
        public async Task<IActionResult> AppItemEdit(AppItemEditModel model)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();

                    return Json(new
                    {
                        success = false,
                        message = "Vui lòng nhập đầy đủ dữ liệu: " + string.Join(", ", errors)
                    });
                }

                CommandResult<DBContext.BMWindows.Entities.AppItem> result;

                if (model.Id > 0)
                {
                    result = await _appItemService.EditAppItem(model);
                }
                else
                {
                    result = await _appItemService.CreateAppItem(model);
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
                var errorMessage = ex.Message;
                if (ex.InnerException != null)
                {
                    errorMessage += " | Inner: " + ex.InnerException.Message;
                }

                return Json(new
                {
                    success = false,
                    message = "Có lỗi xảy ra: " + errorMessage
                });
            }
        }
    }
}
