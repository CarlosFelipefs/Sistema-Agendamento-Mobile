using Dominio.Dto;
using FluentValidation;
using Interface.Service;
using Microsoft.AspNetCore.Mvc;

namespace Sistema_Agendamento.Controllers
{
    [Route("api/[controller]")]
    [ApiController]

    public class ServicoController : ControllerBase
    {
        private IServicoService service;
        private IValidator<ServicoDto> validator;

        public ServicoController(IServicoService
            service, IValidator<ServicoDto> validator)
        {
            this.service = service;
            this.validator = validator;
        }
        [HttpPost]
        public async Task<ActionResult<ServicoDto>> addAsync(ServicoDto servicioDto)
        {

            var result = validator.Validate(servicioDto);
            if (result.IsValid)
            {
                var dto = await this.service.addAsync(servicioDto);
                return Ok(dto);
            }
            else
                return BadRequest(result);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ServicoDto>>>
           getAllAsync()
        {
            var lista = await this.service.getAllAsync(p => true);
            return Ok(lista);
        }

        [HttpGet("filtrar/{nome}")]
        public async Task<ActionResult<IEnumerable<ServicoDto>>>
          getDescricaoAsync(string descricao)
        {
            var lista = await this.service.getAllAsync(
                p => p.nome.Contains(descricao));
            return Ok(lista);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ServicoDto>>
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
            updateAsync(ServicoDto cat)
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
            var servico = await this.service.getAsyc(id);

            if (servico == null)
                return NotFound(new { message = "Serviço não encontrado." });

            await this.service.removeAsyc(id);
            return Ok(new { message = "Serviço removido com sucesso!" });
        }
    }
}
