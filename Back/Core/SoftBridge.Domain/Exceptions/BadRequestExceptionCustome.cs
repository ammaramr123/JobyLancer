using System;
using System.Collections.Generic;
using System.Text;

namespace SoftBridge.Domain.Exceptions
{
    public class BadRequestExceptionCustome : Exception
    {
        public readonly IEnumerable<string>? _errors;
        public BadRequestExceptionCustome(string message, IEnumerable<string>? errors = null) 
            : base(message)
        {
            _errors = errors;
        }
    }
}
