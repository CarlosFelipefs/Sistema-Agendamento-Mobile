using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Dominio.Entidades
{
    public class Cliente
    {
        public int Id { get; set; }
        public String nome { get; set; } = String.Empty;
        public String email { get; set; } = string.Empty;
        public String telefone { get; set; } = string.Empty;
        public User? User { get; set; }

        public virtual List<Agendamento> agendamentos { get; set; }
           = new List<Agendamento>();
    }
}
