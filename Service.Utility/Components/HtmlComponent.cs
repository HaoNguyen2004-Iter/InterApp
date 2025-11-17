using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading;
using Service.Utility.Variables;

namespace Service.Utility.Components
{
	public static class HtmlComponent
	{
		public static IEnumerable<int> AllIndexesOf(this string str, string searchstring)
		{
			int minIndex = str.IndexOf(searchstring, StringComparison.Ordinal);
			while (minIndex != -1)
			{
				yield return minIndex;
				minIndex = str.IndexOf(searchstring, minIndex + searchstring.Length, StringComparison.Ordinal);
			}
		}

		public static string DropComment(this string str)
		{
			var openTabIndex = str.IndexOf("<!--", StringComparison.CurrentCulture);
			while (openTabIndex >= 0)
			{
				var closeTabIndex = str.IndexOf("-->", StringComparison.CurrentCulture);
				if (closeTabIndex >= 0)
				{
					var specStr = str.Substring(openTabIndex, closeTabIndex - openTabIndex + 1);
					str = str.Replace(specStr, "");
				}
				else
				{
					var specStr = str.Substring(openTabIndex);
					str = str.Replace(specStr, "");
				}
				openTabIndex = str.IndexOf("<!--", StringComparison.CurrentCulture);
			}
			return str;
		}
		public static string DropTags(this string str)
		{
			var openTabIndex = str.IndexOf('<');
			while (openTabIndex >= 0)
			{
				var closeTabIndex = str.IndexOf('>');
				if (closeTabIndex >= 0)
				{
					var specStr = str.Substring(openTabIndex, closeTabIndex - openTabIndex + 1);
					str = str.Replace(specStr, "");
				}
				else
				{
					var specStr = str.Substring(openTabIndex);
					str = str.Replace(specStr, "");
				}
				openTabIndex = str.IndexOf('<');
			}
			return str;
		}
		public static string CloseTag(this string tag)
		{
			if (tag.Length > 0)
			{
				return tag[0] + "/" + tag.Substring(1) + ">";
			}
			return "";
		}

		public static string OpenTag(this string tag)
		{
			if (tag.IndexOf(' ') > 0)
			{
				return tag.Substring(0, tag.IndexOf(' '));
			}
			if (tag.IndexOf('>') >= 0)
			{
				return tag.Substring(0, tag.IndexOf('>'));
			}
			return tag;
		}
		//public static string GetContentInsideTag(this string html, string tag, bool onlyText = false)
		//{
		//    string result = "";
		//    if (html.Length >= tag.Length)
		//    {
		//        if (!html.Contains(tag))
		//        {
		//            return null;
		//        }
		//        if (tag.IndexOf('>') <= 0)
		//        {
		//            if (html.IndexOf(tag, StringComparison.CurrentCulture) > 0)
		//            {
		//                html = html.Substring(html.IndexOf(tag, StringComparison.CurrentCulture));

		//            }
		//            var t = html.IndexOf('>');
		//            tag = html.Substring(html.IndexOf(tag, StringComparison.CurrentCulture), t + 1);
		//        }
		//        // cut before tag
		//        var indexTag = html.IndexOf(tag, StringComparison.Ordinal);
		//        if (indexTag >= 0)
		//        {
		//            html = html.Substring(indexTag + tag.Length);
		//            var openTag = tag.OpenTag();
		//            openTag = openTag.RemoveNewLine();
		//            var closeTag = openTag.CloseTag();

		//            var nextOpenTag = html.IndexOf(openTag, StringComparison.Ordinal);
		//            int openOwe = -1;
		//            while (html.Length >= 0)
		//            {
		//                var nextCloseTag = html.IndexOf(closeTag, StringComparison.Ordinal);
		//                if (nextCloseTag == 0)
		//                {
		//                    if (openOwe == -1)
		//                        return result;
		//                }
		//                else
		//                {
		//                    if (nextCloseTag < nextOpenTag || nextOpenTag < 0 && nextCloseTag > 0)
		//                    {
		//                        if (openOwe == -1)
		//                        {
		//                            result += html.Substring(0, nextCloseTag);
		//                            if (onlyText)
		//                            {
		//                                result = DropTags(result);
		//                            }
		//                            return result;
		//                        }
		//                    }
		//                    else
		//                    {
		//                        var beforeOpenTags = AllIndexesOf(html.Substring(0, nextCloseTag), openTag);
		//                        openOwe += beforeOpenTags.Count();
		//                    }
		//                }


