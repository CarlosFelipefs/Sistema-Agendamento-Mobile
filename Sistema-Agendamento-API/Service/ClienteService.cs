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
    public class ClienteService : IClienteService
    {
        private IClienteRepositorio repositorio;

        private IMapper mapper;

        public ClienteService(IClienteRepositorio repositorio,
            IMapper mapper)
        {
            this.repositorio = repositorio;
            this.mapper = mapper;
        }

        public async Task<ClienteDto> addAsync(ClienteDto cliente)
        {
            var entidade = mapper.Map<Cliente>(cliente);
            entidade = await this.repositorio.addAsync(entidade);
            return mapper.Map<ClienteDto>(entidade);
        }

        public async Task<IEnumerable<ClienteDto>> getAllAsync(Expression<Func<Cliente, bool>> expression)
        {
            var listaCat =
               await this.repositorio.getAllAsync(expression);
            return mapper.Map<IEnumerable<ClienteDto>>(listaCat);
        }

        public async Task<ClienteDto?> getAsyc(int id)
        {
            var cat = await this.repositorio.getAsyc(id);
            return mapper.Map<ClienteDto>(cat);
        }

        public async Task removeAsyc(int id)
        {
            var cat = await this.repositorio.getAsyc(id);
            if (cat != null)
                await this.repositorio.removeAsyc(cat);
        }

        public async Task updateAsync(ClienteDto cliente)
        {
            var cat = mapper.Map<Cliente>(cliente);
            await this.repositorio.updateAsync(cat);
        }

    }
}
