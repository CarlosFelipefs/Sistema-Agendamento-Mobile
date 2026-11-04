using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Dominio.Dto
{
    public class LoginRequestDto
    {
        public string User { get; set; } = string.Empty;
        public string Senha { get; set; } = string.Empty;
    }
}