		//                result += html.Substring(0, nextCloseTag + closeTag.Length);
		//                html = html.Substring(nextCloseTag + closeTag.Length);
		//                openOwe--;
		//                nextOpenTag = html.IndexOf(openTag, StringComparison.Ordinal);
		//            }
		//        }
		//    }

		//    return null;
		//}
		//public static string SetAttribute(this string tag, string attribute, string value)
		//{
		//    var oldValue = tag.GetContentInsideAttribute(attribute);
		//    if (!string.IsNullOrEmpty(oldValue))
		//    {
		//        tag = tag.Replace(oldValue, value);
		//        return tag;
		//    }
		//    if (oldValue == "")
		//    {
		//        var f = tag.Substring(0, tag.IndexOf(attribute, StringComparison.CurrentCulture) + attribute.Length + 2);
		//        var l = tag.Substring(tag.IndexOf(attribute, StringComparison.CurrentCulture) + attribute.Length + 2);
		//        return f + value + l;
		//    }

		//    var str = attribute + "=\"" + value + "\"";

		//    if (tag.IndexOf(' ') > 0)
		//    {
		//        var f = tag.Substring(0, tag.IndexOf(' '));
		//        var l = tag.Substring(tag.IndexOf(' '));
		//        return f + " " + str + " " + l;
		//    }
		//    if (tag.IndexOf('>') >= 0)
		//    {
		//        var f = tag.Substring(0, tag.IndexOf('>'));
		//        var l = tag.Substring(tag.IndexOf('>'));
		//        return f + " " + str + " " + l;
		//    }
		//    return null;
		//}
		public static Image ToImage(this string str)
		{
			byte[] bytes = Convert.FromBase64String(str);

			Image image;
			using (MemoryStream ms = new MemoryStream(bytes))
			{
				image = Image.FromStream(ms);
			}

			return image;
		}
		//public static string GetTag(this string html, string tag)
		//{
		//    string result = "";
		//    if (html.Length >= tag.Length)
		//    {
		//        if (tag.IndexOf('>') <= 0)
		//        {
		//            if (html.IndexOf(tag, StringComparison.CurrentCulture) > 0)
		//            {
		//                html = html.Substring(html.IndexOf(tag, StringComparison.CurrentCulture));
		//                var t = html.IndexOf('>');
		//                tag = html.Substring(html.IndexOf(tag, StringComparison.CurrentCulture), t + 1);
		//            }

		//        }
		//        if (tag.IndexOf("<img ", StringComparison.CurrentCulture) == 0 || tag.IndexOf("<meta ", StringComparison.CurrentCulture) == 0)
		//        {
		//            return tag;
		//        }
		//        if (tag.Length > 0)
		//        {
		//            // cut before tag
		//            var indexTag = html.IndexOf(tag, StringComparison.Ordinal);
		//            if (indexTag >= 0)
		//            {
		//                var openTag = tag.OpenTag();
		//                var closeTag = openTag.CloseTag();
		//                if (indexTag + tag.Length > html.Length)
		//                {
		//                    return result + closeTag;
		//                }
		//                result = html.Substring(indexTag, indexTag + tag.Length);
		//                html = html.Substring(indexTag + tag.Length);


		//                var nextOpenTag = html.IndexOf(openTag, StringComparison.Ordinal);
		//                int openOwe = -1;
		//                while (html.Length >= 0)
		//                {
		//                    var nextCloseTag = html.IndexOf(closeTag, StringComparison.Ordinal);
		//                    if (nextCloseTag < nextOpenTag || nextOpenTag < 0 && nextCloseTag > 0)
		//                    {
		//                        if (openOwe == -1)
		//                        {
		//                            result += html.Substring(0, nextCloseTag);
		//                            return result + closeTag;
		//                        }
		//                    }
		//                    else
		//                    {
		//                        if (nextCloseTag >= 0)
		//                        {
		//                            var beforeOpenTags = AllIndexesOf(html.Substring(0, nextCloseTag), openTag);
		//                            openOwe += beforeOpenTags.Count();
		//                        }
		//                    }
		//                    if (nextCloseTag + closeTag.Length <= 0)
		//                    {
		//                        return result + closeTag;
		//                    }
		//                    if (html.Length >= nextCloseTag + closeTag.Length)
		//                    {
		//                        result += html.Substring(0, nextCloseTag + closeTag.Length);
		//                        html = html.Substring(nextCloseTag + closeTag.Length);
		//                        openOwe--;
		//                        nextOpenTag = html.IndexOf(openTag, StringComparison.Ordinal);
		//                    }
		//                    else
		//                    {
		//                        html = "";
		//                    }
		//                }
		//            }
		//        }

