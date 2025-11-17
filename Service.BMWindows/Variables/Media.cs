namespace Service.Core.Variables
{
    public class MediaItem
    {
        public int id { get; set; }
        public string name { get; set; }
        public string type { get; set; }
        public string path { get; set; }
        public string size { get; set; }
        public string share_status { get; set; }
        public bool isFull { get; set; }
        public string dimensions { get; set; }
    }

}