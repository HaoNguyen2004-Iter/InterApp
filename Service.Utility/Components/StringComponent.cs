using Microsoft.AspNetCore.Identity;
using Service.Utility.Variables;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Text;
using System.Text.RegularExpressions;
using System.Web;

namespace Service.Utility.Components
{
    public class IdImgModel
    {
        public int Id { get; set; }
        public string Type { get; set; }
        public int Media { get; set; }
        public string Name { get; set; }
        public string ThumbSize { get; set; }
        public int? ShopId { get; set; }
    }
    public static class StringComponent
    {
        private static readonly string[] _allowedChars = { "0123456789", "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz" };
        private static readonly Random Ran = new Random();

        public static string ToAid(this int id, string code, int il = 7)
        {
            var z = il - (id + "").Length;
            for (var i = 0; i < z; i++)
            {
                code += '0';
            }
            return code + id;
        }

        public static DateTime? IsValidDate(this string value, string format)
        {
            if (!value.HasValue())
                return null;
            var arr = value.Split('/').ToList();
            if (arr.Count != 3)
                return null;

            if (arr[0].Length == 1)
            {
                arr[0] = "0" + arr[0];
            }

            if (arr[1].Length == 1)
            {
                arr[1] = "0" + arr[1];
            }

            value = arr[0] + "/" + arr[1] + "/" + arr[2];

            DateTime tempDate;
            bool validDate = DateTime.TryParseExact(value, format, DateTimeFormatInfo.InvariantInfo,
                DateTimeStyles.None,
                out tempDate);
            if (validDate)
                return tempDate;
            else
                return null;
        }

        public static int GetMonthsBetween(DateTime from, DateTime to)
        {
            if (from > to) return GetMonthsBetween(to, from);

            var monthDiff = Math.Abs((to.Year * 12 + (to.Month - 1)) - (from.Year * 12 + (from.Month - 1)));

            if (from.AddMonths(monthDiff) > to || to.Day < from.Day)
            {
                return monthDiff - 1;
            }
            else
            {
                return monthDiff;
            }
        }

        public static string FormatDate(this DateTime? date, string format = "dd/MM/yyyy")
        {
            if (date.HasValue)
            {
                return date.Value.ToString(format);
            }
            return "";
        }

        public static string FormatTime(this TimeSpan? time, string format = @"hh\:mm")
        {
            if (time.HasValue)
            {
                return time.Value.ToString(format);
            }
            return "";
        }

        public static string FormatTime(this TimeSpan time, string format = @"hh\:mm")
        {
            return time.ToString(format);
        }

        public static string FormatDate(this DateTime date, string format = "dd/MM/yyyy")
        {
            if (date.Year > 1000)
                return date.ToString(format);
            return "";
        }

        public static string FormatDateTime(this DateTime date)
        {
            if (date.Year > 1000)
                return date.ToString("dd/MM/yyyy HH:mm");
            return "";
        }

        public static string FormatDateTime(this DateTime? date)
        {
            if (date.HasValue)
            {
                if (date.Value.Year > 1000)
                    return date.Value.ToString("dd/MM/yyyy HH:mm");
                return "";
            }
            return "";
        }

        public static string OptimizeMonth(this int v)
        {
            if (v <= 2)
                return v.ToAid("", 2);
            return v + "";
        }

        public static string IdImage(IdImgModel model)
        {
            var p = "/media" + (model.Media > 0 ? model.Media + "" : "") + "/";

            p += model.Type + "/";
            var fname = model.Name.Contains(".jpg") ? model.Name : model.Name + ".jpg";
            if (model.Id >= 100)
            {
                var idname = model.Id + "";
                var i = 1;
                while (i < idname.Length - 1)
                {
                    p += idname.Substring(0, i) + "/";
                    i++;
                }
            }
            p += model.Id + "/" + fname;

            if (!string.IsNullOrEmpty(model.ThumbSize))
            {
                p += ".thumb/" + model.ThumbSize + ".jpg";
            }

            return p;
        }

