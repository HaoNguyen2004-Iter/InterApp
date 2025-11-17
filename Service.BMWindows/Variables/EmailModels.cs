namespace Service.Core.Variables
{
    public class EmailDataModel<T>
    {
        public T Data { get; set; }
        public string Link { get; set; }
        public string Domain { get; set; }
    }
}