using Dominio.Dto;
using Interface.Service;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Sistema_Agendamento.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SegurancaController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly IUserService _userService;

        public SegurancaController(IConfiguration config, IUserService userService)
        {
            _config = config;
            _userService = userService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto login)
        {
            // 🔹 1. Validação dos campos obrigatórios
            if (login == null || string.IsNullOrWhiteSpace(login.User) || string.IsNullOrWhiteSpace(login.Senha))
                return BadRequest(new { message = "Usuário e senha são obrigatórios." });

            // 🔹 2. Busca o usuário no banco
            var user = (await _userService.getAllAsync(u => u.user == login.User)).FirstOrDefault();

            if (user == null)
                return Unauthorized(new { message = "Usuário não encontrado." });

            // 🔹 3. Verifica senha em texto puro (não recomendado para produção)
            if (user.senha != login.Senha)
                return Unauthorized(new { message = "Senha incorreta." });

            // 🔹 4. Garante que o usuário está vinculado a um cliente
            if (user.ClienteId == null || user.ClienteId == 0)
                return BadRequest(new { message = "Usuário não possui cliente associado." });

            // 🔹 5. Gera token JWT com base no usuário autenticado
            var tokenString = GerarTokenJWT(user);

            // 🔹 6. Retorna o token e dados básicos
            return Ok(new
            {
                access_token = tokenString,
                token_type = "Bearer",
                expires_in = 60 * 60,
                user = user.user,
                clienteId = user.ClienteId
            });
        }

        private string GerarTokenJWT(UserDto user)
        {
            var issuer = _config["Jwt:Issuer"];
            var audience = _config["Jwt:Audience"];
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            // 🔹 Claims baseadas no usuário real
            var claims = new[]
{
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()), // ✅ para o ASP.NET reconhecer o ID
                new Claim(JwtRegisteredClaimNames.UniqueName, user.user),
                new Claim("clienteId", user.ClienteId?.ToString() ?? ""),
                new Claim(ClaimTypes.Role, "User")
            };


            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.Now.AddMinutes(120),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
