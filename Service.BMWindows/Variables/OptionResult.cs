namespace Service.Core.Variables
{
    public class OptionResult
    {
        public int? Page { get; set; }
        public int? Limit { get; set; }
        public bool Unlimited { get; set; }
        public bool? HasCount { get; set; }
        public string OrderType { get; set; }
        public string OrderBy { get; set; }
        public int? Skip { get; set; }
    }
}