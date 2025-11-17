using System;

namespace Service.Utility.Variables
{
    public class BaseJsonModel
    {
        public int id { get; set; }
        public string text { get; set; }
    }

    public class OtpVerifyModel<T>
    {
        public int Step { get; set; }
        public string Code { get; set; }
        public DateTime? Duration { get; set; }
        public bool Verify { get; set; }
        public T Data { get; set; }
        public string Message { get; set; }
    }   
}