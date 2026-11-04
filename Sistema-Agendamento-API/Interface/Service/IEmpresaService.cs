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
    public interface IEmpresaService
    {
        Task<EmpresaDto> addAsync(EmpresaDto empresaDto);
        Task removeAsyc(int id);
        Task<EmpresaDto?> getAsyc(int id);
        Task<IEnumerable<EmpresaDto>>
            getAllAsync(Expression<Func<Empresa, bool>>
                        expression);
        Task updateAsync(EmpresaDto empresa);
        Task<IEnumerable<EmpresaDto>> GetEmpresasProximasAsync(double latitude, double longitude, double raioKm);
        Task<IEnumerable<EmpresaDto>> GetEmpresasPorCidadeAsync(string cidade);

    }
}
