using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Dominio.Dto
{
    public class UserRegisterDto
    {
        public int Id { get; set; }
        public string User { get; set; } = string.Empty;
        public string Senha { get; set; } = string.Empty;
        public string ConfirmarSenha { get; set; } = string.Empty;

        // Se já existir cliente, pode enviar o ID. Caso contrário, será criado automaticamente.
        public int? ClienteId { get; set; }

        // Dados do cliente (para quando for criar um novo)
        public string Nome { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Telefone { get; set; } = string.Empty;
    }
}
