using Microsoft.VisualBasic;
using NPOI.HSSF.UserModel;
using NPOI.SS.Formula.Functions;
using NPOI.SS.UserModel;
using NPOI.SS.Util;
using NPOI.XSSF.UserModel;
using Service.Utility.Variables;
using System.Data;
using System.Globalization;
using System.Reflection.Metadata.Ecma335;
using System.Web;

namespace Service.Utility.Components
{
    public class ExcelBackgroundOption
    {
        public short Index { get; set; }
        public int Red { get; set; }
        public int Green { get; set; }
        public int Blue { get; set; }
    }

    public enum ImportDataType
    {
        Int,
        Decimal,
        String,
        Double,
        Date,
        Option
    }

    public class HeadCell
    {
        public string Text { get; set; }
        public int Width { get; set; }
        public int RowSpan { get; set; }
        public int ColSpan { get; set; }
    }

    public class ExcelStyleOption
    {
        public HorizontalAlignment? Halign { get; set; }
        public VerticalAlignment? Valign { get; set; }
        public BorderStyle? Border { get; set; }
        public string Font { get; set; }
        public short? FontColor { get; set; }
        public short? FontSize { get; set; }
        public bool IsBold { get; set; }
        public bool? WrapText { get; set; }
        public ExcelBackgroundOption Background { get; set; }
        public bool IsCurrency { get; set; }
        public bool CustomBorder { get; set; }
        public bool BorderLeft { get; set; }
        public bool BorderRight { get; set; }
        public bool BorderBottom { get; set; }
        public bool BorderTop { get; set; }

    }
    public static class ExcelStaticComponent
    {
        public static void SetBorder(this ICellStyle style, BorderStyle b)
        {
            style.BorderTop = b;
            style.BorderBottom = b;
            style.BorderLeft = b;
            style.BorderRight = b;
        }

        public static void AddCell(this IRow row, int col, string value, ICellStyle style = null)
        {
            var c = row.CreateCell(col);

            if (style != null)
            {
                c.CellStyle = (HSSFCellStyle)style;
            }
            c.SetCellValue(value);
            if (style != null)
            {
                if (style.WrapText)
                {
                    c.CellStyle.WrapText = style.WrapText;
                }
            }
        }

        public static void AddCell(this IRow row, int col, double value, ICellStyle style = null)
        {
            var c = row.CreateCell(col);

            if (style != null)
            {
                c.CellStyle = (HSSFCellStyle)style;
            }
            c.SetCellValue(value);
            if (style != null)
            {
                if (style.WrapText)
                {
                    c.CellStyle.WrapText = style.WrapText;
                }
            }
        }
        public static void AddCell(this IRow row, int col, int value, ICellStyle style = null)
        {
            var c = row.CreateCell(col);

            if (style != null)
            {
                c.CellStyle = (HSSFCellStyle)style;
            }
            c.SetCellValue(value);
            if (style != null)
            {
                if (style.WrapText)
                {
                    c.CellStyle.WrapText = style.WrapText;
                }
            }
        }
        public static void AddCell(this IRow row, int col, DateTime value, ICellStyle style = null)
        {
            var c = row.CreateCell(col);

            if (style != null)
            {
                c.CellStyle = (HSSFCellStyle)style;
            }
            c.SetCellValue(value);
            if (style != null)
            {
                if (style.WrapText)
                {
                    c.CellStyle.WrapText = style.WrapText;
                }
            }
        }
        public static void AddCell(this IRow row, int col, decimal value, ICellStyle style = null)
        {
            var c = row.CreateCell(col);

            if (style != null)
            {
                c.CellStyle = (HSSFCellStyle)style;
            }
            c.SetCellValue((double)value);
            if (style != null)
            {
                if (style.WrapText)
                {
                    c.CellStyle.WrapText = style.WrapText;
                }
            }
        }

        public static void EmptyCells(this IRow row, int start, int end, ICellStyle style = null)
        {
            for (int i = start; i <= end; i++)
            {
                var c = row.CreateCell(i);
                if (style != null)
                {
                    c.CellStyle = style;
                }
            }
        }

        public static string GetCellValue(this List<string> item, int col)
        {
            if (item[col] != "NULL")
            {
                var str = item[col];
                return str;
            }
            return "";
        }

        public static string GetCellValue(this List<string> item, int col, bool clearTime = false)
        {
            if (item[col] != "NULL")
            {
                var str = item[col].Optimize();

                if (clearTime)
                {
                    if (str.Contains(" "))
                    {
                        str = str.Substring(0, str.IndexOf(" ", StringComparison.CurrentCulture));
                    }
                }

                return str;
            }

            return "";
        }

