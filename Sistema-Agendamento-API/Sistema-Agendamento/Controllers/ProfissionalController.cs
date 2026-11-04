using Dominio.Dto;
using FluentValidation;
using Interface.Service;
using Microsoft.AspNetCore.Mvc;

namespace Sistema_Agendamento.Controllers
{
    [Route("api/[controller]")]
    [ApiController]

    public class ProfissionalController : ControllerBase
    {
        private IProfissionalService service;
        private IValidator<ProfissionalDto> validator;

        public ProfissionalController(IProfissionalService
            service, IValidator<ProfissionalDto> validator)
        {

            this.service = service;
            this.validator = validator;

        }

        [HttpPost]
        public async Task<ActionResult<ProfissionalDto>>
            addAsync(ProfissionalDto profissionalDto)
        {

            var result = validator.Validate(profissionalDto);
            if (result.IsValid)
            {
                var dto = await this.service.addAsync(profissionalDto);
                return Ok(dto);
            }
            else
                return BadRequest(result);


        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProfissionalDto>>>
           getAllAsync()
        {
            var lista = await this.service.getAllAsync(p => true);
            return Ok(lista);

        }

        [HttpGet("filtrar/{nome}")]
        public async Task<ActionResult<IEnumerable<ProfissionalDto>>>
          getDescricaoAsync(string descricao)
        {
            var lista = await this.service.getAllAsync(
                p => p.nome.Contains(descricao));
            return Ok(lista);

        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ProfissionalDto>>
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
            updateAsync(ProfissionalDto cat)
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
            var profissional = await this.service.getAsyc(id);

            if (profissional == null)
                return NotFound(new { message = "Profissional não encontrado." });

            await this.service.removeAsyc(id);
            return Ok(new { message = "Profissional removido com sucesso!" });
        }
    }
}
