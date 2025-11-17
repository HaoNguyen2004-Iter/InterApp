using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading;
using System.Xml;
using System.Xml.Serialization;
using Service.Utility.Variables;

namespace Service.Utility.Components
{ 
    public static class XmlComponent
    {
        public static XmlNode SerializeToXmlNode<T>(T o)
        { 
            var doc = new XmlDocument();
            using (XmlWriter writer = doc.CreateNavigator().AppendChild())
            {
                new XmlSerializer(o.GetType()).Serialize(writer, o);
            }
            return doc.DocumentElement;
        }

        public static void AddNode(this XmlElement ele, string nodeName, string value)
        { 
            var code = ele.OwnerDocument.CreateElement(nodeName);
            code.InnerText = value;
            ele.AppendChild(code);
        }

        public static string Load(string fileName, string path )
        {
            var root = ConstantVariables.DefaultMedia;
            if (root[root.Length - 1] == '/')
            {
                root = root.Substring(0, root.Length - 1);
            }

            var dir = root;

            if (path.HasValue())
            {
                var arr = path.Split('/').ToList();
                foreach (var a in arr)
                {
                    dir += "/" + a;
                    if (!Directory.Exists(dir))
                    {
                        Directory.CreateDirectory(dir);
                    }
                }
            }


            fileName = fileName.RemoveSpecialChars();

            var fp = dir + "/" + fileName + ".xml";

            if (!File.Exists(fp))
                return null;

            var content = File.ReadAllText(fp);
            if (!content.HasValue())
            {
                File.Delete(fp);
                return null;
            }

            string result = null;
            XmlDocument xmlDocument = new XmlDocument();
            int attempts = 5;
            Exception cannotReadException = null;

            while (attempts > 0)
            {
                try
                {
                    using (FileStream fileStream = new FileStream(fp, FileMode.Open, FileAccess.Read, FileShare.ReadWrite))
                    {
                        xmlDocument.Load(fileStream);
                        var body = xmlDocument.SelectSingleNode("body");
                        result = body.SelectSingleNode("data")?.InnerText; 
                        attempts = 0;
                    }
                }
                catch (Exception exception)
                {
                    if (exception.Message == "Root element is missing.")
                        return null;

                    cannotReadException = exception;
                    Thread.Sleep(100);
                    attempts--;
                }
            }

            if (cannotReadException != null)
            {
                throw cannotReadException;
            }

            return result;
        }

        public static bool Save(string fileName, string path, string data)
        {
            try
            {
                fileName = fileName.RemoveSpecialChars();
                var dir = ConstantVariables.DefaultMedia;
                if (dir[dir.Length - 1] == '/')
                {
                    dir = dir.Substring(0, dir.Length - 1);
                }
                //var dir = root;

                if (path.HasValue())
                {
                    var arr = path.Split('/').ToList();
                    foreach (var a in arr)
                    {
                        dir += "/" + a;
                        if (!Directory.Exists(dir))
                        {
                            Directory.CreateDirectory(dir);
                        }
                    }
                }


                //if (!string.IsNullOrEmpty(folder))
                //{
                //    dir += "/" + folder;
                //    if (!Directory.Exists(dir))
                //    {
                //        Directory.CreateDirectory(dir);
                //    }
                //}

                var f = dir + "/" + fileName + ".xml";

                if (File.Exists(f))
                {
                    File.Delete(f);
                }

                XmlDocument doc = new XmlDocument();

                //(1) the xml declaration is recommended, but not mandatory
                XmlDeclaration xmlDeclaration = doc.CreateXmlDeclaration("1.0", "UTF-8", null);
                XmlElement root = doc.DocumentElement;
                doc.InsertBefore(xmlDeclaration, root);

                //(2) string.Empty makes cleaner code
                XmlElement e1 = doc.CreateElement(string.Empty, "body", string.Empty);
                doc.AppendChild(e1);

                XmlElement e2 = doc.CreateElement(string.Empty, "data", string.Empty);
                e2.AppendChild(doc.CreateTextNode(data));
                e1.AppendChild(e2);
                 
                doc.Save(f);

                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public static void Delete(string fileName, string folder)
        {
            var dir = ConstantVariables.DefaultMedia + "/";
            if (!string.IsNullOrEmpty(folder))
            {
                dir += "/" + folder;
            }

            if (Directory.Exists(dir))
            {
                fileName = fileName.RemoveSpecialChars();

                var files = Directory.GetFiles(dir, fileName + "*");
                foreach (var file in files)
                {
                    File.Delete(file);
                }
            }
        }
    }
}