using Dominio.Dto;
using FluentValidation;

namespace Sistema_Agendamento.Validation
{
    public class UserValidation : AbstractValidator<UserDto>
    {
        public UserValidation() {

            RuleFor(u => u.user)
                .NotEmpty().WithMessage("O nome de usuário é obrigatório.")
                .MinimumLength(3).WithMessage("O nome de usuário deve ter pelo menos 3 caracteres.")
                .MaximumLength(100).WithMessage("O nome de usuário deve ter no máximo 100 caracteres.");

        }
    }
}
