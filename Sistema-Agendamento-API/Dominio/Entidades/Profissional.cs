using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Dominio.Entidades
{
    public class Profissional
    {
        public int Id { get; set; }
        public string nome { get; set; } = string.Empty;
        public string especialidade { get; set; } = string.Empty;
        public int EmpresaId { get; set; }
        public Empresa? Empresa { get; set; }

        public virtual List<Agendamento> agendamentos { get; set; }
           = new List<Agendamento>();
    }
}
