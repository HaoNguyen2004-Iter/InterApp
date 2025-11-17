using HtmlAgilityPack;
using System.Net;
using System.Web;

namespace Service.Utility.Components
{
	public class ExtractHtmlDataModel
	{
        public List<string> TextParts { get; set; }
        public List<string> Tags { get; set; }
    }
	public class TranslateComponent
	{
        private string _apiKey { get; set; }

        public TranslateComponent()
		{ 
		}

		public string TranslateHtml(string html, string fl, string tl)
		{

			var htmlDoc = new HtmlDocument();
			htmlDoc.LoadHtml(html);

			var textNodes = htmlDoc.DocumentNode.SelectNodes("//text()").ToList();
			var originalTexts = textNodes.Select(node => node.InnerText).ToList();

			var translatedTexts = TranslateTextParts(originalTexts, "vi", tl);

			int textIndex = 0;
			foreach (var textNode in textNodes)
			{
				textNode.InnerHtml = translatedTexts[textIndex++];
			}

			 
			return htmlDoc.DocumentNode.OuterHtml;
		} 

		public string TranslateText(string text, string fl, string tl)
		{
			var url = $"https://translate.googleapis.com/translate_a/single?client=gtx&sl={fl}&tl={tl}&dt=t&q={HttpUtility.UrlEncode(text)}";
			var webClient = new WebClient
			{
				Encoding = System.Text.Encoding.UTF8
			};
			var result = webClient.DownloadString(url);
			try
			{
				result = result.Substring(4, result.IndexOf("\"", 4, StringComparison.Ordinal) - 4);
				return result; 
			}
			catch
			{

			}
			return "";
		}

		public List<string> TranslateTextParts(List<string> textParts, string fl,  string tl)
		{ 
			var translatedParts = new System.Collections.Generic.List<string>();

			var exceptions = new List<string>() { " ", "\t" };

			foreach (var part in textParts)
			{

				var str = part;

				str = str.Replace("  ", "");
				if(str.HasValue() && str != " " && !exceptions.Contains(str))
				{
					translatedParts.Add(TranslateText(part, fl, tl));
				}
				else
				{
					translatedParts.Add(str);
				}
			}

			return translatedParts;
		}

		public string ReconstructHtml(List<string> textParts, List<string> tags)
		{
			var result = new System.Text.StringBuilder();

			for (int i = 0; i < textParts.Count; i++)
			{
				result.Append(tags[i]);
				result.Append(textParts[i]);
			}
			if (tags.Count > textParts.Count)
			{
				result.Append(tags[tags.Count - 1]);
			}

			return result.ToString();
		}
	}
}