        public static decimal GetDecimalValue(this List<string> item, int col)
        {
            if (item[col] != "NULL")
            {
                var str = item[col];
                if (str.Contains("&"))
                {
                    str = HttpUtility.HtmlDecode(str);
                    str = str.Replace(" ", "");
                }
                str = str.Replace("\t", " ").Replace("  ", " ");

                decimal n;
                bool isNumeric = decimal.TryParse(str, out n);
                if (isNumeric)
                    return n;
                return 0;
            }

            return 0;
        }

        public static string GetDateValue(this List<string> item, int c1, int c2, int c3)
        {
            if (item[c1] != "NULL" && item[c2] != "NULL" && item[c3] != "NULL" && item[c3] != "1900")
            {
                return item[c1] + "/" + item[c2] + "/" + item[c3];
            }

            return "";
        }

        public static string GetDateTimeValue(this List<string> item, int c1, int c2, int c3, int c4)
        {
            var str = "";
            if (item[c1] != "NULL" && item[c2] != "NULL" && item[c3] != "NULL" && item[c3] != "1900")
            {
                str = item[c1] + "/" + item[c2] + "/" + item[c3];

                if (item[c4] != "NULL")
                {
                    var v = item[c4];
                    if (v.Contains(":"))
                    {
                        var arr = v.Split(':').ToList();

                        if (arr.Count > 2)
                        {
                            arr = arr.Take(2).ToList();
                        }
                        if (arr.Count == 2)
                        {
                            if (arr[0].Length == 1)
                            {
                                arr[0] = "0" + arr[0];
                            }
                            if (arr[1].Length == 1)
                            {
                                arr[1] = "0" + arr[1];
                            }
                            str += " " + arr[0] + ":" + arr[1];
                        }
                    }
                }
            }

            return str;
        }

        public static DateTime? GetExcelDate(this List<string> item, int dd, int mm, int yyyy)
        {
            var fo = new List<string>() { "dd/MM/yyyy", "d/MM/yyyy", "d/M/yyyy", "dd/M/yyyy" };

            var v = GetDateValue(item, dd, mm, yyyy);

            var d = v.StringToDateTime(fo, "vn");
            if (d.HasValue)
            {
                return d.Value;
            }
            return null;
        }

        public static DateTime? GetExcelDateTime(this List<string> item, int dd, int mm, int yyyy, int hhmm)
        {
            var fo = new List<string>() { "dd/MM/yyyy HH:mm", "d/MM/yyyy HH:mm", "d/M/yyyy HH:mm", "dd/M/yyyy HH:mm" };

            var v = GetDateTimeValue(item, dd, mm, yyyy, hhmm);

            var d = v.StringToDateTime(fo, "vn");
            if (d.HasValue)
            {
                return d.Value;
            }
            return null;
        }

        public static string IsExcelValidCol(string v, string name, ImportDataType t, bool required, List<BaseItem> options)
        {
            if (!v.HasValue())
            {
                if (required)
                {
                    return name + " không được rỗng";
                }
                return null;
            }

            v = v.Optimize();

            switch (t)
            {
                case ImportDataType.Option:
                    {
                        if (options != null)
                        {
                            var o = options.Any(x => x.Name == v);
                            if (!o)
                            {
                                return name + " (" + v + ") không hợp lệ";
                            }
                        }
                        break;
                    }
                case ImportDataType.Date:
                    {
                        var f = new List<string>() { "dd/MM/yyyy", "d/MM/yyyy", "d/M/yyyy", "dd/M/yyyy" };
                        var ft = "DD/MM/YYYY";

                        var d = v.StringToDateTime(f, "vn");
                        if (!d.HasValue)
                        {
                            return name + " (" + v + "): định dạng ngày chưa đúng " + ft;
                        }
                    }
                    break;
                case ImportDataType.Decimal:
                    {
                        decimal output;

                        if (!decimal.TryParse(v, out output))
                        {
                            return name + " (" + v + ") không hợp lệ ";
                        }
                    }
                    break;
                case ImportDataType.Double:
                    {
                        double output;

                        if (!double.TryParse(v, out output))
                        {
                            return name + " (" + v + ") không hợp lệ ";
                        }
                    }
                    break;
                case ImportDataType.Int:
                    {
                        int output;

                        if (!int.TryParse(v, out output))
                        {
                            return name + " (" + v + ") không hợp lệ ";
                        }
                    }
                    break;
            }

            return null;
        }
    }
    public class ExcelComponent
    {
        public HSSFWorkbook Hwb { get; set; }
        public XSSFWorkbook Xwb { get; set; }
        public ISheet Sheet { get; set; }
        public string Ext { get; set; }

        public ExcelComponent()
        {
            Hwb = new HSSFWorkbook();
            Xwb = new XSSFWorkbook();
            Sheet = Hwb.CreateSheet("Sheet1");
        }

