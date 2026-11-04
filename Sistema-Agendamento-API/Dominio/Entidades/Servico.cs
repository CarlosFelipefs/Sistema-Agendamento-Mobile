using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Dominio.Entidades
{
    public class Servico
    {
        public int Id { get; set; }
        public string nome { get; set; } = string.Empty;
        public int DuracaoEmMinutos { get; set; }
        public decimal preco { get; set; }
        public int EmpresaId { get; set; }
        public Empresa? Empresa { get; set; }

        public virtual List<Agendamento> agendamentos { get; set; }
           = new List<Agendamento>();
    }
}
