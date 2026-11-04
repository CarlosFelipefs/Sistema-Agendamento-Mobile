using Dominio.Entidades;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Interface.RepositorioI
{
    public interface IClienteRepositorio
    {
        Task<Cliente> addAsync(Cliente cliente);
        Task removeAsyc(Cliente cliente);
        Task<Cliente?> getAsyc(int id);
        Task<IEnumerable<Cliente>>
            getAllAsync(Expression<Func<Cliente, bool>>
                        expression);
        Task updateAsync(Cliente cliente);
    }
}
