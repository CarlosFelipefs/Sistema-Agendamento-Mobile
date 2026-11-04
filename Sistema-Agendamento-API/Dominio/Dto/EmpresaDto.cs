using Dominio.Entidades;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Dominio.Dto
{
    public class EmpresaDto
    {
        public int Id { get; set; }
        public string Nome { get; set; }
        public string Endereco { get; set; }
        public string Cidade { get; set; }
        public string Estado { get; set; }
        public string Cep { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string Telefone { get; set; }
        public string Categoria { get; set; }

        public double Distancia { get; set; }

        public List<ServicoDto> Servicos { get; set; } = new List<ServicoDto>();
        public List<ProfissionalDto> Profissionais { get; set; } = new List<ProfissionalDto>();

    }
}
