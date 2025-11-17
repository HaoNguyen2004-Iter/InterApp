using Microsoft.Office.Interop.Word;
using System;
using System.Drawing;
using System.IO;
using System.Threading;

namespace Service.Utility.Components
{
    public class WordComponent
    {
        public Document Doc { get; set; }
        private readonly Application _wordApp = new Application { Visible = false };
        public WordComponent() { }
        public WordComponent(string path)
        {
            var fp = FileComponent.GetFullPath(path);
            Doc = _wordApp.Documents.Open(fp, ReadOnly: false, Visible: false);
            Doc.Activate();
        }

        public void Load(string path)
        {
            var fp = FileComponent.GetFullPath(path);
            Doc = _wordApp.Documents.Open(fp, ReadOnly: false, Visible: false);
            Doc.Activate();
        }

        public void FindAndReplace(object findText, object replaceWithText)
        {
            //options
            object matchCase = false;
            object matchWholeWord = true;
            object matchWildCards = false;
            object matchSoundsLike = false;
            object matchAllWordForms = false;
            object forward = true;
            object format = false;
            object matchKashida = false;
            object matchDiacritics = false;
            object matchAlefHamza = false;
            object matchControl = false;
            object read_only = false;
            object visible = true;
            object replace = 2;
            object wrap = 1;
            //execute find and replace
            _wordApp.Selection.Find.Execute(ref findText, ref matchCase, ref matchWholeWord,
                 ref matchWildCards, ref matchSoundsLike, ref matchAllWordForms, ref forward, ref wrap, ref format, ref replaceWithText, ref replace,
                 ref matchKashida, ref matchDiacritics, ref matchAlefHamza, ref matchControl);
        }

        public void FindAndReplaceImage(string findText, string imagePath, int imgWidth)
        {
            float imgH;
            float imgW;
            using (var i = Image.FromFile(imagePath))
            {
                var w = i.Width;
                var h = i.Height;

                var scale = (float)imgWidth / w;

                imgH = h * scale;
                imgW = w * scale;
            }

            //----------------------Replace--------------------------------
            Find fnd = _wordApp.ActiveWindow.Selection.Find;
            fnd.ClearFormatting();
            fnd.Replacement.ClearFormatting();
            fnd.Forward = true;
            fnd.Wrap = WdFindWrap.wdFindContinue;

            var keyword = findText;
            var sel = _wordApp.Selection;
            sel.Find.Text = string.Format("[{0}]", keyword);
            _wordApp.Selection.Find.Execute(keyword);

            var range = _wordApp.Selection.Range;
            if (range.Text.Contains(keyword))
            {
                var temprange = Doc.Range(range.End - keyword.Length, range.End);
                temprange.Select();
                sel.Find.Execute(Replace: WdReplace.wdReplaceOne);
                sel.Range.Select();
                var imagePath1 = Path.GetFullPath(string.Format(imagePath, keyword));
                var img = sel.InlineShapes.AddPicture(FileName: imagePath1, LinkToFile: false, SaveWithDocument: true);
                img.Width = imgW;
                img.Height = imgH;
            }
        }

        public void SaveAs(string path)
        {
            var fp = FileComponent.GetFullPath(path);
            if (File.Exists(fp))
            {
                var deleted = false;
                while (!deleted)
                {
                    try
                    {
                        File.Delete(fp);
                        deleted = true;
                    }
                    catch (Exception)
                    {
                        deleted = false;
                        Thread.Sleep(300);
                    }
                }

            }
            Doc.SaveAs(fp);
            Doc.Close();
        }

    }
}
