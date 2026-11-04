using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Dominio.Dto
{
    public class ServicoDto
    {
        public int Id { get; set; }
        public string nome { get; set; } = string.Empty;
        public int DuracaoEmMinutos { get; set; }
        public decimal preco { get; set; }
        public int EmpresaId { get; set; }
    }
}
