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
    public class ServicoService : IServicoService
    {
        private IServicoRepositorio repositorio;

        private IMapper mapper;
        public ServicoService(IServicoRepositorio repositorio,
        IMapper mapper)
        {
            this.repositorio = repositorio;
            this.mapper = mapper;
        }

        public async Task<ServicoDto> addAsync(ServicoDto servicioDto)
        {
            var entidade = mapper.Map<Servico>(servicioDto);
            entidade = await this.repositorio.addAsync(entidade);
            return mapper.Map<ServicoDto>(entidade);
        }

        public async Task<IEnumerable<ServicoDto>> getAllAsync(Expression<Func<Servico, bool>> expression)
        {
            var listaCat =
               await this.repositorio.getAllAsync(expression);
            return mapper.Map<IEnumerable<ServicoDto>>(listaCat);
        }

        public async Task<ServicoDto> getAsyc(int id)
        {
            var cat = await this.repositorio.getAsyc(id);
            return mapper.Map<ServicoDto>(cat);
        }

        public async Task removeAsyc(int id)
        {
            var cat = await this.repositorio.getAsyc(id);
            if (cat != null)
                await this.repositorio.removeAsyc(cat);
        }

        public async Task updateAsync(ServicoDto servicio)
        {
            var cat = mapper.Map<Servico>(servicio);
            await this.repositorio.updateAsync(cat);
        }
    }
}
