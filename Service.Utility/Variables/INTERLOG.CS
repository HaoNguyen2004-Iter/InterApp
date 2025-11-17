 
using Service.Utility.Components;

namespace Service.Utility.Variables
{
    public class InterLog
    {
        public AuthDataModel Perform { get; set; }

        public string PerformedBy
        {
            get
            {
                if (Perform != null)
                {
                    return Perform.UserId + ";" + ";" + Perform.FullName;
                }
                return "";
            }
        }
    }
}