using System;
using System.Collections.Generic;
using System.Data.Entity.Validation;
using System.Linq;
using System.Text; 

namespace Service.Utility.Variables
{
    public class QueryResult<T>
    {
        public int Count { get; set; }
        public int TotalChild { get; set; }
        public List<T> Many { get; set; }
        public int Skip { get; set; }
        public int Take { get; set; }
        public string Message { get; set; }
        public QueryResult(IQueryable<T> query, OptionResult option)
        {
            if (query != null)
            {
                if (option != null)
                {
                    if (option.HasCount.HasValue && option.HasCount.Value)
                    {
                        Count = query.Count();
                    }
                    if (!option.Page.HasValue || option.Page.Value == 0)
                    {
                        option.Page = 1;
                    }
                    option.Page = option.Page.Value - 1;
                    if (!option.Limit.HasValue)
                    {
                        option.Limit = 20;
                    }
                }
                else
                {
                    option = new OptionResult
                    {
                        Page = 0,
                        Limit = 20
                    };
                }
                var skip = option.Skip ?? option.Page.Value*option.Limit.Value;
                try
                {
                    Many = option.Unlimited ? query.ToList() : query.Skip(skip).Take(option.Limit.Value).ToList();
                }
                catch (DbEntityValidationException e)
                {
                    StringBuilder sb = new StringBuilder();
                    foreach (var eve in e.EntityValidationErrors)
                    {
                        foreach (var ve in eve.ValidationErrors)
                        {
                            sb.AppendLine(string.Format("- Property: \"{0}\", Error: \"{1}\"",
                                ve.PropertyName,
                                ve.ErrorMessage));
                        }
                    }
                    Console.WriteLine(sb.ToString());
                    throw;

                }
            }
        }

        public QueryResult(List<T> query, OptionResult option)
        {
            if (query != null)
            {
                if (option != null)
                {
                    if (option.HasCount.HasValue && option.HasCount.Value)
                    {
                        Count = query.Count();
                    }
                    if (!option.Page.HasValue || option.Page.Value == 0)
                    {
                        option.Page = 1;
                    }
                    option.Page = option.Page.Value - 1;
                    if (!option.Limit.HasValue)
                    {
                        option.Limit = 20;
                    }
                }
                else
                {
                    option = new OptionResult
                    {
                        Page = 0,
                        Limit = 20
                    };
                }
                var skip = option.Skip ?? option.Page.Value * option.Limit.Value;
                Many = option.Unlimited ? query.ToList() : query.Skip(skip).Take(option.Limit.Value).ToList();
            }
        }

        public QueryResult(OptionResult option)
        {
            if (option != null)
            {
                if (!option.Page.HasValue || option.Page.Value == 0)
                {
                    option.Page = 1;
                }
                option.Page = option.Page.Value - 1;
                if (!option.Limit.HasValue)
                {
                    option.Limit = 20;
                }
            }
            else
            {
                option = new OptionResult
                {
                    Page = 0,
                    Limit = 20
                };
            }
            Skip = option.Skip ?? option.Page.Value * option.Limit.Value;
            Take = option.Limit.Value;
        }

        public QueryResult(string message)
        {
            Message = message;
        }
        public QueryResult()
        {
            Count = 0;
            Many = new List<T>();
        }
        
    }
}