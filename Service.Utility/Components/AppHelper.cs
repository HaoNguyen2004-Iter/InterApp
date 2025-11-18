using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using Microsoft.AspNetCore.Html;

namespace Service.Utility.Components
{

    public class ProfilePropertySummary
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Code { get; set; }
        public bool Active { get; set; }
        public string Desc { get; set; }
    }

    public class SelectOption
    {
        public string Value { get; set; }
        public string Text { get; set; }
    }

    public class AttributeItem
    {
        public string Name { get; set; }
        public string Value { get; set; }
    }

    public class PropertyPrivateBase
    {
        public string Name { get; set; }
        public bool Active { get; set; }
        public string Desc { get; set; }
    }

    public class ControlAttribute
    {
        public string Title { get; set; }
        public string Name { get; set; }
        public string Value { get; set; }
        public string Value2 { get; set; }
        public string Name2 { get; set; }
        public bool Required { get; set; }
        public bool Check { get; set; }
        public bool Disable { get; set; }
        public bool HasDefaultOption { get; set; }
        public List<SelectOption> List { get; set; }
        public bool OnlyControl { get; set; }
        public string Summary { get; set; }
        public int Row { get; set; }
        public string Class { get; set; }
        public string Min { get; set; }
        public string Max { get; set; }

        public string PlaceHolder { get; set; }
        public string Type { get; set; }
        public int LabelCol { get; set; }
        public int? LabelLgCol { get; set; }
        public int ControlCol { get; set; }
        public bool ReadOnly { get; set; }
        public bool HasViewMoreBtn { get; set; }
        public string HasViewLink { get; set; }
        public bool HasDownloadBtn { get; set; }
        public bool MultiSelect { get; set; }
        public string Feedback { get; set; }
        public string Style { get; set; }
        public string Icon { get; set; }
        public string Id { get; set; }
        public bool HasImagelibrary { get; set; }
        public bool Right { get; set; }
        public PropertyPrivateBase Obj { get; set; }
        public List<AttributeItem> Attributes { get; set; }
        public string BottomLink { get; set; }
        public bool Select2 { get; set; }

        public string? TitleDescriptionHtml { get; set; }
    }

    public class EmpMediaModel
    {
        public Guid Id { get; set; }
        public string Image { get; set; }
        public string Name { get; set; }
        public string Sub1 { get; set; }
        public string Sub2 { get; set; }
        public string Link { get; set; }
        public int? Width { get; set; }
    }

    public static class AppHelper
    {
        public static string FormatPrice(decimal? value)
        {
            if (value.HasValue && value.Value > 0)
                return value.Value.ToString("#,###", CultureInfo.GetCultureInfo("vi-VN").NumberFormat) + " đ";
            return "0 đ";
        }
        public static string ToAid(int id, string code)
        {
            var z = 7 - (id + "").Length;
            for (var i = 0; i < z; i++)
            {
                code += '0';
            }
            return code + id;
        }
        public static string Thumbnail(string path, string type, string size)
        {
            string fp;
            if (string.IsNullOrEmpty(path))
            {
                if (size != null)
                {
                    fp = "/media/default/" + type + "/" + size + ".jpg";
                }
                else
                {
                    fp = "/media/default/" + type + "/xs.jpg";
                }
            }
            else
            {
                if (size != null)
                {
                    if (path.IndexOf(".", StringComparison.Ordinal) > 0)
                    {
                        var extension = path.Substring(path.IndexOf(".", StringComparison.Ordinal));
                        fp = path + ".thumb/" + size + extension;
                    }
                    else
                    {
                        fp = path;
                    }
                }
                else
                {
                    fp = path;
                }
            }
            return fp;
        }



        private static string GenLabelCol(ControlAttribute a)
        {
            var labelCol = "";

            if (a.LabelCol > 0)
            {
                labelCol = " col-md-" + a.LabelCol;
            }

            if (a.LabelLgCol.HasValue)
            {
                labelCol += " col-lg-" + a.LabelLgCol;
            }

            return labelCol;
        }

        private static string GenControlCol(ControlAttribute a)
        {
            var cc = a.ControlCol > 0 ? a.ControlCol : 12 - a.LabelCol;
            var ccStr = "col-md-" + cc;
            if (a.LabelLgCol.HasValue)
            {
                ccStr += " col-lg-" + (12 - a.LabelLgCol);
            }
            return ccStr;
        }

        public static string GetLabel(ControlAttribute attr)
        {

            var label = "";

            label += "<label class=\"control-label " + GenLabelCol(attr) + "\">";

            label += (attr.Obj != null ? attr.Obj.Name : attr.Title);
            if (attr.Obj != null && attr.Obj.Desc.HasValue())
            {
                label += "<i class=\"icon-info22 ml-5 text-muted\" data-trigger=\"hover\" data-toggle=\"popover\" data-placement=\"top\" data-content=\"" + attr.Obj.Desc + "\"></i>";
            }
            label += (attr.Required ? " <span class=\"text-danger\">(*)</span>" : "");
            label += "</label>";
            return label;
        }

        public static HtmlString InputNumber(ControlAttribute attr)
        {
            return new HtmlString("<div class=\"form-group\">"
                        + "<label>" + attr.Title + "</label>"
                        + "<div class=\"input-group\" style=\"max-width: 200px\">"
                        + "<span class=\"input-group-btn\">"
                        + "<button type=\"button\" class=\"btn btn-default btn-number\" data-type=\"minus\" data-field=\"" + attr.Name + "\">"
                        + "<span class=\"glyphicon glyphicon-minus\"></span>"
                        + "</button>"
                        + "</span>"
                        + "<input  type=\"text\" name=\"" + attr.Name + "\" class=\"form-control input-number\" value=\"" + attr.Value + "\" min=\"" + attr.Min + "\" max=\"" + attr.Max + "\">"
                + "<span class=\"input-group-btn\">"
                + "<button type=\"button\" class=\"btn btn-default btn-number\" data-type=\"plus\" data-field=\"" + attr.Name + "\">"
                + "<span class=\"glyphicon glyphicon-plus\"></span>"
                + "</button>"
                + "</span>"
                + "</div>"
                + "</div>");
        }
        public static HtmlString Input(ControlAttribute attr)
        {
            var html = "<div class=\"form-group form-group-sm  " + (attr.Obj != null && !attr.Obj.Active ? "hide" : "") +
                       (!string.IsNullOrEmpty(attr.Feedback) ? "has-feedback" : "") + " \">";
            var label = "<label class=\"control-label\">" + attr.Title + (attr.Required ? " <span class=\"text-danger\">*</span>" : "") + "</label>";
            if (!attr.OnlyControl)
            {
                html += label;
            }
            if (!string.IsNullOrEmpty(attr.Summary))
            {
                html += "<p>" + attr.Summary + "</p>";
            }

            var input = "<input name=\"" + attr.Name + "\" placeholder=\"" + attr.Title +
                        "\" "
                        + (attr.ReadOnly ? "readonly=\"readonly\"" : "")
                        + (attr.Disable ? "disabled=\"disabled\"" : "")
                        + "class=\"form-control " + (!string.IsNullOrEmpty(attr.Class) ? attr.Class : "") + "\" type=\"" + (!string.IsNullOrEmpty(attr.Type) ? attr.Type : "text") +
                        "\" value=\"" + attr.Value + "\">";
            html += "<div>" + input;
            if (!string.IsNullOrEmpty(attr.Feedback))
            {
                html += "<div class=\"form-control-feedback\"><i class=\"" + attr.Feedback + "\"></i></div>";
            }
            html += "</div></div>";
            return new HtmlString(html);
        }

        public static HtmlString InputInline(ControlAttribute attr)
        {
            var html = "<div class=\"form-group form-group-sm " + (attr.Obj != null && !attr.Obj.Active ? "hide" : "")
                       + (!string.IsNullOrEmpty(attr.Feedback) ? "has-feedback" : "") + "\">"
                       + "<label class=\"control-label " + GenLabelCol(attr) + "\">" + attr.Title +
                       (attr.Required ? " <span class=\"text-danger\">(*)</span>" : "") + "</label>";

            html += "<div class=\"" + GenControlCol(attr) + "\" >";
            if (!string.IsNullOrEmpty(attr.Summary))
            {
                html += "<p>" + attr.Summary + "</p>";
            }

            var attrs = new List<string>();
            if (attr.Attributes != null)
            {
                foreach (var a in attr.Attributes)
                {
                    attrs.Add(a.Name + "=\"" + a.Value + "\"");
                }
            }

            var control = "";
            if (attr.Type == "file")
            {
                control = "<input  name=\"" + attr.Name + "PostFileBase\" type=\"file\" />"
                 + "<input value=\"" + attr.Value + "\" name=\"" + attr.Name + "Uploaded\" type=\"hidden\" />"
                 + "<input value=\"" + attr.Value + "\" name=\"" + attr.Name + "\" type=\"hidden\" />";
                if (!string.IsNullOrEmpty(attr.Value))
                {
                    control += "<span class=\"upload-info upload-info-" + attr.Name + "\" style=\"display: flex;margin-top: 5px;font-size: 12px;\">File đã tải lên: " +
                               "<a href=\"" + attr.Value + "\" target=\"_blank\" class=\"position-right\"> Tải về</a></span>";
                }
                else
                {
                    control += "<span class=\"upload-info upload-info-" + attr.Name + "\" style=\"display: none;margin-top: 5px;font-size: 12px;\">File đã tải lên: " +
                               "<a href=\"" + attr.Value + "\" target=\"_blank\" class=\"position-right\"> Tải về</a></span>";
                }
            }
            else
            {
                var ph = attr.PlaceHolder.HasValue() ? attr.PlaceHolder :
                    attr.Title.HasValue() ? attr.Title.ToLower() : "";
                var t = attr.Type.HasValue() ? attr.Type : "text";
                control = "<input " +
                    (attrs.Any() ? string.Join(" ", attrs) : "") +
                    "class=\"form-control " + (!string.IsNullOrEmpty(attr.Class) ? attr.Class : "") + "\" " +
                    "type=\"" + t + "\" " +
                          "name=\"" + attr.Name + "\" "
                          + (attr.ReadOnly ? "readonly=\"readonly\"" : "")
                          + (attr.Disable ? "disabled=\"disabled\"" : "")
                          + " placeholder=\"" + ph + "\" value=\"" + attr.Value + "\"> ";
            }
            var cls = "";
            if (attr.Select2)
            {
                cls += " input-group input-group-sm input-group-select2 ";
            }
            if (attr.HasViewMoreBtn)
            {


                html += "<div class=\"" + cls + " \">" + control +
                        "<span class=\"input-group-addon\">" +
                        "<button title=\"Xem thêm " + attr.Title.ToLower() + "\" " +
                        "data-loading-text=\"<i class='icon-spinner10 fa-spin '></i>\" " +
                        "class=\"btn btn-default view-more-" + attr.Name + "\" type=\"button\">" +
                        "<i class=\"icon-more2\"></i>" +
                        "</button>" +
                        "</span>" +
                        "</div>";
            }
            else if (attr.HasViewLink.HasValue())
            {
                html += "<div class=\"" + cls + "\">" + control +
                        "<span class=\"input-group-addon\">" +
                        "<a target=\"_blank\" href=\"" + attr.HasViewLink + "\" title=\"Danh mục " + attr.Title.ToLower() + "\" " +
                        "class=\"btn btn-link view-more-link\">Danh mục</a>" +
                        "</span>" +
                        "</div>";
            }
            else
            {
                html += control;
            }

            if (!string.IsNullOrEmpty(attr.Feedback))
            {
                html += "<div class=\"form-control-feedback\"><i class=\"" + attr.Feedback + "\"></i></div>";
            }


            html += "</div></div>";
            return new HtmlString(html);
        }

        public static HtmlString ImageUploader(ControlAttribute attr)
        {
            var html = "<div class=\"form-group form-group-sm " + (attr.Obj != null && !attr.Obj.Active ? "hide" : "") + "\">"
                       + "<label class=\"control-label " + GenLabelCol(attr) + "\">" + attr.Title +
                       (attr.Required ? " <span class=\"text-danger\">(*)</span>" : "") + "</label>";

            html += "<div class=\"" + GenControlCol(attr) + "\" >";
            if (!string.IsNullOrEmpty(attr.Summary))
            {
                html += "<p>" + attr.Summary + "</p>";
            }

            var attrs = new List<string>();
            if (attr.Attributes != null)
            {
                foreach (var a in attr.Attributes)
                {
                    attrs.Add(a.Name + "=\"" + a.Value + "\"");
                }
            }

            var control = "<div name=\"" + attr.Name + "\" data-value=\"" + attr.Value + "\"></div>";


            html += control;

            html += "</div></div>";
            return new HtmlString(html);
        }

        public static HtmlString ComboDate(ControlAttribute attr)
        {

            var html = "<div class=\"form-group form-group-sm \" >";
            html += "<label class=\"control-label " + GenLabelCol(attr) + "\">" + attr.Title +
                    (attr.Required ? " <span class=\"text-danger\">(*)</span>" : "") + "</label>";
            html += "<div class=\"" + GenControlCol(attr) + "\" >";
            html += "<div style=\"display: table; width: 100%\"  > " +
                "<div class=\"has-feedback\" style=\"display: table-cell\"> " +
                "<div class=\"input-group input-group-sm\"> " +
                "<span class=\"input-group-addon pl-10 pr-10\">Từ</span> " +
                "<input type=\"text\" placeholder=\"" + (attr.PlaceHolder.HasValue() ? attr.PlaceHolder : "") + "\" class=\"form-control no-border-radius\" value=\"" + attr.Value + "\"  name=\"" + attr.Name + "\"> " +
                "</div>" +
                "<div class=\"form-control-feedback\"><i class=\"icon-calendar2\"></i></div>" +
                "</div> " +
                "<div class=\"has-feedback\" style=\"display: table-cell;\"> " +
                "<div class=\" input-group input-group-sm\"> " +
                "<span class=\"input-group-addon pl-10 pr-10 no-border-radius no-border-left\">Đến</span> " +
                "<input type=\"text\" placeholder=\"" + (attr.PlaceHolder.HasValue() ? attr.PlaceHolder : "") + "\" class=\"form-control no-border-radius\" value=\"" + attr.Value2 + "\" name=\"" + attr.Name2 + "\"> " +
                "</div>" +
                "<div class=\"form-control-feedback\"><i class=\"icon-calendar2\"></i></div>" +
                "</div>" +
                "</div>";
            html += "</div></div>";
            return new HtmlString(html);
        }
        public static HtmlString NumberRange(ControlAttribute attr)
        {
            var html = "<div class=\"form-group form-group-sm \" >";
            html += "<label class=\"control-label " + GenLabelCol(attr) + "\">" + attr.Title + "</label>";
            html += "<div class=\"" + GenControlCol(attr) + "\" >";
            html += "<div style=\"display: table\"> " +
                    "<div class=\"\" style=\"display: table-cell\"> " +
                    "<div class=\"input-group input-group-sm\"> " +
                    "<span class=\"input-group-addon pl-10 pr-10\">Từ</span> " +
                    "<input type=\"text\" class=\"form-control no-border-radius\" value=\"" + attr.Value + "\" name=\"" + attr.Name + "\"> " +
                    "</div>" +
                    "</div> " +
                    "<div class=\"\" style=\"display: table-cell;\"> " +
                    "<div class=\" input-group input-group-sm\"> " +
                    "<span class=\"input-group-addon pl-10 pr-10 no-border-radius no-border-left\">Đến</span> " +
                    "<input type=\"text\" class=\"form-control no-border-radius\" value=\"" + attr.Value2 + "\" name=\"" + attr.Name2 + "\"> " +
                    "</div>" +
                    "</div>" +
                    "</div>";
            html += "</div></div>";
            return new HtmlString(html);
        }

        public static HtmlString SuggestInputInline(ControlAttribute attr)
        {
            var html = "<div class=\"form-group form-group-sm  " + (!string.IsNullOrEmpty(attr.Feedback) ? "has-feedback" : "") + "\">"
                       + "<label class=\"control-label " + GenLabelCol(attr) + "\">" + attr.Title +
                       (attr.Required ? " <span class=\"text-danger\">(*)</span>" : "") + "</label>";

            html += "<div class=\" " + GenControlCol(attr) + "\" >";
            if (!string.IsNullOrEmpty(attr.Summary))
            {
                html += "<p>" + attr.Summary + "</p>";
            }

            var control = "";
            var t = attr.Type.HasValue() ? attr.Type : "text";
            control = "<input class=\"form-control " + (!string.IsNullOrEmpty(attr.Class) ? attr.Class : "") + "\" type=\"" + t + "\" " +
                      "name=\"" + attr.Name + "_Text\" "
                      + (attr.ReadOnly ? "readonly=\"readonly\"" : "")
                      + (attr.Disable ? "disabled=\"disabled\"" : "")
                      + " placeholder=\"" + attr.Title + "\" value=\"" + attr.Value2 + "\"> ";
            control += "<input type=\"hidden\"" +
                      "name=\"" + attr.Name + "_Id\" value=\"" + attr.Value + "\"> ";
            if (attr.HasViewMoreBtn)
            {
                html += "<div class=\"input-group input-group-sm\">" + control +
                        "<span class=\"input-group-addon\">" +
                        "<button title=\"Xem thêm " + attr.Title.ToLower() + "\" " +
                        "data-loading-text=\"<i class='icon-spinner10 fa-spin '></i>\" " +
                        "class=\"btn btn-default view-more-" + attr.Name + "\" type=\"button\">" +
                        "<i class=\"icon-more2\"></i>" +
                        "</button>" +
                        "</span>" +
                        "</div>";
            }
            else if (attr.HasViewLink.HasValue())
            {
                html += "<div class=\"input-group input-group-sm\">" + control +
                        "<span class=\"input-group-addon\">" +
                        "<a target=\"_blank\"  href=\"" + attr.HasViewLink + "\"  title=\"Danh mục " + attr.Title.ToLower() + "\" " +
                        "class=\"btn btn-link view-more-link\">Danh mục</a>" +
                        "</span>" +
                        "</div>";
            }
            else
            {
                html += control;
            }

            if (!string.IsNullOrEmpty(attr.Feedback))
            {
                html += "<div class=\"form-control-feedback\"><i class=\"" + attr.Feedback + "\"></i></div>";
            }

            html += "</div></div>";
            return new HtmlString(html);
        }
        public static HtmlString Password(ControlAttribute attr)
        {
            return new HtmlString("<div class=\"form-group form-group-sm\">"
                                     + "<label class=\"control-label\">" + attr.Title + (attr.Required ? " <span class=\"text-danger\">*</span>" : "") + "</label>"
                                     + "<div class=\"input-group\">" +
                                     "<input name=\"" + attr.Name + "\" placeholder=\"" + attr.Title + "\" class=\"form-control\" type=\"password\" value=\"" + attr.Value + "\">" +
                                     "<span class=\"input-group-btn\"><button class=\"btn btn-default view-pass\" type=\"button\"><i class=\"icon-eye-blocked\"></i></button>" +
                                     "</div>"
                                     + "</div>");
        }
        public static HtmlString Textarea(ControlAttribute attr)
        {
            var html = "<div class=\"form-group  " + (attr.Obj != null && !attr.Obj.Active ? "hide" : "") + "\">";
            var label = "<label class=\"control-label\">" + attr.Title +
                        (attr.Required ? " <span class=\"text-danger\">*</span>" : "") + "</label>";

            if (!attr.OnlyControl)
            {
                html += label;
            }
            if (!string.IsNullOrEmpty(attr.TitleDescriptionHtml))
            {
                html += attr.TitleDescriptionHtml;
            }
            var attrs = new List<string>();
            if (attr.Attributes != null)
            {
                foreach (var a in attr.Attributes)
                {
                    attrs.Add(a.Name + "=\"" + a.Value + "\"");
                }
            }

            var control = "<textarea "
                + (attrs.Any() ? string.Join(" ", attrs) : "")
                + (attr.Disable ? "disabled=\"disabled\"" : "") + " rows=" + attr.Row + " name=\"" + attr.Name + "\" placeholder=\"" + attr.Title +
                          "\" class=\"form-control\" >" + attr.Value + "</textarea>";
            html += control + "</div>";
            return new HtmlString(html);
        }
        public static HtmlString TextareaInline(ControlAttribute attr)
        {

            var attrs = new List<string>();
            if (attr.Attributes != null)
            {
                foreach (var a in attr.Attributes)
                {
                    attrs.Add(a.Name + "=\"" + a.Value + "\"");
                }
            }
            var ph = attr.PlaceHolder.HasValue() ? attr.PlaceHolder : attr.Title;
            return new HtmlString("<div class=\"form-group form-group-sm  " + (attr.Obj != null && !attr.Obj.Active ? "hide" : "") + "\">"
                                     + "<label class=\"control-label " + GenLabelCol(attr) + "\">" + attr.Title + (attr.Required ? " <span class=\"text-danger\">(*)</span>" : "") + "</label>"
                                     + "<div class=\"" + GenControlCol(attr) + "\" >" +
                                     "<textarea "
                                     + (attrs.Any() ? string.Join(" ", attrs) : "")
                                     + (attr.Disable ? "disabled=\"disabled\"" : "")
                                     + " rows=" + attr.Row + " name=\"" + attr.Name + "\" placeholder=\"" + ph
                                     + "\" class=\"form-control " + (!string.IsNullOrEmpty(attr.Class) ? attr.Class : "") + "\" >" + attr.Value + "</textarea>"
                                     + "</div></div>");
        }
        public static HtmlString Summernote(ControlAttribute attr)
        {
            var ph = attr.PlaceHolder.HasValue() ? attr.PlaceHolder : attr.Title;
            return new HtmlString("<div class=\"form-group\"><div class=\"col-md-12\">"
                                     + "<label class=\"control-label\">" + attr.Title + (attr.Required ? " <span class=\"text-danger\">*</span>" : "") + "</label>"
                                     + "<textarea name=\"" + attr.Name + "\" placeholder=\"" + ph + "\" class=\"form-control summernote\" >" + attr.Value + "</textarea>"
                                     + "</div></div>");
        }
        public static HtmlString SummernoteInline(ControlAttribute attr)
        {

            var ph = attr.PlaceHolder.HasValue() ? attr.PlaceHolder : attr.Title;
            return new HtmlString("<div class=\"form-group\">"
                                     + "<label class=\"control-label " + GenLabelCol(attr) + "\">" + attr.Title + (attr.Required ? " <span class=\"text-danger\">*</span>" : "") + "</label>"
                                     + "<div class=\"" + GenControlCol(attr) + "\" >" +
                                     "<textarea name=\"" + attr.Name + "\" placeholder=\"" + ph + "\" class=\"form-control summernote\" >" + attr.Value + "</textarea>"
                                     + "</div></div>");
        }
        public static HtmlString Checkbox(ControlAttribute attr)
        {
            var guid = Guid.NewGuid();
            return new HtmlString("<div class=\"checkbox " + (attr.Right ? "checkbox-right" : "") + "\" style=\"" + (attr.Style.HasValue() ? attr.Style : "") + "\">"
                                     + "<label>"
                                     + "<input " + (attr.Disable ? "disabled=\"\"" : "") + " id=\"id" + guid + "\" " + (attr.Check ? "checked=\"\"" : "") + " type=\"checkbox\" name=\"" + attr.Name + "\" class=\"styled\" value=\"" + attr.Value + "\" />"
                                     + attr.Title
                                     + "</label>"
                                     + "</div>");
        }
        public static HtmlString CheckboxInline(ControlAttribute attr)
        {

            var guid = Guid.NewGuid();
            return new HtmlString("<label class=\"checkbox-inline " + (attr.Right ? "checkbox-right" : "") + "\">"
                                     + "<input " + (attr.Disable ? "disabled=\"\"" : "") + " id=\"id" + guid + "\" " + (attr.Check ? "checked=\"\"" : "") + " type=\"checkbox\" name=\"" + attr.Name + "\" class=\"styled\" value=\"" + attr.Value + "\" />"
                                     + attr.Title
                                     + "</label>");
        }
        public static HtmlString SwitcheryInline(ControlAttribute attr)
        {
            return new HtmlString("<div class=\"checkbox checkbox-switchery switchery-sm\">" +
            "<label> " +
                "<input type=\"checkbox\" value=\"" + attr.Value + "\" name=\"" + attr.Name + "\"   class=\"switchery\" " + (attr.Check ? "checked=\"\"" : "") + " />" +
                                     attr.Title +
            "</label>" +
       "</div>");
        }
        public static HtmlString Select(ControlAttribute attr)
        {
            var control = "<select " + (attr.MultiSelect ? "multiple=\"multiple\"" : "") + " name=\"" + attr.Name + "\" class=\"form-control  " + (!string.IsNullOrEmpty(attr.Class) ? attr.Class : "") + "\">";
            if (attr.HasDefaultOption)
            {
                var ph = "";
                if (attr.PlaceHolder.HasValue())
                {
                    ph = attr.PlaceHolder;
                }
                else if (attr.Obj != null)
                {
                    ph = "Chọn " + attr.Obj.Name.ToLower();
                }
                else
                {
                    ph = "Chọn " + attr.Title.ToLower();
                }

                control += "<option value=\"\">" + ph + "</option>";
            }

            var arrValue = attr.MultiSelect && attr.Value.HasValue() ? attr.Value.Split(',').ToArray() : new string[] { };


            foreach (var option in attr.List)
            {
                if (attr.MultiSelect && arrValue.Contains(option.Value))
                {
                    control += "<option selected=\"\"  value=\"" + option.Value + "\">" + option.Text + "</option>";
                }
                else if (option.Value == attr.Value)
                {
                    control += "<option selected=\"\"  value=\"" + option.Value + "\">" + option.Text + "</option>";
                }
                else
                {
                    control += "<option value=\"" + option.Value + "\">" + option.Text + "</option>";
                }
            }

            control += "</select>";
            if (attr.OnlyControl)
            {
                return new HtmlString(control);
            }

            var html = "<div class=\"form-group form-group-sm " + (attr.Obj != null && !attr.Obj.Active ? "hide" : "") +
                       "\">";
            html += GetLabel(attr);
            html += control + "</div>";
            return new HtmlString(html);
        }
        public static HtmlString SelectInline(ControlAttribute attr)
        {
            var html = "<div class=\"form-group form-group-sm " + (attr.Obj != null && !attr.Obj.Active ? "hide" : "") + " \">";


            html += GetLabel(attr);

            html += "<div class=\"" + GenControlCol(attr) + "\">";

            var attrs = new List<string>();
            if (attr.Attributes != null)
            {
                foreach (var a in attr.Attributes)
                {
                    attrs.Add(a.Name + "=\"" + a.Value + "\"");
                }
            }

            var control = "";
            var select = "<select "
                + (attrs.Any() ? string.Join(" ", attrs) : "")
                + (attr.Disable ? "disabled=\"disabled\"" : "") + " "
                + (attr.MultiSelect ? "multiple=\"multiple\"" : "")
                + " name=\"" + attr.Name + "\" " +
                         "class=\"form-control  "
                         + (!string.IsNullOrEmpty(attr.Class) ? attr.Class : "") + "\">";
            if (attr.HasDefaultOption)
            {
                var ph = "";
                if (attr.PlaceHolder.HasValue())
                {
                    ph = attr.PlaceHolder;
                }
                else if (attr.Obj != null)
                {
                    ph = "Chọn " + attr.Obj.Name.ToLower();
                }
                else
                {
                    ph = "Chọn " + attr.Title.ToLower();
                }
                select += "<option value=\"\">" + ph + "</option>";
            }

            var arrValue = attr.MultiSelect && attr.Value.HasValue() ? attr.Value.Split(',').ToArray() : new string[] { };
            foreach (var option in attr.List)
            {
                if (attr.MultiSelect && arrValue.Contains(option.Value))
                {
                    select += "<option selected=\"\"  value=\"" + option.Value + "\">" + option.Text + "</option>";
                }
                else if (option.Value == attr.Value)
                {
                    select += "<option selected=\"\"  value=\"" + option.Value + "\">" + option.Text + "</option>";
                }
                else
                {
                    select += "<option value=\"" + option.Value + "\">" + option.Text + "</option>";
                }
            }
            select += "</select>";

            if (attr.HasViewMoreBtn)
            {
                control += "<div class=\"input-group input-group-sm\">" + select +
                        "<span class=\"input-group-addon\">" +
                        "<button title=\"Xem thêm " + attr.Title.ToLower() + "\" " +
                        "data-loading-text=\"<i class='icon-spinner10 fa-spin '></i>\" " +
                        "class=\"btn btn-default view-more-" + attr.Name + "\" type=\"button\">" +
                        "<i class=\"icon-more2\"></i>" +
                        "</button>" +
                        "</span>" +
                        "</div>";
            }
            else if (attr.HasViewLink.HasValue())
            {
                html += "<div class=\"input-group input-group-sm input-group-select2\">" + select +
                        "<span class=\"input-group-addon\">" +
                        "<a target=\"_blank\"  href=\"" + attr.HasViewLink + "\"  title=\"Danh mục " + attr.Title.ToLower() + "\" " +
                        "class=\"btn btn-link view-more-link\">Danh mục</a>" +
                        "</span>" +
                        "</div>";
            }
            else
            {
                control += select;
            }

            if (attr.OnlyControl)
            {
                return new HtmlString(control);
            }
            html += control + "</div></div>";
            return new HtmlString(html);
        }
        public static HtmlString Radio(ControlAttribute attr)
        {
            return new HtmlString("<div class=\"form-group\" style=\"" + (attr.Style.HasValue() ? attr.Style : "") + "\">"
                                     + "<div class=\"radio " + (attr.Right ? "radio-right" : "") + " \">"
                                     + "<input " + (attr.Disable ? "disabled=\"\"" : "") + " id=\"id" + attr.Name + attr.Value + "\" " + (attr.Check ? "checked=\"\"" : "") + " type=\"radio\" name=\"" + attr.Name + "\" class=\"styled\" value=\"" + attr.Value + "\" />"
                                     + "<label for=\"id" + attr.Name + attr.Value + "\">" + attr.Title + "</label>"

                                     + "</div>"
                                     + "</div>");
        }
        public static HtmlString RadioInline(ControlAttribute attr)
        {
            var html = "<label class=\"radio-inline " + (attr.Right ? "radio-right" : "") + "\">";
            if (!string.IsNullOrEmpty(attr.Summary))
            {
                html += "<p>" + attr.Summary + "</p>";
            }

            html += "<input " + (attr.Disable ? "disabled=\"\"" : "") + " id=\"id" + attr.Name + attr.Value + "\" " +
                    (attr.Check ? "checked=\"\"" : "") + " type=\"radio\" name=\"" + attr.Name +
                    "\" class=\"styled\" value=\"" + attr.Value + "\" />"
                    + attr.Title
                    + "</label>";
            return new HtmlString(html);
        }
        public static HtmlString Datepicker(ControlAttribute attr)
        {
            var control = "<div class=\"input-group\"><input placeholder=\"" + attr.Title +
                          "\" class=\"form-control bootstrap-datepicker\" type=\"text\" name=\"" + attr.Name +
                          "\" value=\"" + attr.Value + "\" />"
                          + "<span class=\"input-group-addon\"><i class=\"fa fa-calendar\"></i></span>"
                          + "</div>";
            if (attr.OnlyControl)
            {
                return new HtmlString(control);
            }
            var html = "<div class=\"form-group\">"
                       + "<label class=\"control-label\">" + attr.Title +
                       (attr.Required ? " <span class=\"text-danger\">*</span>" : "") + "</label>";
            if (!string.IsNullOrEmpty(attr.Summary))
            {
                html += "<p>" + attr.Summary + "</p>";
            }
            html += control + "</div>";
            return new HtmlString(html);
        }

        public static string IdImage(string type, int media, int id, string thumbSize, string name)
        {
            var p = "/media" + (media > 0 ? media + "" : "") + "/" + type + "/";
            var fname = name.Contains(".jpg") ? name : name + ".jpg";
            if (id >= 100)
            {
                var idname = id + "";
                var i = 1;
                while (i < idname.Length - 1)
                {
                    p += idname.Substring(0, i) + "/";
                    i++;
                }
            }
            p += id + "/" + fname;

            if (!string.IsNullOrEmpty(thumbSize))
            {
                p += ".thumb/" + thumbSize + ".jpg";
            }

            return p;
        }
        public static string GuidImage(string type, int media, Guid id)
        {
            var idStr = id.ToString();
            var p = "/media" + (media > 0 ? media + "" : "") + "/" + type + "/";
            var fname = idStr + ".jpg";
            p += idStr[0] + "/" + fname;

            var fp = FileComponent.GetFullPath(p);
            if (File.Exists(fp))
            {
                return p;
            }

            return "/assets/file/default-user.png";
        }
        public static string DateImage(string type, int media, DateTime date, int id, string thumbSize, string name)
        {
            var p = "/media" + (media > 0 ? media + "" : "") + "/" + type + "/";
            var fname = name.Contains(".jpg") ? name : name + ".jpg";

            p = FileComponent.DateFolder(p, date) + "/" + id + "/" + fname;

            if (!string.IsNullOrEmpty(thumbSize))
            {
                p += ".thumb/" + thumbSize + ".jpg";
            }
            return p;
        }
        public static string GuidImage(string type, int media, string guid, string thumbSize, string name)
        {
            var p = "/media" + (media > 0 ? media + "" : "") + "/" + type + "/";
            var fname = name.Contains(".jpg") ? name : name + ".jpg";
            p += guid[0] + "/" + guid[1] + "/" + guid[2] + "/" + guid.Substring(0, 8) + "/" + fname;

            if (!string.IsNullOrEmpty(thumbSize))
            {
                p += "/thumb/" + thumbSize + ".jpg";
            }

            return p;
        }
        public static string Avatar(int id, string media)
        {
            var c = id + "";
            return "/" + media + "/agents/" + (c.Length > 1 ? c.Substring(0, 2) : c[0] + "") + "/" + c + "/avatar.jpg";
        }
        public static string Cover(int id, string media, string type)
        {
            var c = id + "";
            return "/" + media + "/" + type + "/" + (c.Length > 1 ? c.Substring(0, 2) : c[0] + "") + "/" + c + "/cover.jpg";
        }
        public static string Logo(int id, string media)
        {
            var c = id + "";
            return "/" + media + "/shops/" + (c.Length > 1 ? c.Substring(0, 2) : c[0] + "") + "/" + c + "/logo.jpg";
        }
        public static bool InRole(int role, int rol)
        {
            return role == (int)rol;
        }

        public static HtmlString Pagination(int total, int? page, int limit, string path)
        {
            var p = "";
            if (total > 0)
            {
                p = "<nav><ul class=\"pagination\">";
                page = page ?? 1;
                var spi = 1;
                var numPage = total / limit;
                if (total % limit != 0)
                {
                    numPage++;
                }
                if (page.Value <= 4)
                {
                    spi = 1;
                }
                else if (page.Value >= numPage - 3)
                {
                    spi = numPage - 6;
                }
                else
                {
                    spi = page.Value - 3;
                }

                var len = spi + (numPage < 7 ? numPage : 7);
                if (len > 1)
                {
                    if (page.Value > 1)
                    {
                        p += "<li><a href=\"" + path + "\">Trang đầu</a></li>";
                    }
                    for (var i = spi; i < len; i++)
                    {
                        p += i == page.Value ? "<li class=\"active\">" : "<li>";
                        p += "<a href=\"" + path + "&page=" + i + "\" >" + i + "</a></li>";
                    }
                    if (page.Value < len - 1)
                    {
                        p += "<li><a href=\"" + path + "&page=" + (numPage - 1) + "\">Trang cuối</a></li>";
                    }
                }
                p += "</ul></nav>";
            }
            return new HtmlString(p);
        }

        public static HtmlString NavbarTools(string[] tools)
        {
            var html = "";
            foreach (var t in tools)
            {
                switch (t)
                {
                    case "add":
                        {
                            html +=
                                "<li>" +
                                "<button class=\"btn btn-add bg-primary text-white\"" +
                                "data-loading-text=\"<i class='icon-spinner10 fa-spin position-left'></i> Thêm mới \">" +
                                "<i class=\"icon-plus3 position-left\"></i> Thêm mới</button></li>";
                        }
                        break;
                    case "edit":
                        {
                            html +=
                                "<li><button class=\"btn btn-edit btn-default\"" +
                                "data-loading-text=\"<i class='icon-spinner10 fa-spin position-left'></i> Cập nhật\">" +
                                "<i class=\"icon-pencil7 position-left text-warning\"></i> Cập nhật</button></li>";
                        }
                        break;
                    case "delete":
                        {
                            html +=
                                "<li><button class=\"btn btn-delete btn-default\"" +
                                "data-loading-text=\"<i class='icon-spinner10 fa-spin position-left'></i> Xóa\">" +
                                "<i class=\"icon-x position-left text-danger\"></i> Xóa</button></li>";
                        }
                        break;
                    case "reload":
                        {
                            html +=
                                "<li><button class=\"btn btn-reload btn-default\">" +
                                "<i class=\"icon-loop3 position-left text-slate-400 position-left\"></i> Tải lại</button></li>";
                        }
                        break;
                    case "export":
                        {
                            html +=
                                "<li><button class=\"btn btn-export btn-default\">" +
                                "<i class=\"icon-file-excel position-left text-success position-left\"></i> Xuất file</button></li>";
                        }
                        break;
                }
            }

            return new HtmlString(html);
        }

        public static HtmlString InputThumbnail(ControlAttribute attr)
        {
            var st = attr.Style.HasValue() ? attr.Style : "";

            var html = "<div class=\"input-with-thumb\" >" +
                       "<div class=\"thumbnail\">" +
                       "<div class=\"thumb\">" +
                        "<img style=\"" + st + "\" src=\"" + (attr.Value.HasValue() ? attr.Value : "/media/default/img.png") + "\" />"
                       + "</div>" +
                       "<div class=\"loading\"><i class=\"icon-spinner10 spinner\"></i></div>" +
                       "<button type=\"button\" class=\"btn btn-default btn-sx btn-remove\">" +
                       "<i class=\"icon-x text-danger\"></i></button>" +
                       "</div>";
            html += "<div class=\"inputs\">"
                        + "<input  name=\"" + attr.Name + "PostFileBase\" type=\"file\" />"
                        + "<input value=\"" + attr.Value + "\" name=\"" + attr.Name + "Uploaded\" type=\"hidden\" />"
                        + "<button type=\"button\" class=\"btn btn-default btn-sx btn-block btn-select\"><i class=\"icon-image2 text-primary position-left\"></i>Chọn file</button>"

                        +
                    "</div>" +
                "</div>";
            return new HtmlString(html);
        }

        public static HtmlString ImageCropper(ControlAttribute attr)
        {
            var img = attr.Value.HasValue() ? attr.Value : "/assets/file/default-user.png";
            var html = "<div class=\"input-with-thumb  input-image-cropper\" >" +
                       "<div class=\"thumbnail\">" +
                       "<div class=\"thumb\"><img src=\"" + img + "\" style=\"" + (attr.Style.HasValue() ? attr.Style : "") + "\" />"
                       + "</div></div>";
            html += "<div class=\"inputs\">"
                    + "<input  name=\"" + attr.Name + "\" value=\"" + attr.Value + "\" type=\"hidden\" />"
                    + "<button type=\"button\" class=\"btn btn-default btn-sx btn-block\"" +
                    "data-loading-text=\"<i class='icon-spinner4 fa-spin position-left'></i>Chọn file\">" +
                    "<i class=\"icon-image2 text-primary position-left\"></i>Chọn file</button>"
                    + "</div></div>";
            return new HtmlString(html);
        }

        public static HtmlString CompareChange(string title, string v1, string v2)
        {
            var html = "";
            v1 = v1.HasValue() ? v1 : "";
            v2 = v2.HasValue() ? v2 : "";
            if (v1 != v2)
            {
                html += "<tr><td>" + title + "</td>" +
                        "<td class=\"text-bold text-danger\">" + v1 + "</td>" +
                        "<td class=\"text-bold text-danger\">" + v2 + "</td>" +
                        "</tr>";
            }
            return new HtmlString(html);
        }
        public static HtmlString Button(ControlAttribute attr)
        {
            var str = "<button class=\"btn btn-sm btn-rounded " + attr.Class + "\"  type=\"button\" id=\"" + attr.Id + "\"" +
                     "data-loading-text=\"<i class='icon-spinner4 fa-spin position-left'></i>" + attr.Title + "\">"
                + "<i class=\"" + attr.Icon + " position-left\"></i>" + attr.Title +
                "</button>";
            return new HtmlString(str);
        }

        public static HtmlString Gallery(ControlAttribute attr)
        {
            var html = "<div class=\"form-group form-group-sm\">"
                       + "<label class=\"control-label col-md-12\">" + attr.Title + "</label>" +
                       "<div class=\"col-md-12\"> " +
                            "<div class=\"media-selector multiple mt-10 mb-10\" template=\"image\" type=\"multiple\" attrname=\"" + attr.Name + "\" data=\"" + attr.Value + "\" id=\"" + StringComponent.Guid(20) + "\"></div>" +
                       "</div>" +
                       "</div>";

            return new HtmlString(html);
        }
        public static HtmlString GalleryInline(ControlAttribute attr)
        {
            var html = "<div class=\"form-group form-group-sm\">"
                       + "<label class=\"control-label  " + GenLabelCol(attr) + "\">" + attr.Title + "</label>" +
                       "<div class=\" " + GenControlCol(attr) + "\"> " +
                       "<div class=\"media-selector multiple mb-10\" template=\"image\" type=\"multiple\" attrname=\"" + attr.Name + "\" data=\"" + attr.Value + "\" id=\"" + StringComponent.Guid(20) + "\"></div>" +
                       "</div>" +
                       "</div>";

            return new HtmlString(html);
        }

        public static HtmlString EmpMedia(EmpMediaModel e)
        {
            var html = "";

            if (e.Link.HasValue())
            {
                html += "<a href=\"" + e.Link + "\" ";
            }
            else
            {
                html += "<div ";
            }

            var w = "auto";
            var bw = "auto";
            if (e.Width.HasValue)
            {
                w = e.Width + "px";
                bw = (e.Width - 59) + "px";
            }
            html += "class=\"media media-emp-base\" style=\"width:" + w + "\" > ";

            html += "<div class=\"media-left\">" +
            "<div class=\"img-circle\">" +
            "<img data-src=\"" + e.Image + "\" class=\" lazy\" alt=\"\" src=\"/assets/file/1px.svg\" style=\"height: auto; max-height: 60px\">" +
                "</div></div><div class=\"media-body\">" +
                "<h6 class=\"media-heading text-bold\">" + e.Name + "</h6>" +
                "<span class=\"text-muted ell\" style=\"width:" + bw + "\">" + e.Sub1 + "</span>" +
                "<span class=\"text-muted ell\" style=\"width:" + bw + "\">" + e.Sub2 + "</span>" +
                "</div>";

            html += e.Link.HasValue() ? "</a>" : "</div>";

            return new HtmlString(html);
        }
    }
}