        public ExcelComponent(string filePath)
        {
            if (File.Exists(filePath))
            {
                Ext = Path.GetExtension(filePath);
                if (!string.IsNullOrEmpty(Ext))
                {
                    Ext = Ext.ToLower();
                    if (Ext.ToLower() == ".xls")
                    {
                        using (FileStream file = new FileStream(filePath, FileMode.Open, FileAccess.Read))
                        {
                            Hwb = new HSSFWorkbook(file);
                        }

                        if (Hwb.NumberOfSheets > 0)
                        {
                            Sheet = Hwb.GetSheetAt(0);
                        }

                        Xwb = new XSSFWorkbook();
                    }
                    else //.xlsx extension
                    {
                        using (FileStream file = new FileStream(filePath, FileMode.Open, FileAccess.Read))
                        {
                            Xwb = new XSSFWorkbook(file);
                        }
                        if (Xwb.NumberOfSheets > 0)
                        {
                            Sheet = Xwb.GetSheetAt(0);
                        }
                        Hwb = new HSSFWorkbook();
                    }
                }
            }
        }

        public IRow InsertRows(int rowIndex)
        {
            Sheet.ShiftRows(rowIndex, Sheet.LastRowNum, 1);

            IRow rowSource = Sheet.GetRow(rowIndex + 1);
            IRow rowInsert = Sheet.CreateRow(rowIndex);
            rowInsert.Height = rowSource.Height;
            for (int colIndex = 0; colIndex < rowSource.LastCellNum; colIndex++)
            {
                ICell cellSource = rowSource.GetCell(colIndex);
                ICell cellInsert = rowInsert.CreateCell(colIndex);
                if (cellSource != null)
                {
                    cellInsert.CellStyle = cellSource.CellStyle;
                }
            }

            return rowInsert;
        }

        public List<SelectValue> GetSheets()
        {
            var sheets = new List<SelectValue>();
            if (Ext == ".xls")
            {
                for (int i = 0; i < Hwb.NumberOfSheets; i++)
                {
                    var s = Hwb.GetSheetAt(i);
                    sheets.Add(new SelectValue()
                    {
                        Id = i,
                        Text = s.SheetName
                    });
                }
            }
            else
            {
                for (int i = 0; i < Xwb.NumberOfSheets; i++)
                {
                    var s = Xwb.GetSheetAt(i);
                    sheets.Add(new SelectValue()
                    {
                        Id = i,
                        Text = s.SheetName
                    });
                }
            }
            return sheets;
        }

        public void SetActiveSheet(int index)
        {
            Sheet = Ext == ".xls" ? Hwb.GetSheetAt(index) : Xwb.GetSheetAt(index);
        }

        public ICellStyle SetFont(ICellStyle style, string fontName, short fontHeightInPoints, bool isBold)
        {
            HSSFFont f = Ext == ".xls" ? (HSSFFont)Hwb.CreateFont() : (HSSFFont)Xwb.CreateFont();
            f.FontHeightInPoints = fontHeightInPoints;
            f.FontName = fontName;
            f.IsBold = isBold;
            style.SetFont(f);
            return style;
        }

        public IRow AddRow(int index)
        {
            var r = Sheet.CreateRow(index);
            return r;
        }

        public ICellStyle SetBackground(ICellStyle style, short index, int red, int green, int blue)
        {
            HSSFPalette p = Hwb.GetCustomPalette();
            p.SetColorAtIndex(index, (byte)red, (byte)green, (byte)blue);
            style.FillForegroundColor = index;
            style.FillPattern = FillPattern.SolidForeground;
            return style;
        }

        public ICellStyle CreateStyle(ExcelStyleOption option)
        {
            var style = Hwb.CreateCellStyle();
            if (option.Halign.HasValue)
            {
                style.Alignment = option.Halign.Value;
            }

            if (option.Valign.HasValue)
            {
                style.VerticalAlignment = option.Valign.Value;
            }

            if (option.WrapText.HasValue)
            {
                style.WrapText = option.WrapText.Value;
            }
            if (!option.CustomBorder)
            {
                if (option.Border.HasValue)
                {
                    style.BorderTop = option.Border.Value;
                    style.BorderBottom = option.Border.Value;
                    style.BorderLeft = option.Border.Value;
                    style.BorderRight = option.Border.Value;
                }
            }
            else
            {
                if (option.BorderLeft)
                {
                    style.BorderLeft = option.Border.Value;
                }
                if (option.BorderRight)
                {
                    style.BorderRight = option.Border.Value;
                }
                if (option.BorderBottom)
                {
                    style.BorderBottom = option.Border.Value;
                }
                if (option.BorderTop)
                {
                    style.BorderTop = option.Border.Value;
                }
            }


            if (option.Background != null)
            {
                HSSFPalette p = Hwb.GetCustomPalette();
                p.SetColorAtIndex(option.Background.Index, (byte)option.Background.Red, (byte)option.Background.Green, (byte)option.Background.Blue);

                style.FillForegroundColor = option.Background.Index;
                style.FillPattern = FillPattern.SolidForeground;
            }
            if (option.IsCurrency)
            {
                style.DataFormat = Hwb.CreateDataFormat().GetFormat("#,##0");
            }
            HSSFFont f = (HSSFFont)Hwb.CreateFont();
            if (!string.IsNullOrEmpty(option.Font))
            {
                f.FontName = option.Font;
            }

            if (option.FontSize.HasValue)
            {
                f.FontHeightInPoints = option.FontSize.Value;
            }

            if (option.FontColor.HasValue)
            {
                f.Color = option.FontColor.Value;
            }

            f.IsBold = option.IsBold;
            style.SetFont(f);

            return style;
        }

