using System;
using System.Linq;
using System.Xml;
using System.Xml.Linq;

namespace Service.Utility.Components
{
    public static class CodeComponent
    {
        public static string Gen(string type, string c, int il = 7)
        {
            var index = GetLastCode(type);
            return StringComponent.ToAid(index, c, il);
        }

        public static int GetLastCode(string type)
        {
            var fp = FileComponent.GetFullPath("/media/code.xml");
            XDocument doc = XDocument.Load(fp);

            int index = 0;
            var code = doc.Element("codes").Elements("code").FirstOrDefault(x => x.Attribute("id").Value == type);
            if (code != null)
            {
                var v = Int32.Parse(code.Value);
                index = v + 1;
            }

            if (index == 0)
            {
                index = 1;
            }

            return index;
        }

        public static int Update(string type)
        {
            try
            {
				var fp = FileComponent.GetFullPath("/media/code.xml");
				XDocument doc = XDocument.Load(fp);

				int index = 0;
				var code = doc.Element("codes").Elements("code").FirstOrDefault(x => x.Attribute("id").Value == type);
				if (code != null)
				{
					var v = Int32.Parse(code.Value);
					index = v + 1;

					code.SetValue(index);
				}

				if (index == 0)
				{
					index = 1;
					var n = new XElement("code");
					n.SetAttributeValue("id", type);
					n.SetValue(1);
					doc.Element("codes").Add(n);
				}
				doc.Save(fp);

				return index;
			}
            catch (Exception e)
            {
                return 0;
            }
        }
    }
}