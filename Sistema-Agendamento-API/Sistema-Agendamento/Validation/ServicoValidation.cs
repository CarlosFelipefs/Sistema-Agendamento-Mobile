using Dominio.Dto;
using FluentValidation;

namespace Sistema_Agendamento.Validation
{
    public class ServicoValidation : AbstractValidator<ServicoDto>
    {
        public ServicoValidation()
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

            RuleFor(p => p.DuracaoEmMinutos)
                .NotNull()
                .WithMessage("A Duração não pode ser vazia!");

        }
    }
}