        public List<string> GetColumns(int index)
        {
            IRow headerRow = Sheet.GetRow(index - 1);
            var lst = new List<string>();
            int colCount = headerRow.LastCellNum;
            for (int c = 0; c < colCount; c++)
            {
                lst.Add(headerRow.GetCell(c).ToString());
            }

            return lst;
        }

        /// <summary>
        /// Lấy vùng merge chứa ô (nếu có)
        /// </summary>
        public CellRangeAddress GetMergedRegion(int rowIndex, int colIndex)
        {
            for (int i = 0; i < Sheet.NumMergedRegions; i++)
            {
                var range = Sheet.GetMergedRegion(i);
                if (rowIndex >= range.FirstRow && rowIndex <= range.LastRow &&
                    colIndex >= range.FirstColumn && colIndex <= range.LastColumn)
                {
                    return range;
                }
            }
            return null;
        }

        /// <summary>
        /// Trả về true nếu ô nằm trong vùng merge
        /// </summary>
        public bool IsMergedCell(int rowIndex, int colIndex)
        {
            return GetMergedRegion(rowIndex, colIndex) != null;
        }
        /// <summary>
        /// Lấy số cột merge của ô
        /// </summary>
        public int GetMergedColumnCount(int rowIndex, int colIndex)
        {
            var range = GetMergedRegion(rowIndex, colIndex);
            if (range != null)
            {
                return (range.LastColumn - range.FirstColumn + 1);
            }
            return 1; // Không merge -> chỉ có 1 cột
        }
        /// <summary>
        /// Lấy số dòng merge của ô
        /// </summary>
        public int GetMergedRowCount(int rowIndex, int colIndex)
        {
            var range = GetMergedRegion(rowIndex, colIndex);
            if (range != null)
            {
                return (range.LastRow - range.FirstRow + 1);
            }
            return 1; // Không merge -> chỉ có 1 dòng
        }

        /// <summary>
        /// Lấy thông tin merge (FirstRow, LastRow, FirstColumn, LastColumn)
        /// </summary>
        public (int FirstRow, int LastRow, int FirstColumn, int LastColumn)?
            GetMergedInfo(ISheet sheet, int rowIndex, int colIndex)
        {
            var range = GetMergedRegion(rowIndex, colIndex);
            if (range != null)
            {
                return (range.FirstRow, range.LastRow, range.FirstColumn, range.LastColumn);
            }
            return null;
        }

        public List<object> GetHeaderColumns(int index, int? colIndex)
        {
            string dateFormat = "yyyy-MM-dd HH:mm:ss";

            int rowCount = Sheet.LastRowNum + 1;

            var lst = new List<object>();

            for (int i = 0; i < rowCount; i++)
            {
                if (i == index - 1) continue;

                var row = Sheet.GetRow(i);
                if (row == null) continue;

                var obj = new List<HeadCell>();
                int cc = colIndex ?? row.LastCellNum;

                for (int j = 0; j < cc; j++)
                {
                    var cell = row.GetCell(j);
                    if (cell == null)
                    {
                        obj.Add(new HeadCell
                        {
                            Text = "NULL"
                        });
                        continue;
                    }

                    string val = GetCellString(cell, dateFormat, false);

                    var hc = new HeadCell
                    {
                        Text = val,
                        ColSpan = 1,
                        RowSpan = 1
                    };

                    int widthUnits = (int)Sheet.GetColumnWidth(j); // đơn vị 1/256 ký tự
                    double px = (widthUnits / 256.0) * 7 + 5; // quy đổi sang px
                    hc.Width = (int)Math.Round(px); 

                    if (IsMergedCell(i, j))
                    {
                        int colSpan = GetMergedColumnCount(i, j);
                        int rowSpan = GetMergedRowCount(i, j);
                        hc.ColSpan = colSpan;
                        hc.RowSpan = rowSpan;
                    }
                    obj.Add(hc);
                }

                lst.Add(obj);
            }

            return lst;
        }