        public static bool HasValue(this string str)
        {
            return !string.IsNullOrEmpty(str);
        }

        public static string Guid(int? length, string cindexs = null)
        {
            var l = length ?? 10;
            var str = "";
            if (string.IsNullOrEmpty(cindexs))
            {
                cindexs = "0;1;2";
            }
            var arr = cindexs.Split(';').Select(Int32.Parse).ToList();
            foreach (int t in arr)
            {
                str += _allowedChars[t];
            }
            char[] chars = new char[l];
            int setLength = str.Length;

            for (int i = 0; i < l; ++i)
            {
                chars[i] = str[Ran.Next(setLength)];
            }

            return new string(chars, 0, l);
        }

        public static string NewLineToBr(this string str)
        {
            if (str.HasValue())
            {
                Regex regex = new Regex(@"(\r\n|\r|\n)+");
                return regex.Replace(str, "<br />");
            }

            return "";
        }

        public static string BrToNewLine(this string str)
        {
            if (str.HasValue())
            {
                return str.Replace("<br />", Environment.NewLine);
            }
            return "";
        }

        public static string GetQueryString(this object obj)
        {
            var properties = from p in obj.GetType().GetProperties()
                             where p.GetValue(obj, null) != null
                             select p.Name + "=" + HttpUtility.UrlEncode(p.GetValue(obj, null).ToString());

            return String.Join("&", properties.ToArray());
        }

        public static List<BaseJsonModel> ToBaseJsons(this string str)
        {
            if (str.Contains(';'))
            {
                var arr = str.Split('|');

                return (from obj in arr
                        where !String.IsNullOrEmpty(obj)
                        select obj.Split(';')
                    into t
                        select new BaseJsonModel
                        {
                            id = Int32.Parse(t[0]),
                            text = t[1]
                        }).ToList();
            }
            return new List<BaseJsonModel>();
        }

        public static string ToCode(this string str)
        {
            return str.Replace(".", "").NormalizeFileName().ToLower();
        }

        public static string ToKeyword(this string str)
        {
            if (String.IsNullOrEmpty(str)) return String.Empty;
            var normalizeString = str.Normalize(NormalizationForm.FormD);
            return Regex.Replace(normalizeString, @"\p{Mn}", String.Empty).Replace("đ", "d").Replace("Đ", "D").ToLower().Replace(",", String.Empty).Replace("  ", " ");
        }

        public static String RemoveVnChars(this String value)
        {
            if (String.IsNullOrEmpty(value)) return String.Empty;
            var normalizeString = value.Normalize(NormalizationForm.FormD);
            return Regex.Replace(normalizeString, @"\p{Mn}", String.Empty).Replace("đ", "d").Replace("Đ", "D");
        }

        public static String NormalizeFileName(this String value)
        {
            if (value.HasValue())
            {
                return Regex.Replace(Regex.Replace(value.RemoveVnChars(), @"[^\w\.-]", "-"), @"-+", "-").Replace(".", "");
            }
            return "";
        }

        public static string RemoveNewLine(this string str)
        {
            return str.Replace("\r", "").Replace("\n", "");
        }

        public static string RemoveSpecialChars(this string str)
        {
            return Regex.Replace(str, "[^a-zA-Z0-9_. ,]+", "", RegexOptions.Compiled);
        }

        public static string ClearPhoneNumber(this string str)
        {
            if (str == null) return str;
            return Regex.Replace(str, "[^0-9+]+", "", RegexOptions.Compiled);
        }

        public static string ClearEmail(this string str)
        {
            if (str == null) return str;
            return Regex.Replace(str, "[^a-zA-Z0-9_.@]+", "", RegexOptions.Compiled);
        }

