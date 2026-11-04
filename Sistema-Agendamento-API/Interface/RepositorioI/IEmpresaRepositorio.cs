using Dominio.Entidades;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Interface.RepositorioI
{
    public interface IEmpresaRepositorio
    {
        Task<Empresa> addAsync(Empresa empresa);
        Task removeAsyc(Empresa empresa);
        Task<Empresa?> getAsyc(int id);
        Task<IEnumerable<Empresa>>
            getAllAsync(Expression<Func<Empresa, bool>>
                        expression);
        Task updateAsync(Empresa empresa);
        IQueryable<Empresa> GetQueryable();
    }
}
