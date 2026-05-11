using System;
using System.Collections.Generic;
using System.Text;

namespace SoftBridge.Domain.Exceptions
{
    public class NotFoundExceptionCustome(string message) 
        : Exception(message)
    {
    }
}
