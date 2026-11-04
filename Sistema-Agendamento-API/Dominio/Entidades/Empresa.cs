using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Dominio.Entidades
{
    public class Empresa
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

            public virtual List<Profissional> Profissionais { get; set; }
            = new List<Profissional>();

            public virtual List<Servico> Servicos { get; set; }
             = new List<Servico>();
    }           

}