        public static string RemoveHeadExceptionChars(this string str)
        {
            var keys = Encoding.ASCII.GetBytes(str.ToCharArray());
            while (str.Length > 0 && (str[0] == ' '
                                      || str[0] == '-'
                                      || str[0] == '–'
                                      || str[0] == '\n'
                                      || str[0] == '\t'
                                      || keys[0] == 32
                                      || keys[0] == 63))
            {
                str = str.Substring(1);
                keys = Encoding.ASCII.GetBytes(str.ToCharArray());
            }
            return str;
        }

        public static string RemoveTailExceptionChars(this string str)
        {
            var keys = Encoding.ASCII.GetBytes(str.ToCharArray());

            while (str.Length > 0 && (str[str.Length - 1] == ' '
                                      || str[str.Length - 1] == '-'
                                      || str[str.Length - 1] == '–'
                                      || str[str.Length - 1] == '\t'
                                      || str[str.Length - 1] == '\n'
                                      || keys[keys.Length - 1] == 32
                                      || keys[keys.Length - 1] == 63))
            {
                str = str.Substring(0, str.Length - 1);
                keys = Encoding.ASCII.GetBytes(str.ToCharArray());
            }
            return str;
        }

        public static string Optimize(this string str)
        {
            if (str.Contains("&"))
            {
                str = HttpUtility.HtmlDecode(str);
                str = str.Replace(" ", "");
            }
            str = str.Replace("\t", " ").Replace("  ", " ");
            str = str.RemoveHeadExceptionChars();
            str = str.RemoveTailExceptionChars();
            return str;
        }

        public static string OptimizeKeyword(this string str)
        {
            str = str.Replace("\t", " ").Replace("  ", " ");
            str = str.RemoveHeadExceptionChars();
            str = str.RemoveTailExceptionChars();
            if (str.Contains("'"))
            {
                str = str.Replace("'", "''");
            }
            return str;
        }

        public static String OnlyChars(this String value)
        {
            return Regex.Replace(value, "[^a-zA-Z]+", "", RegexOptions.Compiled);
        }

        public static string Thumb(string path, string type, string size)
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

        public static bool IsValidEmail(this string email)
        {
            const string emailRegex = @"^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$";
            var re = new Regex(emailRegex);
            return re.IsMatch(email);
        }

        public static string Sub(this string str, int length)
        {
            if (str == null)
            {
                str = "";
            }
            if (str.Length > length)
            {
                return str.Substring(0, length - 3) + "...";
            }
            return str;
        }

        public static string LoremIpsum(int minWordPerSentences, int maxWordPerSentences, int minSentences, int maxSentences, int numLines)
        {
            var words = new[] { "lorem", "ipsum", "dolor", "sit", "amet", "consectetuer", "adipiscing", "elit", "sed", "diam", "nonummy", "nibh", "euismod", "tincidunt", "ut", "laoreet", "dolore", "magna", "aliquam", "erat" };

            int numSentences = Ran.Next(maxSentences - minSentences)
                + minSentences;
            int numWords = Ran.Next(maxWordPerSentences - minWordPerSentences) + minWordPerSentences;

            var sb = new StringBuilder();
            for (int p = 0; p < numLines; p++)
            {
                for (int s = 0; s < numSentences; s++)
                {
                    for (int w = 0; w < numWords; w++)
                    {
                        if (w > 0) { sb.Append(" "); }
                        string word = words[Ran.Next(words.Length)];
                        if (w == 0) { word = word.Substring(0, 1).Trim().ToUpper() + word.Substring(1); }
                        sb.Append(word);
                    }
                    if (maxSentences > 1)
                    {
                        sb.Append(". ");
                    }
                }
                if (p < numLines - 1) sb.AppendLine();
            }
            return sb.ToString();
        }

