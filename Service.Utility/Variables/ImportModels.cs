using System.Collections.Generic;

namespace Service.Utility.Variables
{
    public class ImportErrorModel
    {
        public int Row { get; set; }
        public bool Error { get; set; }
        public string Message { get; set; }
    }

    public class ImporterEditModel
    {
        public int Step { get; set; }
        public string File { get; set; }
        public List<int> Sheets { get; set; }
        public int Page { get; set; }
        public int Limit { get; set; }
        public int DateFormat { get; set; }
        public int Type { get; set; }
    }

    public class ImporterResultModel
    {
        public int Step { get; set; }
        public string Path { get; set; }
        public int Total { get; set; }
        public List<ImportErrorModel> Errors { get; set; }
    }
}