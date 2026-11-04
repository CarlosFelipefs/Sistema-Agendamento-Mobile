using Dominio.Dto;
using FluentValidation;
using Interface.Service;
using Microsoft.AspNetCore.Mvc;

namespace Sistema_Agendamento.Controllers
{
    [Route("api/[controller]")]
    [ApiController]

    public class ClienteController : ControllerBase
    {
        private IClienteService service;
        private IValidator<ClienteDto> validator;

        public ClienteController(IClienteService
            service, IValidator<ClienteDto> validator)
        {
            this.service = service;
            this.validator = validator;
        }

        [HttpPost]
        public async Task<ActionResult<ClienteDto>>
            addAsync(ClienteDto clienteDto)
        {

            var result = validator.Validate(clienteDto);
            if (result.IsValid)
            {
                var dto = await this.service.addAsync(clienteDto);
                return Ok(dto);
            }
            else
                return BadRequest(result);


        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ClienteDto>>>
           getAllAsync()
        {
            var lista = await this.service.getAllAsync(p => true);
            return Ok(lista);

        }

        [HttpGet("filtrar/{nome}")]
        public async Task<ActionResult<IEnumerable<ClienteDto>>>
          getNomeAsync(string nome)
        {
            var lista = await this.service.getAllAsync(
               p => p.nome.Contains(nome));
            return Ok(lista);

        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ClienteDto>>
            getAsync(int id)
        {
            var cat = await this.service.getAsyc(id);
            if (cat == null)
                return NotFound(); //não encontrou
            else
                return Ok(cat);
        }

        [HttpPut]
        public async Task<ActionResult>
            updateAsync(ClienteDto cat)
        {


            var result = validator.Validate(cat);
            if (result.IsValid)
            {
                await this.service.updateAsync(cat);
                return NoContent();
            }
            else return BadRequest(result);

        }
        [HttpDelete("deletar/{id}")]
        public async Task<ActionResult> deleteAsync(int id)
        {
            var cliente = await this.service.getAsyc(id);

            if (cliente == null)
                return NotFound(new { message = "Cliente não encontrado." });

            await this.service.removeAsyc(id);
            return Ok(new { message = "Cliente removido com sucesso!" });
        }

    }
}
