using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using AutoMapper;
using Dominio.Entidades;
using Dominio.Dto;
using Interface.RepositorioI;
using Interface.Service;

namespace Service
{
    public class AgendamentoService : IAgendamentoService
    {
        private readonly IAgendamentoRepositorio _repositorio;
        private readonly IClienteService _clienteService;
        private readonly IProfissionalService _profissionalService;
        private readonly IServicoService _servicoService;
        private readonly IEmpresaService _empresaService;
        private readonly IMapper _mapper;

        public AgendamentoService(
            IAgendamentoRepositorio repositorio,
            IMapper mapper,
            IClienteService clienteService,
            IProfissionalService profissionalService,
            IServicoService servicoService,
            IEmpresaService empresaService)
        {
            _repositorio = repositorio;
            _mapper = mapper;
            _clienteService = clienteService;
            _profissionalService = profissionalService;
            _servicoService = servicoService;
            _empresaService = empresaService;
        }

        public async Task<AgendamentoDto> addAsync(AgendamentoDto agendamentoDto)
        {
            // 🔹 Verifica se o profissional existe
            var profissional = await _profissionalService.getAsyc(agendamentoDto.idProfissional);
            if (profissional == null)
                throw new Exception("Profissional informado não existe.");

            // 🔹 Verifica se o serviço existe
            var servico = await _servicoService.getAsyc(agendamentoDto.idServico);
            if (servico == null)
                throw new Exception("Serviço informado não existe.");

            // 🔹 Verifica conflito de horário do profissional
            var conflito = (await _repositorio.getAllAsync(a =>
                a.idProfissional == agendamentoDto.idProfissional &&
                a.DataHora == agendamentoDto.DataHora)).Any();

            if (conflito)
                throw new Exception("O profissional já possui um agendamento nesse horário.");

            // 🔹 Cria o agendamento
            var entidade = _mapper.Map<Agendamento>(agendamentoDto);
            entidade = await _repositorio.addAsync(entidade);
            return _mapper.Map<AgendamentoDto>(entidade);
        }

        public async Task<IEnumerable<AgendamentoDto>> getAllAsync(Expression<Func<Agendamento, bool>> expression)
        {
            var lista = await _repositorio.getAllAsync(expression);
            return _mapper.Map<IEnumerable<AgendamentoDto>>(lista);
        }

        public async Task<AgendamentoDto> getAsyc(int id)
        {
            var agendamento = await _repositorio.getAsyc(id);
            return _mapper.Map<AgendamentoDto>(agendamento);
        }

        public async Task removeAsyc(int id)
        {
            var agendamento = await _repositorio.getAsyc(id);
            if (agendamento != null)
                await _repositorio.removeAsyc(agendamento);
        }

        public async Task updateAsync(AgendamentoDto agendamentoDto)
        {
            var existente = await _repositorio.getAsyc(agendamentoDto.Id);
            if (existente == null)
                throw new Exception("Agendamento não encontrado para atualização.");

            if (existente.Status == "Executado" && agendamentoDto.Status == "Cancelado")
                throw new Exception("Não é permitido cancelar um agendamento já executado.");

            var agendamento = _mapper.Map<Agendamento>(agendamentoDto);
            await _repositorio.updateAsync(agendamento);
        }

        public async Task<IEnumerable<AgendamentoDto>> getByClienteAsync(int idCliente)
        
        {
            var lista = await _repositorio.getAllAsync(a => a.idCliente == idCliente);

            var resultado = new List<AgendamentoDto>();

            foreach (var ag in lista)
            {
                var dto = _mapper.Map<AgendamentoDto>(ag);

                var servico = await _servicoService.getAsyc(ag.idServico);
                var profissional = await _profissionalService.getAsyc(ag.idProfissional);
                var empresa = await _empresaService.getAsyc(ag.EmpresaId); // <- BUSCA CORRETA

                dto.ServicoNome = servico?.nome ?? "Não informado";
                dto.ProfissionalNome = profissional?.nome ?? "Não informado";
                dto.EmpresaNome = empresa?.Nome ?? "Não informado";

                resultado.Add(dto);
            }

            return resultado;
        }



    }
}
