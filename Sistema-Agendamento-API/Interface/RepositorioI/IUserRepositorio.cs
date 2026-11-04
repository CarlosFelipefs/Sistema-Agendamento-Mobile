using Dominio.Entidades;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Interface.RepositorioI
{
    public interface IUserRepositorio
    {
        Task<User> addAsync(User users);
        Task removeAsyc(User users);
        Task<User?> getAsyc(int id);
        Task<IEnumerable<User>>
            getAllAsync(Expression<Func<User, bool>>
                        expression);
        Task updateAsync(User users);
    }
}