        public static string D100Decrypt(this string str)
        {
            byte[] asciiBytes = Encoding.ASCII.GetBytes(str);
            var bstr = asciiBytes.Aggregate("", (current, c) => current + (c <= 90 ? '1' : '0'));
            int numOfBytes = bstr.Length / 8;
            var pass = "";
            for (int i = 0; i < numOfBytes; ++i)
            {
                pass += Convert.ToChar(Convert.ToByte(bstr.Substring(8 * i, 8), 2));
            }
            return pass.Substring(0, pass.Length / 2);
        }

        public static string OptimizeUri(this string str)
        {
            var br = new[] { "http://", "https://" };
            if (!br.Any(x => str.Contains(x)))
            {
                str = "http://" + str;
            }
            if (str[str.Length - 1] == '/')
            {
                str = str.Substring(0, str.Length - 1);
            }
            return str;
        }

        public static TResult IfNotNull<TSource, TResult>(this TSource source, Expression<Func<TSource, TResult>> expression, TResult defaultValue)
        {
            var safeExp = Expression.Lambda<Func<TSource, TResult>>(
                NullSafeEvalWrapper(expression.Body, Expression.Constant(defaultValue)),
                expression.Parameters[0]);

            var safeDelegate = safeExp.Compile();
            return safeDelegate(source);
        }

        private static Expression NullSafeEvalWrapper(Expression expr, Expression defaultValue)
        {
            Expression obj;
            Expression safe = expr;

            while (!IsNullSafe(expr, out obj))
            {
                var isNull = Expression.Equal(obj, Expression.Constant(null));

                safe =
                    Expression.Condition
                    (
                        isNull,
                        defaultValue,
                        safe
                    );

                expr = obj;
            }
            return safe;
        }

        private static bool IsNullSafe(Expression expr, out Expression nullableObject)
        {
            nullableObject = null;

            if (expr is MemberExpression || expr is MethodCallExpression)
            {
                Expression obj;
                MemberExpression memberExpr = expr as MemberExpression;
                MethodCallExpression callExpr = expr as MethodCallExpression;

                if (memberExpr != null)
                {
                    // Static fields don't require an instance
                    FieldInfo field = memberExpr.Member as FieldInfo;
                    if (field != null && field.IsStatic)
                        return true;

                    // Static properties don't require an instance
                    PropertyInfo property = memberExpr.Member as PropertyInfo;
                    if (property != null)
                    {
                        MethodInfo getter = property.GetGetMethod();
                        if (getter != null && getter.IsStatic)
                            return true;
                    }
                    obj = memberExpr.Expression;
                }
                else
                {
                    // Static methods don't require an instance
                    if (callExpr.Method.IsStatic)
                        return true;

                    obj = callExpr.Object;
                }

                // Value types can't be null
                if (obj.Type.IsValueType)
                    return true;

                // Instance member access or instance method call is not safe
                nullableObject = obj;
                return false;
            }
            return true;
        }

        public static IEnumerable<DateTime> GetDateRange(DateTime startDate, DateTime endDate)
        {
            if (endDate < startDate)
                throw new ArgumentException("endDate must be greater than or equal to startDate");

            while (startDate <= endDate)
            {
                yield return startDate;
                startDate = startDate.AddDays(1);
            }
        }

        public static IEnumerable<DateTime> GetDatetimeRange(DateTime sd, DateTime ed)
        {
            if (ed < sd)
                throw new ArgumentException("endDate must be greater than or equal to startDate");

            var list = new List<DateTime>();

            var i = new DateTime(sd.Year, sd.Month, sd.Day);
            while (i <= ed)
            {
                if (i.Year == sd.Year && i.Month == sd.Month && i.Day == sd.Day)
                {
                    list.Add(sd);
                }
                else if (i.Year == ed.Year && i.Month == ed.Month && i.Day == ed.Day)
                {
                    list.Add(ed);
                }
                else
                {
                    list.Add(i);
                }

                i = i.AddDays(1);
            }

            return list;

            //while (startDate <= endDate)
            //{
            //    yield return startDate;
            //    startDate = startDate.AddDays(1);
            //}
        }

