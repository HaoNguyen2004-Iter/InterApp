using System;

namespace Service.Utility.Components
{
    public class AuthDataModel
    {
        public Guid UserId { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string FullName { get; set; }
        public string Image { get; set; }
        public int? Status { get; set; }
        public bool Male { get; set; }
        public DateTime ExpireTime { get; set; }
    }
}
