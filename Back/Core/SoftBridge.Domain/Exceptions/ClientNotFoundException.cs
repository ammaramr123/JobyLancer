using System;
using System.Collections.Generic;
using System.Text;

namespace SoftBridge.Domain.Exceptions
{
    public class ClientNotFoundException : NotFoundExceptionCustome
    {
        public ClientNotFoundException(string message) : base(message)
        {
        }
    }
}