        public static string Seniority(this DateTime startDate, string format)
        {
            DateTime end = DateTime.Now;
            var diffMonths = (end.Month + end.Year * 12) - (startDate.Month + startDate.Year * 12);

            if (diffMonths < 0)
            {
                diffMonths = 0;
            }

            if (format == "y")
            {
                return ((float)Math.Round((double)diffMonths / 12, 1)) + "";
            }
            return diffMonths.ToString();
        }

        public static string Seniority(this DateTime? startDate, string format)
        {
            if (startDate.HasValue)
            {
                DateTime end = DateTime.Now;
                var diffMonths = (end.Month + end.Year * 12) -
                                 (startDate.Value.Month + startDate.Value.Year * 12);
                if (diffMonths < 0)
                {
                    diffMonths = 0;
                }

                if (format == "y")
                {
                    return ((float)Math.Round((double)diffMonths / 12, 1)) + "";
                }

                return diffMonths.ToString();
            }

            return "";
        }

        public static double Seniority(DateTime startDate, DateTime? endDate, string format)
        {
            DateTime end = endDate ?? DateTime.Now;
            var diffMonths = (end.Month + end.Year * 12) - (startDate.Month + startDate.Year * 12);
            if (diffMonths < 0)
            {
                diffMonths = 0;
            }
            if (format == "y")
            {
                var x = Math.Round((double)diffMonths / 12, 1);
                return x;
            }
            if (format == "d")
            {
                TimeSpan difference = endDate.Value - startDate;
                return double.Parse(difference.Days.ToString());
            }
            return diffMonths;
        }

        public static int Seniority(DateTime startDate, DateTime? endDate)
        {
            DateTime end = endDate ?? DateTime.Now;
            TimeSpan difference = endDate.Value - startDate;
            return difference.Days;
        }

        public static double SeniorityFull(this DateTime? startDate, DateTime? endDate, string format)
        {
            if (startDate.HasValue)
            {
                DateTime end = endDate ?? DateTime.Now;
                var diffMonths = (end.Month + end.Year * 12) - (startDate.Value.Month + startDate.Value.Year * 12);
                if (diffMonths < 0)
                {
                    return 0;
                }
                var x = Math.Round((double)diffMonths / 12, 3);
                return x;
            }
            return 0;
        }

        public static double SeniorityFull(this DateTime startDate, DateTime? endDate, string format)
        {
            DateTime end = endDate ?? DateTime.Now;
            var diffMonths = (end.Month + end.Year * 12) - (startDate.Month + startDate.Year * 12);
            if (diffMonths < 0)
            {
                return 0;
            }
            var x = Math.Round((double)diffMonths / 12, 3);
            return x;

        }

        public static string DefaultMedia(string root)
        {
            var a = Directory.GetParent(root) + "\\media\\";
            a = a.Replace("\\", "/");
            return a;
        }

        public static bool IsDateTime(this string strDate)
        {
            try
            {
                DateTime dateTime;
                if (DateTime.TryParseExact(strDate, "dd/MM/yyyy", CultureInfo.InvariantCulture,
                    DateTimeStyles.None, out dateTime))
                {
                    return true;
                }
                return false;
            }
            catch
            {
                return false;
            }
        }

        public static bool IsNumber(this string s)
        {
            foreach (char c in s)
            {
                if (!char.IsDigit(c) && c != '.')
                {
                    return false;
                }
            }

            return true;
        }

        public static IEnumerable<DateTime> DateRange(DateTime fromDate, DateTime toDate)
        {
            try
            {
                var result = new List<DateTime>();
                var sd = fromDate;
                while (sd <= toDate)
                {
                    result.Add(sd);
                    sd = sd.AddDays(1);
                }
                return result;
            }
            catch (Exception e)
            {
                return new List<DateTime>();
            }
        }

