using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using Service.Utility.Variables;

namespace Service.Idea.Variables
{
    public class ProductSuggestion
    {
        public int Id { get; set; }
        public string ProductName { get; set; }
        public string Attributes { get; set; }

        public string Name
        {
            get
            {
                if (!string.IsNullOrEmpty(Attributes))
                {
                    var attrs = JsonSerializer.Deserialize<List<BaseJsonModel>>(Attributes);
                    var text = attrs.Select(x => x.text).ToList();
                    var n = ProductName + " - " + string.Join(" - ", text);
                    return n;
                }

                return ProductName;
            }
        }
        public int Media { get; set; }
        public int Type { get; set; }
        public string UnitName { get; set; }
        public string Code { get; set; }
        public string Sub { get; set; }
        public decimal SalePrice { get; set; }
    }

    
}