using Dominio.Dto;
using FluentValidation;
using Interface.Service;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Sistema_Agendamento.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        
        private IUserService service;
        private IValidator<UserDto> validator;
        private IValidator<UserRegisterDto> registerValidator;

        public UserController(IUserService
            service, IValidator<UserDto> validator, IValidator<UserRegisterDto> registerValidator)
        {
            this.service = service;
            this.validator = validator;
            this.registerValidator = registerValidator;
        }

        [HttpPost]
        public async Task<ActionResult<UserDto>>
            addAsync(UserDto userDtos)
        {

            var result = validator.Validate(userDtos);
            if (result.IsValid)
            {
                var dto = await this.service.addAsync(userDtos);
                return Ok(dto);
            }
            else
                return BadRequest(result);


        }

        [HttpPost("register")]
        public async Task<ActionResult<UserDto>> RegisterAsync(UserRegisterDto registerDto)
        {
            var result = registerValidator.Validate(registerDto);
            if (!result.IsValid)
                return BadRequest(result.Errors);

            try
            {
                var dto = await service.RegisterAsync(registerDto);
                return Ok(dto);
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }




        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDto>>>
           getAllAsync()
        {
            var lista = await this.service.getAllAsync(p => true);
            return Ok(lista);

        }
         
        
        [HttpGet("filtrar/{user}")]
        public async Task<ActionResult<IEnumerable<UserDto>>>
          getUserAsync(string user)
        {
            var lista = await this.service.getAllAsync(
                p => p.user.Contains(user));
            return Ok(lista);

        }
         
        
        [HttpGet("{id}")]
        public async Task<ActionResult<UserDto>>
            getAsync(int id)
        {
            var cat = await this.service.getAsyc(id);
            if (cat == null)
                return NotFound(); //não encontrou
            else
                return Ok(cat);
        }



        [HttpPut("alterar-senha")]
        public async Task<ActionResult> AlterarSenha(AlterarSenhaDto dto)
        {
            try
            {
                await service.AlterarSenhaAsync(dto);
                return Ok("Senha alterada com sucesso");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }



        [HttpDelete("deletar/{id}")]
        public async Task<ActionResult> deleteAsync(int id)
        {
            var user = await this.service.getAsyc(id);

            if (user == null)
                return NotFound(new { message = "Usuário não encontrado." });

            await this.service.removeAsyc(id);
            return Ok(new { message = "Usuário removido com sucesso!" });
        }

    }
}
