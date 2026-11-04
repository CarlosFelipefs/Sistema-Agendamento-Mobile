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
    public interface IClienteService
    {
        Task<ClienteDto> addAsync(ClienteDto clientedto);
        Task removeAsyc(int id);
        Task<ClienteDto?> getAsyc(int id);
        Task<IEnumerable<ClienteDto>>
            getAllAsync(Expression<Func<Cliente, bool>>
                        expression);
        Task updateAsync(ClienteDto cliente);
    }
}
