using Dominio.Dto;
using FluentValidation;
using Interface.Service;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Sistema_Agendamento.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmpresaController : ControllerBase
    {
        
        private  IEmpresaService service;
        private  IValidator<EmpresaDto> validator;

        public EmpresaController(IEmpresaService service, IValidator<EmpresaDto> validator)
        {
            this.service = service;
            this.validator = validator;
        }

        [HttpPost]
        public async Task<ActionResult<EmpresaDto>> AddAsync(EmpresaDto dto)
        {
            var result = validator.Validate(dto);
            if (result.IsValid)
            {
                var empresa = await service.addAsync(dto);
                return Ok(empresa);
            }
            return BadRequest(result);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<EmpresaDto>>> GetAllAsync()
        {
            var lista = await service.getAllAsync(p => true);
            return Ok(lista);
        }

        [HttpGet("filtrar/{nome}")]
        public async Task<ActionResult<IEnumerable<EmpresaDto>>> GetByNameAsync(string nome)
        {
            var lista = await service.getAllAsync(p => p.Nome.Contains(nome));
            return Ok(lista);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<EmpresaDto>> getAsyc(int id)
        {
            var empresa = await service.getAsyc(id);
            if (empresa == null)
                return NotFound();
            return Ok(empresa);
        }

        [HttpPut]
        public async Task<ActionResult> UpdateAsync(EmpresaDto dto)
        {
            var result = validator.Validate(dto);
            if (result.IsValid)
            {
                await service.updateAsync(dto);
                return NoContent();
            }
            return BadRequest(result);
        }

        [HttpGet("proximas")]
        public async Task<ActionResult<IEnumerable<EmpresaDto>>> GetEmpresasProximas(
            [FromQuery] double latitude,
            [FromQuery] double longitude,
            [FromQuery] double raioKm = 5)
        {
            // Obtem todas as empresas
            var proximas = await service.GetEmpresasProximasAsync(latitude, longitude, raioKm);
            return Ok(proximas);

        }

        // 🔹 Função Haversine para calcular distância
        private double CalcularDistancia(double lat1, double lon1, double lat2, double lon2)
        {
            double R = 6371; // Raio da Terra em km
            double dLat = ToRadians(lat2 - lat1);
            double dLon = ToRadians(lon2 - lon1);
            double a =
                Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
            double c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            return R * c;
        }

        private double ToRadians(double deg) => deg * (Math.PI / 180);

        [HttpGet("filtrar/cidade")]
        public async Task<ActionResult<IEnumerable<EmpresaDto>>> GetByCityAsync([FromQuery] string cidade)
        {
            if (string.IsNullOrWhiteSpace(cidade))
                return BadRequest("Informe o nome da cidade para filtrar.");

            var lista = await service.GetEmpresasPorCidadeAsync(cidade);
            return Ok(lista);
        }

        [HttpDelete("deletar/{id}")]
        public async Task<ActionResult> DeleteAsync(int id)
        {
            var empresa = await service.getAsyc(id);

            if (empresa == null)
                return NotFound(new { message = "Empresa não encontrada." });

            await service.removeAsyc(id);
            return Ok(new { message = "Empresa removida com sucesso!" });
        }

    }
}
