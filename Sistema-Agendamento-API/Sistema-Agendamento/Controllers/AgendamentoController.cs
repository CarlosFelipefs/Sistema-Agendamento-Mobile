using Dominio.Dto;
using FluentValidation;
using Interface.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace Sistema_Agendamento.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AgendamentoController : ControllerBase
    {
        private readonly IAgendamentoService _service;
        private readonly IValidator<AgendamentoDto> _validator;
        private readonly IUserService _userService;

        public AgendamentoController(
            IAgendamentoService service,
            IValidator<AgendamentoDto> validator,
            IUserService userService)
        {
            _service = service;
            _validator = validator;
            _userService = userService;
        }

        [HttpPost]
        public async Task<ActionResult<AgendamentoDto>> addAsync(AgendamentoDto agendamentoDto)
        {
            var authHeader = Request.Headers["Authorization"].ToString();
            Console.WriteLine($"[DEBUG] Authorization header: {authHeader}");

            var userIdClaim =
            User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
            User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                return Unauthorized(new { message = "Usuário não autenticado." });

            Console.WriteLine($"[DEBUG] userId (int): {userId}");

            var user = await _userService.getAsyc(userId);
            if (user == null || user.ClienteId == null)
                return BadRequest(new { message = "Usuário não possui cliente associado." });

            agendamentoDto.idCliente = user.ClienteId.Value;

            // 🔹 2. Validação do DTO
            var validationResult = _validator.Validate(agendamentoDto);
            if (!validationResult.IsValid)
                return BadRequest(validationResult.Errors);

            // 🔹 3. Criar agendamento
            var dto = await _service.addAsync(agendamentoDto);
            return Ok(dto);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AgendamentoDto>>> getAllAsync()
        {
            var lista = await _service.getAllAsync(p => true);
            return Ok(lista);
        }

        [HttpGet("filtrar/{status}")]
        public async Task<ActionResult<IEnumerable<AgendamentoDto>>> getDescricaoAsync(string status)
        {
            var lista = await _service.getAllAsync(p => p.Status.Contains(status));
            return Ok(lista);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AgendamentoDto>> getAsync(int id)
        {
            var agendamento = await _service.getAsyc(id);
            if (agendamento == null)
                return NotFound();
            return Ok(agendamento);
        }

        [HttpPut]
        public async Task<ActionResult> updateAsync(AgendamentoDto agendamentoDto)
        {
            var validationResult = _validator.Validate(agendamentoDto);
            if (!validationResult.IsValid)
                return BadRequest(validationResult.Errors);

            await _service.updateAsync(agendamentoDto);
            return NoContent();
        }

        [HttpGet("cliente")]
        public async Task<ActionResult<IEnumerable<AgendamentoDto>>> GetByClienteAsync()
        {
            // 🔹 Obter ClienteId do usuário logado
            var userIdClaim =
            User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
            User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                return Unauthorized(new { message = "Usuário não autenticado." });

            var user = await _userService.getAsyc(userId);
            if (user == null || user.ClienteId == null)
                return BadRequest(new { message = "Usuário não possui cliente associado." });

            var lista = await _service.getByClienteAsync(user.ClienteId.Value);
            if (!lista.Any())
                return NotFound("Nenhum agendamento encontrado para este cliente.");

            return Ok(lista);
        }

        [HttpDelete("deletar/{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var agendamento = await _service.getAsyc(id);

            if (agendamento == null)
                return NotFound(new { message = "Agendamento não encontrado." });

            await _service.removeAsyc(id);
            return Ok(new { message = "Agendamento removido com sucesso!" });
        }
    }
}
