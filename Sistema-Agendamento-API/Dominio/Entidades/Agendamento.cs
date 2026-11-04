using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Dominio.Entidades
{
    public class Agendamento
    {
        public int Id { get; set; }

        public int idServico { get; set; }
        public Servico? servico { get; set; }
        public int idProfissional { get; set; }
        public Profissional? profissional { get; set; }

        public int idCliente { get; set; }
        public Cliente? cliente { get; set; }

        public int EmpresaId { get; set; }
        public Empresa? Empresa { get; set; }

        public DateTime DataHora { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
