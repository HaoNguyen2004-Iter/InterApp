using System.Collections.Generic;
using System.Linq; 

namespace Service.Core.Variables
{
    public class CommandResult<T>
    {
        public bool Success { get; set; }
        public T Data { get; set; }
        public string Message { get; set; }
        public CommandResult(bool success, string message, T data)
        {
            Success = success;
            Message = message;
            Data = data;
        }
        public CommandResult(bool success)
        {
            Success = success;
        }
        public CommandResult()
        {
        }
        public CommandResult(T data)
        {
            Success = true;
            Data = data;
        }
        public CommandResult(bool success, T data)
        {
            Success = success;
            Data = data;
        }
        public CommandResult(string message)
        {
            Success = false;
            Message = message;
        }
    }
}