        public static string MD5(this string s)
        {
            using (var provider = System.Security.Cryptography.MD5.Create())
            {
                StringBuilder builder = new StringBuilder();

                foreach (byte b in provider.ComputeHash(Encoding.UTF8.GetBytes(s)))
                    builder.Append(b.ToString("x2").ToLower());

                return builder.ToString();
            }
        }

        public static DateTime? StringToDateTime(this string str, List<string> formats, string dtype)
        {
            DateTime dateValue;
            if (formats.Count == 0)
            {
                if (dtype == "us")
                {
                    formats.AddRange(new List<string>() { "M/d/yyyy hh:mm:ss tt", "M/dd/yyyy hh:mm:ss tt", "MM/d/yyyy hh:mm:ss tt", "MM/dd/yyyy hh:mm:ss tt" });
                }
                else
                {
                    formats.AddRange(new List<string>() { "d/M/yyyy hh:mm:ss tt", "d/MM/yyyy hh:mm:ss tt", "dd/M/yyyy hh:mm:ss tt", "dd/MM/yyyy hh:mm:ss tt" });
                }
            }
            if (DateTime.TryParseExact(str, formats.ToArray(), System.Globalization.CultureInfo.InvariantCulture, DateTimeStyles.None, out dateValue))
                return dateValue;
            return null;
        }

        public static TimeSpan StringToTimeSpan(this string str)
        {
            try
            {
                var arr = str.Split(':').Select(Int32.Parse).ToList();
                if (arr.Count >= 2)
                    return new TimeSpan(arr[0], arr[1], 0);

                return TimeSpan.Zero;
            }
            catch (Exception e)
            {
                return TimeSpan.Zero;
            }
        }

        public static string ToUpperFirstLetter(this string str)
        {
            if (str.HasValue())
            {
                var arr = str.Split(' ').ToList();
                for (int i = 0; i < arr.Count; i++)
                {
                    var c = arr[i];
                    if (c.Length > 0)
                    {
                        c = c[0].ToString().ToUpper() + c.Substring(1).ToLower();
                    }
                    arr[i] = c;
                }

                return string.Join(" ", arr);
            }

            return str;
        }

        public static string GetInner(this Exception e)
        {
            var arr = new List<string>() { e.Message };
            if (e.InnerException != null)
            {
                var i1 = e.InnerException;
                arr.Add(i1.Message);
                if (i1.InnerException != null)
                {
                    var i2 = i1.InnerException;
                    arr.Add(i2.Message);
                    if (i2.InnerException != null)
                    {
                        arr.Add(i2.InnerException.Message);
                    }
                }
            }

            return string.Join(Environment.NewLine, arr);
        }

        public static bool IsValidPath(string path)
        {
            path = path.ToLower();

            var exceptions = new string[] { "<", ">", "javascript", "cookie", "alert", "script" };

            foreach (var e in exceptions)
            {
                if (path.Contains(e))
                {
                    return false;
                }
            }

            return true;
        }

        public static string RemoveHtmlTags(this string str)
        {
            if (!str.HasValue())
                return "";

            return Regex.Replace(str, "<.*?>", String.Empty);
        }

        public static DateTime? MilisecondToDatetime(this string milisecond)
        {
            try
            {
                if (milisecond.HasValue())
                {
                    var v = double.Parse(milisecond);
                    TimeSpan time = TimeSpan.FromMilliseconds(v);
                    return new DateTime(1970, 1, 1) + time;
                }
                return null;
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        public static string HashPassword(this string password)
        {
            var hasher = new PasswordHasher<object>();

            return hasher.HashPassword(null, password);
        }
        public static bool VerifyHashedPassword(string hashedPassword, string myPassword)
        {
            var hasher = new PasswordHasher<object>();

            var result = hasher.VerifyHashedPassword(null, hashedPassword, myPassword);
            if (result == PasswordVerificationResult.Success)
            {
                return true;
            }
            return false;
        }
    }
}