		//    }

		//    return null;
		//}

		public static string GetTagByName(this string html, string tag, string name)
		{
#pragma warning disable CS0219 // The variable 'result' is assigned but its value is never used
			string result = "";
#pragma warning restore CS0219 // The variable 'result' is assigned but its value is never used
			if (html.Length >= tag.Length)
			{
				var indexName = html.IndexOf(name, StringComparison.Ordinal);
				if (indexName > 0)
				{
					var indexOpenTab = PositionBefore(html, "<", indexName);
					var indexCloseTab = PositionAfter(html, ">", indexName);
					var tab = html.Substring(indexOpenTab, indexName - indexOpenTab + indexCloseTab + 1);
					return tab;
				}
				return null;
			}
			return null;
		}
		public static string GetContentInsideAttribute(this string html, string attr)
		{
			html = html.Replace("'", "\"");
			// cut before tag
			var indexAttr = html.IndexOf(attr + "=", StringComparison.Ordinal);
			if (indexAttr >= 0)
			{
				html = html.Substring(indexAttr + attr.Length + 2);
				return html.Substring(0, html.IndexOf('"'));
			}
			return null;
		}

		public static string GetHtml(string link)
		{
			string data = null;
			try
			{
				HttpWebRequest request = (HttpWebRequest)WebRequest.Create(link);
				request.UserAgent = "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36";
				using (HttpWebResponse response = (HttpWebResponse)request.GetResponse())
				{
					if (response.StatusCode == HttpStatusCode.OK)
					{
						Stream receiveStream = response.GetResponseStream();
						StreamReader readStream = null;

						if (response.CharacterSet == null)
						{
							readStream = new StreamReader(receiveStream);
						}
						else
						{
							readStream = new StreamReader(receiveStream, System.Text.Encoding.UTF8);
						}

						data = readStream.ReadToEnd();

						response.Close();
						readStream.Close();
					}
				}
			}
			catch (WebException)
			{
			}
			return data;
		}

		public static string DownloadDataFromUrl(string url, bool wait)
		{
			var done = false;
			var result = "";
			var sleep = 0;
			if (wait)
			{
				while (!done)
				{
					using (var client = new WebClient())
					{
						try
						{
							client.Encoding = Encoding.UTF8;
							result = client.DownloadString(url);
							done = true;
						}
#pragma warning disable CS0168 // The variable 'e' is declared but never used
						catch (Exception e)
#pragma warning restore CS0168 // The variable 'e' is declared but never used
						{
							done = false;
							Console.WriteLine("Link " + url + " error: " + e.Message);
						}
					}
					if (done) continue;
					Console.WriteLine("Download failed ! Sleeping...");
					if (sleep < 3)
					{
						sleep++;
						Thread.Sleep(3 * 1000);
					}
					else
					{
						done = true;
					}
				}
			}
			else
			{
				using (var client = new WebClient())
				{
					client.Encoding = Encoding.UTF8;
					var t1 = DateTime.Now;
					Console.WriteLine(url);
					result = client.DownloadString(url);
				}
			}
			return result;
		}

		public static Int32 PositionAfter(this string html, string finder, int index)
		{
			html = html.Substring(index);
			return html.IndexOf(finder, StringComparison.CurrentCulture);
		}
		public static Int32 PositionBefore(string html, string finder, int index)
		{
			html = html.Substring(0, index);
			return html.LastIndexOf(finder, StringComparison.CurrentCulture);
		}

		//public static string GetContentByClass(this string html, string clas)
		//{
		//    var indexCls = html.IndexOf(clas, StringComparison.Ordinal);
		//    if (indexCls > 0)
		//    {
		//        var indexOpenTab = PositionBefore(html, "<", indexCls);
		//        var indexCloseTab = PositionAfter(html, ">", indexCls);
		//        var tab = html.Substring(indexOpenTab, indexCls - indexOpenTab + indexCloseTab + 1);
		//        var a = GetContentInsideTag(html, tab);
		//        return a;
		//    }
		//    return null;
		//}

