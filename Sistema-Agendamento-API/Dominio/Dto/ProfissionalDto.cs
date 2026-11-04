using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Dominio.Dto
{
    public class ProfissionalDto
    {
        public int Id { get; set; }
        public string nome { get; set; } = string.Empty;
        public string especialidade { get; set; } = string.Empty;
        public int EmpresaId { get; set; }

    }
}
