using Dominio.Entidades;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Interface.RepositorioI
{
    public interface IServicoRepositorio
    {
        Task<Servico> addAsync(Servico servicio);
        Task removeAsyc(Servico servicio);
        Task<Servico?> getAsyc(int id);
        Task<IEnumerable<Servico>>
            getAllAsync(Expression<Func<Servico, bool>>
                        expression);
        Task updateAsync(Servico servicio);
    }
}
