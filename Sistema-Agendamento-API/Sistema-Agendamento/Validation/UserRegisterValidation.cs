using Dominio.Dto;
using FluentValidation;

namespace Sistema_Agendamento.Validation
{
    public class UserRegisterValidation : AbstractValidator<UserRegisterDto>
    {
        public UserRegisterValidation()
        {
            RuleFor(u => u.User)
                .NotEmpty().WithMessage("O campo 'User' é obrigatório.")
                .MinimumLength(3).WithMessage("O nome de usuário deve ter no mínimo 3 caracteres.");

            RuleFor(u => u.Senha)
                .NotEmpty().WithMessage("O campo 'Senha' é obrigatório.")
                .MinimumLength(6).WithMessage("A senha deve ter pelo menos 6 caracteres.");

            RuleFor(u => u.Nome)
                .NotEmpty().WithMessage("O campo 'Nome' é obrigatório.");
                
        }
    }
}
