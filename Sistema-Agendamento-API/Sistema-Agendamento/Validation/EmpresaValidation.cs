using Dominio.Dto;
using FluentValidation;

namespace Sistema_Agendamento.Validation
{
    public class EmpresaValidation : AbstractValidator<EmpresaDto>
    {
        public EmpresaValidation() {
            RuleFor(e => e.Nome)
            .NotEmpty().WithMessage("O nome da empresa não pode ser vazio!")
            .NotNull().WithMessage("O nome da empresa não pode ser nulo!")
            .MaximumLength(100).WithMessage("O nome da empresa deve ter no máximo 100 caracteres!");

            RuleFor(e => e.Endereco)
                .MaximumLength(200).WithMessage("O endereço deve ter no máximo 200 caracteres!");

            RuleFor(e => e.Cidade)
                .MaximumLength(100).WithMessage("A cidade deve ter no máximo 100 caracteres!");

            RuleFor(e => e.Estado)
                .MaximumLength(50).WithMessage("O estado deve ter no máximo 50 caracteres!");

            RuleFor(e => e.Cep)
                .MaximumLength(20).WithMessage("O CEP deve ter no máximo 20 caracteres!");

            RuleFor(e => e.Telefone)
                .MaximumLength(50).WithMessage("O telefone deve ter no máximo 50 caracteres!");

            RuleFor(e => e.Categoria)
                .MaximumLength(100).WithMessage("A categoria deve ter no máximo 100 caracteres!");

            RuleFor(e => e.Latitude)
                .InclusiveBetween(-90, 90).WithMessage("A latitude deve estar entre -90 e 90.");

            RuleFor(e => e.Longitude)
                .InclusiveBetween(-180, 180).WithMessage("A longitude deve estar entre -180 e 180.");



        }
    }
}
