using Dominio.Dto;
using FluentValidation;

namespace Sistema_Agendamento.Validation
{
    public class ClienteVallidation : AbstractValidator<ClienteDto>
    {
        public ClienteVallidation()
        {
            RuleFor(p => p.nome)
                .MaximumLength(150)
                .WithMessage("O nome precisa ter no" +
                " máximo 150 caracteres!");

            RuleFor(p => p.nome)
                .NotEmpty()
                .WithMessage("O nome não pode ser vazia!");

            RuleFor(p => p.nome)
                .NotNull()
                .WithMessage("O nome não pode ser vazia!");

            RuleFor(p => p.email)
                .NotNull()
                .WithMessage("O email nao pode ser vazia!");

            RuleFor(p => p.telefone)
                .NotNull()
                .WithMessage("O email nao pode ser vazia!");


        }
    }
}
