using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Service.Core.Variables
{
    public class MailOut
    {
        public string Title { get; set; }
        public string Sender { get; set; }
        public string To { get; set; }
        public string Cc { get; set; }
        public string Type { get; set; }
        public string Attach { get; set; }

    }
}
