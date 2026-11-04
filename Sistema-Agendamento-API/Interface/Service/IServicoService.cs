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
    public interface IServicoService
    {
        Task<ServicoDto> addAsync(ServicoDto servicioDto);
        Task removeAsyc(int id);
        Task<ServicoDto?> getAsyc(int id);
        Task<IEnumerable<ServicoDto>>
            getAllAsync(Expression<Func<Servico, bool>>
                        expression);
        Task updateAsync(ServicoDto servicio);
    }
}
