using Service.Utility.Components;

namespace Service.BMWindows.Executes.Base
{
    public class BaseService
    {
        public CachingComponent Caching { get; set; }

        public BaseService()
        {
            Caching = new CachingComponent();
        }
    }
}