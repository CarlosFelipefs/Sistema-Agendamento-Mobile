using AutoMapper;
using Dominio.Dto;
using Dominio.Entidades;
using Interface.RepositorioI;
using Interface.Service;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Service
{
    public class EmpresaService : IEmpresaService
    {
        private IEmpresaRepositorio repositorio;

        private IMapper mapper;
        private IProfissionalService profissionalService;
        private IServicoService servicoService;

        public EmpresaService(IEmpresaRepositorio repositorio,
            IMapper mapper,
            IProfissionalService profissionalService,IServicoService servicoService)
        {
            this.repositorio = repositorio;
            this.mapper = mapper;
            this.profissionalService = profissionalService;
            this.servicoService = servicoService;
        }

        public async Task<EmpresaDto> addAsync(EmpresaDto empresaDto)
        {
            var entidade = mapper.Map<Empresa>(empresaDto);
            entidade = await this.repositorio.addAsync(entidade);
            return mapper.Map<EmpresaDto>(entidade);
        }

        public async Task<IEnumerable<EmpresaDto>> getAllAsync(Expression<Func<Empresa, bool>> expression)
        {
            var listaCat =
               await this.repositorio.getAllAsync(expression);
            return mapper.Map<IEnumerable<EmpresaDto>>(listaCat);
        }

        public async Task<EmpresaDto?> getAsyc(int id)
        {
            var empresa = await repositorio.getAsyc(id); // já faz Include de Servicos e Profissionais
            if (empresa == null) return null;

            return new EmpresaDto
            {
                Id = empresa.Id,
                Nome = empresa.Nome,
                Endereco = empresa.Endereco,
                Cidade = empresa.Cidade,
                Estado = empresa.Estado,
                Cep = empresa.Cep,
                Telefone = empresa.Telefone,
                Categoria = empresa.Categoria,
                Servicos = empresa.Servicos?.Select(s => new ServicoDto
                {
                    Id = s.Id,
                    nome = s.nome,
                    preco = s.preco,
                    DuracaoEmMinutos = s.DuracaoEmMinutos
                }).ToList() ?? new List<ServicoDto>(),
                Profissionais = empresa.Profissionais?.Select(p => new ProfissionalDto
                {
                    Id = p.Id,
                    nome = p.nome,
                    especialidade = p.especialidade
                }).ToList() ?? new List<ProfissionalDto>()
            };
        }



        public async Task removeAsyc(int id)
        {
            var empresa = await this.repositorio.getAsyc(id);

            if (empresa == null)
                throw new Exception("Empresa não encontrada.");

            // 🔹 Remove serviços vinculados
            if (empresa.Servicos != null && empresa.Servicos.Any())
            {
                var servicos = await servicoService.getAllAsync(s => s.EmpresaId == id);
                foreach (var servico in servicos)
                    await servicoService.removeAsyc(servico.Id);
            }

            // 🔹 Remove profissionais vinculados
            if (empresa.Profissionais != null && empresa.Profissionais.Any())
            {
                var profissionais = await profissionalService.getAllAsync(p => p.EmpresaId == id);
                foreach (var prof in profissionais)
                    await profissionalService.removeAsyc(prof.Id);
            }

            // 🔹 Agora remove a empresa
            await this.repositorio.removeAsyc(empresa);
        }


        public async Task updateAsync(EmpresaDto empresaDto)
        {
            var empresa = await repositorio.getAsyc(empresaDto.Id);

            if (empresa == null)
                throw new Exception("Empresa não encontrada.");

            // Atualiza dados principais
            empresa.Nome = empresaDto.Nome;
            empresa.Endereco = empresaDto.Endereco;
            empresa.Cidade = empresaDto.Cidade;
            empresa.Estado = empresaDto.Estado;
            empresa.Cep = empresaDto.Cep;
            empresa.Telefone = empresaDto.Telefone;
            empresa.Categoria = empresaDto.Categoria;
            empresa.Latitude = empresaDto.Latitude;
            empresa.Longitude = empresaDto.Longitude;

            // 🔹 Atualiza Serviços
            var servicosExistentes = empresa.Servicos.ToList();

            // Remove serviços que não vieram no DTO
            foreach (var servico in servicosExistentes)
            {
                if (!empresaDto.Servicos.Any(s => s.Id == servico.Id))
                    await servicoService.removeAsyc(servico.Id);
            }

            // Adiciona/atualiza serviços
            foreach (var servicoDto in empresaDto.Servicos)
            {
                servicoDto.EmpresaId = empresa.Id;

                if (servicoDto.Id == 0)
                {
                    await servicoService.addAsync(servicoDto);
                }
                else
                {
                    await servicoService.updateAsync(servicoDto);
                }
            }

            // 🔹 Atualiza Profissionais
            var profissionaisExistentes = empresa.Profissionais.ToList();

            // Remove profissionais que não vieram no DTO
            foreach (var prof in profissionaisExistentes)
            {
                if (!empresaDto.Profissionais.Any(p => p.Id == prof.Id))
                    await profissionalService.removeAsyc(prof.Id);
            }

            // Adiciona/atualiza profissionais
            foreach (var profDto in empresaDto.Profissionais)
            {
                profDto.EmpresaId = empresa.Id;

                if (profDto.Id == 0)
                {
                    await profissionalService.addAsync(profDto);
                }
                else
                {
                    await profissionalService.updateAsync(profDto);
                }
            }

            // 🔹 Atualiza empresa
            await repositorio.updateAsync(empresa);

        }


        public async Task<IEnumerable<EmpresaDto>> GetEmpresasProximasAsync(double latitude, double longitude, double raioKm)
        {
            var empresas = await this.repositorio.getAllAsync(e => true);

            /*

              var proximas = empresas

                  .Where(e => CalcularDistancia(latitude, longitude, e.Latitude, e.Longitude) <= raioKm)
                  .OrderBy(e => e.Nome);
            */
            var proximas = empresas
              .Select(e =>
              {
                  var distancia = CalcularDistancia(latitude, longitude, e.Latitude, e.Longitude);
                  var dto = mapper.Map<EmpresaDto>(e);
                  dto.Distancia = Math.Round(distancia, 2); // arredonda p/ 2 casas
                  return dto;
              })
              .Where(dto => dto.Distancia <= raioKm) // filtra dentro do raio
              .OrderBy(dto => dto.Distancia) // ordena pelas mais próximas
              .ToList();
            return mapper.Map<IEnumerable<EmpresaDto>>(proximas);
        }

        // 🔹 Função Haversine para calcular distância
        private double CalcularDistancia(double lat1, double lon1, double lat2, double lon2)
        {
            double R = 6371; // Raio da Terra em km
            double dLat = ToRadians(lat2 - lat1);
            double dLon = ToRadians(lon2 - lon1);

            double a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                       Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
                       Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

            double c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            return R * c;
        }

        private double ToRadians(double deg) => deg * (Math.PI / 180);

        public async Task<IEnumerable<EmpresaDto>> GetEmpresasPorCidadeAsync(string cidade)
        {
            var empresas = await this.repositorio.getAllAsync(e => e.Cidade.ToLower().Contains(cidade.ToLower()));
            return mapper.Map<IEnumerable<EmpresaDto>>(empresas);
        }

    }
}