        public List<object> GetDataRows(int headIndex, int? cols, List<int> dateColumns = null, string dateFormat = "yyyy-MM-dd HH:mm:ss")
        {
            int rowCount = Sheet.LastRowNum + 1;
            dateColumns ??= new List<int>();

            var lst = new List<object>();

            for (int i = 0; i < rowCount; i++)
            {
                if (i == headIndex - 1) continue;

                var row = Sheet.GetRow(i);
                if (row == null) continue;

                var obj = new List<string>();
                int cc = cols ?? row.LastCellNum;

                for (int j = 0; j < cc; j++)
                {
                    var cell = row.GetCell(j);
                    if (cell == null)
                    {
                        obj.Add("NULL");
                        continue;
                    }

                    // Nếu cột được ép kiểu ngày thì forceDate = true
                    bool forceDate = dateColumns.Contains(j);

                    string val = GetCellString(cell, dateFormat, forceDate);
                    obj.Add(val);
                }

                lst.Add(obj);
            }

            return lst;
        }

        /// <summary>
        /// Helper đọc giá trị cell thành string.
        /// </summary>
        private static string GetCellString(ICell cell, string dateFormat, bool forceDate = false)
        {
            if (cell == null) return "";

            try
            {
                // nếu bắt buộc coi là ngày
                if (forceDate)
                {
                    if ((cell.CellType == CellType.Numeric ||
                         (cell.CellType == CellType.Formula && cell.CachedFormulaResultType == CellType.Numeric))
                        && DateUtil.IsCellDateFormatted(cell))
                    {
                        DateTime? dt = cell.DateCellValue; // DateCellValue có thể là DateTime?
                        if (dt.HasValue) return dt.Value.ToString(dateFormat);
                        // fallback: convert từ OADate nếu DateCellValue null (ít khi xảy ra)
                        return DateTime.FromOADate(cell.NumericCellValue).ToString(dateFormat);
                    }

                    if (cell.CellType == CellType.String &&
                        DateTime.TryParse(cell.StringCellValue, out DateTime parsedForced))
                    {
                        return parsedForced.ToString(dateFormat);
                    }
                }

                switch (cell.CellType)
                {
                    case CellType.Numeric:
                        if (DateUtil.IsCellDateFormatted(cell))
                        {
                            DateTime? dt = cell.DateCellValue;
                            if (dt.HasValue) return dt.Value.ToString(dateFormat);
                            return DateTime.FromOADate(cell.NumericCellValue).ToString(dateFormat);
                        }
                        return cell.NumericCellValue.ToString(CultureInfo.InvariantCulture);

                    case CellType.String:
                        var s = cell.StringCellValue;
                        if (DateTime.TryParse(s, CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime parsed))
                            return parsed.ToString(dateFormat);
                        // nếu muốn thử thêm các format cụ thể, dùng TryParseExact ở đây
                        return s;

                    case CellType.Boolean:
                        return cell.BooleanCellValue ? "TRUE" : "FALSE";

                    case CellType.Formula:
                        switch (cell.CachedFormulaResultType)
                        {
                            case CellType.Numeric:
                                if (DateUtil.IsCellDateFormatted(cell))
                                {
                                    DateTime? dt = cell.DateCellValue;
                                    if (dt.HasValue) return dt.Value.ToString(dateFormat);
                                    return DateTime.FromOADate(cell.NumericCellValue).ToString(dateFormat);
                                }
                                return cell.NumericCellValue.ToString(CultureInfo.InvariantCulture);

                            case CellType.String:
                                return cell.StringCellValue;

                            case CellType.Boolean:
                                return cell.BooleanCellValue ? "TRUE" : "FALSE";

                            default:
                                return "";
                        }

                    default:
                        return cell.ToString();
                }
            }
            catch
            {
                return cell?.ToString() ?? "";
            }
        }

        private static bool TryGetDateFromCell(ICell cell, out DateTime dt)
        {
            dt = default;
            if (cell == null) return false;

            try
            {
                // numeric (hoặc formula trả về numeric) và được Excel định dạng date
                if ((cell.CellType == CellType.Numeric ||
                     (cell.CellType == CellType.Formula && cell.CachedFormulaResultType == CellType.Numeric))
                    && DateUtil.IsCellDateFormatted(cell))
                {
                    var maybe = cell.DateCellValue; // DateTime?
                    if (maybe.HasValue)
                    {
                        dt = maybe.Value;
                        return true;
                    }

                    // fallback: convert from OADate nếu DateCellValue null
                    try
                    {
                        dt = DateTime.FromOADate(cell.NumericCellValue);
                        return true;
                    }
                    catch { /* ignore */ }
                }

                // string (hoặc formula trả về string) — thử parse
                string s = null;
                if (cell.CellType == CellType.String ||
                    (cell.CellType == CellType.Formula && cell.CachedFormulaResultType == CellType.String))
                {
                    s = cell.StringCellValue;
                }

                if (!string.IsNullOrWhiteSpace(s))
                {
                    if (DateTime.TryParse(s, CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsed))
                    {
                        dt = parsed;
                        return true;
                    }

                    var formats = new[] {
                "dd/MM/yyyy","d/M/yyyy","yyyy-MM-dd","yyyy/MM/dd",
                "MM/dd/yyyy","M/d/yyyy","dd-MM-yyyy","yyyyMMdd"
            };
                    if (DateTime.TryParseExact(s, formats, CultureInfo.InvariantCulture, DateTimeStyles.None, out parsed))
                    {
                        dt = parsed;
                        return true;
                    }
                }
            }
            catch
            {
                // swallow, return false
            }

            return false;
        }

