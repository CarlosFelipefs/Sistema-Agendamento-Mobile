using Dominio.Entidades;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Interface.RepositorioI
{
    public interface IAgendamentoRepositorio
    {
        Task<Agendamento> addAsync(Agendamento agendamento);
        Task removeAsyc(Agendamento agendamento);
        Task<Agendamento?> getAsyc(int id);
        Task<IEnumerable<Agendamento>>
            getAllAsync(Expression<Func<Agendamento, bool>>
                        expression);
        Task updateAsync(Agendamento agendamento);
    }
}
