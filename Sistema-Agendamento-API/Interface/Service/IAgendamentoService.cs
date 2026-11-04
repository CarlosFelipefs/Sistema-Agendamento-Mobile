using Dominio.Dto;
using Dominio.Entidades;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Interface.Service
{
    public interface IAgendamentoService
    {
        Task<AgendamentoDto> addAsync(AgendamentoDto agendamentoDto);
        Task removeAsyc(int id);
        Task<AgendamentoDto?> getAsyc(int id);
        Task<IEnumerable<AgendamentoDto>>
            getAllAsync(Expression<Func<Agendamento, bool>>
                        expression);
        Task updateAsync(AgendamentoDto agendamentoDto);
        Task<IEnumerable<AgendamentoDto>> getByClienteAsync(int idCliente);
    }
}