        public List<object> GetDataRows(int rowFrom, int colFrom, int colTo, List<int> dateColumns = null)
        {
            const string dateFormat = "yyyy-MM-dd HH:mm:ss"; // tuỳ chỉnh nếu muốn
            DataTable dt = new DataTable();
            int rowCount = Sheet.LastRowNum + 1;
            dateColumns ??= new List<int>();

            List<object> lst = new List<object>();

            for (int i = rowFrom; i < rowCount; i++)
            {
                var row = Sheet.GetRow(i);
                if (row == null) continue;

                var obj = new List<string>();

                for (int j = colFrom; j <= colTo; j++)
                {
                    var cell = row.GetCell(j);

                    if (cell == null)
                    {
                        obj.Add("NULL");
                        continue;
                    }

                    try
                    {
                        // Nếu cột này được đánh dấu là cột ngày
                        if (dateColumns.Contains(j))
                        {
                            if (TryGetDateFromCell(cell, out DateTime dateVal))
                            {
                                // kiểm tra năm giống logic cũ của bạn
                                if (dateVal.Year >= 1900 && dateVal.Year <= 2100)
                                {
                                    obj.Add(dateVal.ToString(dateFormat));
                                }
                                else
                                {
                                    // nếu năm bất thường — fallback sang numeric nếu có
                                    if (cell.CellType == CellType.Numeric || (cell.CellType == CellType.Formula && cell.CachedFormulaResultType == CellType.Numeric))
                                        obj.Add(cell.NumericCellValue.ToString(CultureInfo.InvariantCulture));
                                    else
                                        obj.Add(dateVal.ToString(dateFormat)); // vẫn thêm nếu muốn
                                }
                            }
                            else
                            {
                                // không parse được ngày -> lấy string hoặc numeric làm fallback
                                if (cell.CellType == CellType.String)
                                    obj.Add(cell.StringCellValue);
                                else if (cell.CellType == CellType.Numeric || (cell.CellType == CellType.Formula && cell.CachedFormulaResultType == CellType.Numeric))
                                    obj.Add(cell.NumericCellValue.ToString(CultureInfo.InvariantCulture));
                                else
                                    obj.Add(cell.ToString());
                            }

                            continue;
                        }

                        // Nếu không phải cột ngày thì xử lý theo type bình thường
                        switch (cell.CellType)
                        {
                            case CellType.Numeric:
                                if (DateUtil.IsCellDateFormatted(cell))
                                {
                                    if (TryGetDateFromCell(cell, out DateTime date))
                                        obj.Add(date.ToString(dateFormat));
                                    else
                                        obj.Add(cell.NumericCellValue.ToString(CultureInfo.InvariantCulture));
                                }
                                else
                                {
                                    obj.Add(cell.NumericCellValue.ToString(CultureInfo.InvariantCulture));
                                }
                                break;

                            case CellType.String:
                                obj.Add(cell.StringCellValue);
                                break;

                            case CellType.Formula:
                                switch (cell.CachedFormulaResultType)
                                {
                                    case CellType.Numeric:
                                        if (DateUtil.IsCellDateFormatted(cell))
                                        {
                                            if (TryGetDateFromCell(cell, out DateTime d2))
                                                obj.Add(d2.ToString(dateFormat));
                                            else
                                                obj.Add(cell.NumericCellValue.ToString(CultureInfo.InvariantCulture));
                                        }
                                        else
                                        {
                                            obj.Add(cell.NumericCellValue.ToString(CultureInfo.InvariantCulture));
                                        }
                                        break;
                                    case CellType.Error:
                                        obj.Add("");
                                        break;
                                    case CellType.String:
                                        // nếu string có thể là số, thử parse
                                        if (double.TryParse(cell.StringCellValue, NumberStyles.Any, CultureInfo.InvariantCulture, out double n))
                                            obj.Add(n.ToString(CultureInfo.InvariantCulture));
                                        else
                                            obj.Add(cell.StringCellValue);
                                        break;
                                    case CellType.Boolean:
                                        obj.Add(cell.BooleanCellValue ? "TRUE" : "FALSE");
                                        break;
                                    default:
                                        obj.Add(cell.ToString());
                                        break;
                                }
                                break;

                            case CellType.Boolean:
                                obj.Add(cell.BooleanCellValue ? "TRUE" : "FALSE");
                                break;

                            default:
                                obj.Add("NULL");
                                break;
                        }
                    }
                    catch (Exception ex)
                    {
                        // debug fallback: trả về cell.ToString() để không vỡ luồng
                        obj.Add(cell.ToString());
                    }
                } // end columns

                lst.Add(obj);
            } // end rows

            return lst;
        }

