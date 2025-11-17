namespace Service.Core.Variables
{
    public class Category
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public int? Parent { get; set; }
    }
}