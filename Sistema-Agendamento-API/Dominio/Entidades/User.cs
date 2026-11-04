using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Dominio.Entidades
{
    public class User
    {
        public int Id { get; set; }
        public string user { get; set; } = string.Empty;
        public string senha { get; set; } = string.Empty;
        public int? ClienteId { get; set; }
        public Cliente? Cliente { get; set; }
    }
}