        public void CreateDropDownListForExcel(IList<string> dropDownValues, int startRow, int lastRow, int column)
        {
            string dropDownName = Sheet.SheetName + "DropDownValuesForColumn" + column;
            ISheet hiddenSheet = Hwb.CreateSheet(dropDownName);

            for (int i = 0; i < dropDownValues.Count; i++)
            {
                IRow row = hiddenSheet.CreateRow(i);
                ICell cell = row.CreateCell(0);
                cell.SetCellValue(dropDownValues[i]);
            }

            IName namedCell = Hwb.CreateName();
            namedCell.NameName = dropDownName;
            namedCell.RefersToFormula = $"{dropDownName}!$A$1:$A${dropDownValues.Count}";

            DVConstraint constraint = DVConstraint.CreateFormulaListConstraint(dropDownName);
            CellRangeAddressList addressList = new CellRangeAddressList(startRow, lastRow, column, column);

            HSSFDataValidation validation = new HSSFDataValidation(addressList, constraint);

            int hiddenSheetIndex = Hwb.GetSheetIndex(hiddenSheet);
            Hwb.SetSheetHidden(hiddenSheetIndex, 1); // 0 = visible, 1 = hidden, 2 = very hidden

            Sheet.AddValidationData(validation);
        }

        public void Dispose()
        {
            Hwb = null;
            Xwb = null;
            Sheet = null;
        }
        //public void Export(string fileName, HttpResponseBase response)
        //{
        //    using (XLWorkbook wb = new XLWorkbook())
        //    {
        //        Workbook.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
        //        Workbook.Style.Font.Bold = true;

        //        response.Clear();
        //        response.Buffer = true;
        //        response.Charset = "";
        //        response.ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        //        response.AddHeader("content-disposition", "attachment;filename="+ fileName + ".xlsx");
        //        using (MemoryStream mm = new MemoryStream())
        //        {
        //            Workbook.SaveAs(mm);
        //            mm.WriteTo(response.OutputStream);
        //            response.Flush();
        //            response.End();
        //        }
        //    }
        //}

        //public void SaveAs(string path)
        //{
        //    Workbook.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
        //    Workbook.Style.Font.Bold = true;
        //    Workbook.SaveAs(path);
        //}

        public void AddAndMergedCell(IRow row, int firstRow, int lastRow, int firstCol, int lastCol, string value, ICellStyle style = null, bool border = false)
        {
            // tạo cell trong vùng (đảm bảo các cell tồn tại)
            for (int i = firstRow; i <= lastRow; i++)
            {
                var r = Sheet.GetRow(i) ?? Sheet.CreateRow(i);
                for (int j = firstCol; j <= lastCol; j++)
                {
                    var c = r.GetCell(j) ?? r.CreateCell(j);
                    if (style != null)
                    {
                        c.CellStyle = style;
                    }
                }
            }

            var fc = row.GetCell(firstCol) ?? row.CreateCell(firstCol);
            fc.SetCellValue(value);

            var cre = new CellRangeAddress(firstRow, lastRow, firstCol, lastCol);
            Sheet.AddMergedRegion(cre);

            if (border)
            {
                // Thử gọi overload hiện đại (nếu compile lỗi, chuyển sang biến thể cũ bên trên)
                RegionUtil.SetBorderLeft(BorderStyle.Thin, cre, Sheet);
                RegionUtil.SetBorderRight(BorderStyle.Thin, cre, Sheet);
                RegionUtil.SetBorderTop(BorderStyle.Thin, cre, Sheet);
                RegionUtil.SetBorderBottom(BorderStyle.Thin, cre, Sheet);
            }
        }

        //public void AddAndMergedCell(IRow row,  int firstRow, int lastRow, int firstCol, int lastCol, double value, ICellStyle style = null)
        //{
        //    for (int i = firstRow; i <= lastRow; i++)
        //    {
        //        var r = sheet.GetRow(i);
        //        for (int j = firstCol; j <= lastCol; j++)
        //        {
        //            var c = r.CreateCell(j);
        //            if (style != null)
        //            {
        //                c.CellStyle = (HSSFCellStyle)style;
        //                if (style.WrapText)
        //                {
        //                    c.CellStyle.WrapText = style.WrapText;
        //                }
        //            }
        //        }
        //    }

        //    var fc = row.GetCell(firstCol);
        //    fc.SetCellValue(value);

