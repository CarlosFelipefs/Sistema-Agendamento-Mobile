using AutoMapper;
using Dominio.Dto;
using Dominio.Entidades;
using Interface.RepositorioI;
using Interface.Service;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Service
{
    public class ProfissionalService : IProfissionalService
    {
        private IProfissionalRepositorio repositorio;

        private IMapper mapper;

        public ProfissionalService(IProfissionalRepositorio repositorio,
            IMapper mapper)
        {
            this.repositorio = repositorio;
            this.mapper = mapper;
        }

        public async Task<ProfissionalDto> addAsync(ProfissionalDto profissionalDto)
        {
            var entidade = mapper.Map<Profissional>(profissionalDto);
            entidade = await this.repositorio.addAsync(entidade);
            return mapper.Map<ProfissionalDto>(entidade);
        }

        public async Task<IEnumerable<ProfissionalDto>> getAllAsync(Expression<Func<Profissional, bool>> expression)
        {
            var listaCat =
               await this.repositorio.getAllAsync(expression);
            return mapper.Map<IEnumerable<ProfissionalDto>>(listaCat);
        }

        public async Task<ProfissionalDto> getAsyc(int id)
        {
            var cat = await this.repositorio.getAsyc(id);
            return mapper.Map<ProfissionalDto>(cat);
        }

        public async Task removeAsyc(int id)
        {
            var cat = await this.repositorio.getAsyc(id);
            if (cat != null)
                await this.repositorio.removeAsyc(cat);
        }

        public async Task updateAsync(ProfissionalDto profissional)
        {
            var cat = mapper.Map<Profissional>(profissional);
            await this.repositorio.updateAsync(cat);
        }
    }
}
