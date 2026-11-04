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
    public interface IProfissionalService
    {
        Task<ProfissionalDto> addAsync(ProfissionalDto profissionalDto);
        Task removeAsyc(int id);
        Task<ProfissionalDto?> getAsyc(int id);
        Task<IEnumerable<ProfissionalDto>>
            getAllAsync(Expression<Func<Profissional, bool>>
                        expression);
        Task updateAsync(ProfissionalDto profissional);
    }
}