        //    var cre = new CellRangeAddress(firstRow, lastRow, firstCol, lastCol);

        //    sheet.AddMergedRegion(cre);
        //}
        //public void AddAndMergedCell(IRow row,   int firstRow, int lastRow, int firstCol, int lastCol, int value, ICellStyle style = null)
        //{
        //    for (int i = firstRow; i <= lastRow; i++)
        //    {
        //        var r = sheet.GetRow(i);
        //        for (int j = firstCol; j <= lastCol; j++)
        //        {
        //            var c = r.CreateCell(j);
        //            if (style != null)
        //            {
        //                c.CellStyle = (HSSFCellStyle)style;
        //                if (style.WrapText)
        //                {
        //                    c.CellStyle.WrapText = style.WrapText;
        //                }
        //            }
        //        }
        //    }

        //    var fc = row.GetCell(firstCol);
        //    fc.SetCellValue(value);

        //    var cre = new CellRangeAddress(firstRow, lastRow, firstCol, lastCol);

        //    sheet.AddMergedRegion(cre);
        //}
        //public void AddAndMergedCell(IRow row, int firstRow, int lastRow, int firstCol, int lastCol, DateTime value, ICellStyle style = null)
        //{
        //    for (int i = firstRow; i <= lastRow; i++)
        //    {
        //        var r = sheet.GetRow(i);
        //        for (int j = firstCol; j <= lastCol; j++)
        //        {
        //            var c = r.CreateCell(j);
        //            if (style != null)
        //            {
        //                c.CellStyle = (HSSFCellStyle)style;
        //                if (style.WrapText)
        //                {
        //                    c.CellStyle.WrapText = style.WrapText;
        //                }
        //            }
        //        }
        //    }

        //    var fc = row.GetCell(firstCol);
        //    fc.SetCellValue(value);

        //    var cre = new CellRangeAddress(firstRow, lastRow, firstCol, lastCol);

        //    sheet.AddMergedRegion(cre);
        //}
        //public void AddAndMergedCell(IRow row,  int firstRow, int lastRow, int firstCol, int lastCol, decimal value, ICellStyle style = null)
        //{
        //    var cre = new CellRangeAddress(firstRow, lastRow, firstCol, lastCol);
        //    sheet.AddMergedRegion(cre);
        //    for (int i = firstRow; i <= lastRow; i++)
        //    {
        //        var r = sheet.GetRow(i);
        //        for (int j = firstCol; j <= lastCol; j++)
        //        {
        //            var c = r.CreateCell(j);
        //            if (style != null)
        //            {
        //                c.CellStyle = (HSSFCellStyle)style;
        //                if (style.WrapText)
        //                {
        //                    c.CellStyle.WrapText = style.WrapText;
        //                }
        //            }
        //        }
        //    }

        //    var fc = row.GetCell(firstCol);
        //    fc.SetCellValue((double)value);
        //}

        public void InsertImage(string path, int row, int col, int maxW, int maxH)
        {
            var fp = FileComponent.GetFullPath(path);
            if (File.Exists(fp))
            {
                var ext = Path.GetExtension(fp);
                FileComponent.ResizeBySizeConfig(path, "zoom", new[] { maxW + "x" + maxH });

                var newPath = path + ".thumb/" + maxW + "x" + maxH + ext;

                var newfp = FileComponent.GetFullPath(newPath);
                if (File.Exists(newfp))
                {
                    byte[] data = File.ReadAllBytes(newfp);
                    int pictureIndex = Hwb.AddPicture(data, PictureType.JPEG);
                    ICreationHelper helper = Hwb.GetCreationHelper();
                    IDrawing drawing = Sheet.CreateDrawingPatriarch();
                    IClientAnchor anchor = helper.CreateClientAnchor();
                    anchor.Col1 = col;//0 index based column
                    anchor.Row1 = row;//0 index based row 
                    IPicture picture = drawing.CreatePicture(anchor, pictureIndex);

                    picture.Resize();
                }


            }
        }

        public string GetStringValue(string cell)
        {
            if (cell != "NULL")
            {
                return cell + "";
            }

            return "";
        }
        public int? GetIntValue(string cell)
        {
            if (cell != "NULL" && cell.HasValue())
            {
                int v;
                if (int.TryParse(cell, out v))
                {
                    return v;
                }
            }

            return null;
        }
        public double? GetDoubleValue(string cell)
        {
            if (cell != "NULL" && cell.HasValue())
            {
                double v;
                if (double.TryParse(cell, out v))
                {
                    return v;
                }
            }

            return null;
        }
        public decimal? GetDecimalValue(string cell)
        {
            if (cell != "NULL" && cell.HasValue())
            {
                decimal v;
                if (decimal.TryParse(cell, out v))
                {
                    return v;
                }
            }

            return null;
        }

    }
}