		//public static string GetContentById(this string html, string id)
		//{
		//    var indexCls = html.IndexOf("id=\"" + id + "\"", StringComparison.Ordinal);
		//    if (indexCls > 0)
		//    {
		//        var indexOpenTab = PositionBefore(html, "<", indexCls);
		//        var indexCloseTab = PositionAfter(html, ">", indexCls);
		//        var tab = html.Substring(indexOpenTab, indexCloseTab);
		//        return GetContentInsideTag(html, tab);
		//    }
		//    return null;
		//}

		public static Input GetInputById(this string html, string id)
		{
			var indexCls = html.IndexOf("id=\"" + id + "\"", StringComparison.Ordinal);
			var t = html.Length;
			if (indexCls > 0)
			{
				var result = new Input();
				var indexOpenTab = PositionBefore(html, "<input", indexCls);
				var indexCloseTab = PositionAfter(html, "/>", indexCls);
				var input = html.Substring(indexOpenTab, indexCls - indexOpenTab + indexCloseTab - 3);

				result.Class = GetContentInsideAttribute(input, "class");
				result.Id = GetContentInsideAttribute(input, "id");
				result.Type = GetContentInsideAttribute(input, "type");
				result.Value = GetContentInsideAttribute(input, "value");
				result.Name = GetContentInsideAttribute(input, "name");
				return result;
			}
			return null;
		}

		public static string PostDataToUrl(string url, string data)
		{
			var http = (HttpWebRequest)WebRequest.Create(new Uri(url));
			http.Accept = "application/json";
			http.ContentType = "application/json";
			http.Method = "POST";
			UTF8Encoding encoding = new UTF8Encoding();
			Byte[] bytes = encoding.GetBytes(data);

			Stream newStream = http.GetRequestStream();
			newStream.Write(bytes, 0, bytes.Length);
			newStream.Close();

			var response = http.GetResponse();

			var stream = response.GetResponseStream();
			var sr = new StreamReader(stream);
			return sr.ReadToEnd();
		}
        public static string PostDataToUrlStreamReader(string url, string data)
        {
            var http = (HttpWebRequest)WebRequest.Create(new Uri(url));
            http.Accept = "application/json";
            http.ContentType = "application/json";
            http.Method = "POST";

            UTF8Encoding encoding = new UTF8Encoding();
            Byte[] bytes = encoding.GetBytes(data);

            // Gửi request
            using (Stream newStream = http.GetRequestStream())
            {
                newStream.Write(bytes, 0, bytes.Length);
            }

            // Nhận response
            using (var response = http.GetResponse())
            using (var stream = response.GetResponseStream())
            using (var sr = new StreamReader(stream))
            {
                char[] buffer = new char[4096]; // Đọc từng 4KB
                int bytesRead;
                StringBuilder responseData = new StringBuilder();

                while ((bytesRead = sr.Read(buffer, 0, buffer.Length)) > 0)
                {
                    responseData.Append(buffer, 0, bytesRead);
                }

                return responseData.ToString();
            }
        }
        public static string PostDataToUrl(string url, string data, Dictionary<string, string> headers)
		{
			var http = (HttpWebRequest)WebRequest.Create(new Uri(url));
			http.Accept = "application/json";
			http.ContentType = "application/json";
			http.Method = "POST";

			if (headers != null)
			{
				foreach (var h in headers)
				{
					http.Headers.Add(h.Key, h.Value);
				}
			}

			ASCIIEncoding encoding = new ASCIIEncoding();
			Byte[] bytes = encoding.GetBytes(data);

			Stream newStream = http.GetRequestStream();
			newStream.Write(bytes, 0, bytes.Length);
			newStream.Close();

			var response = http.GetResponse();

			var stream = response.GetResponseStream();
			var sr = new StreamReader(stream);
			return sr.ReadToEnd();
		}

		public static string ToHtmlLink(this string href)
		{
			var a = "<a href=\"" + href + "\" target=\"_blank\" >" + href + "</a>";
			return a;
		}

		public static string ToHtmlImage(this string path, int? w, int? h)
		{
			if (path.HasValue())
			{
				var st = new List<string>();

				if (w.HasValue)
				{
					st.Add("width: " + w + "px");
				}

				if (h.HasValue)
				{
					st.Add("height: " + h + "px");
				}

				var a = "<img src=\"" + path + "\" style=\"" + string.Join(";", st) + "\" />";

				return a;
			}
			return "";
		}
	}
}