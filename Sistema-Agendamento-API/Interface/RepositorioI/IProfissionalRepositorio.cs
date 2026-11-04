using Dominio.Entidades;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Interface.RepositorioI
{
    public interface IProfissionalRepositorio
    {
        Task<Profissional> addAsync(Profissional profissional);
        Task removeAsyc(Profissional profissional);
        Task<Profissional?> getAsyc(int id);
        Task<IEnumerable<Profissional>>
            getAllAsync(Expression<Func<Profissional, bool>>
                        expression);
        Task updateAsync(Profissional profissional);
    }
}
