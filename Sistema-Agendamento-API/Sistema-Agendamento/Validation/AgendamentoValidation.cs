using Dominio.Dto;
using FluentValidation;

namespace Sistema_Agendamento.Validation
{
    public class AgendamentoValidation : AbstractValidator<AgendamentoDto>
    {
        public AgendamentoValidation()
        {
            RuleFor(p => p.DataHora)
                .NotNull()
                .WithMessage("A data nao pode ser vazio!");

            RuleFor(p => p.Status)
                .NotNull()
                .WithMessage("O status nao pode ser vazio!");


        }
    }
}
