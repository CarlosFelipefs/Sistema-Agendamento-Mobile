namespace Dominio.Dto
{
    public class AgendamentoDto
    {
        public int Id { get; set; }

        public int idServico { get; set; }
        public int idProfissional { get; set; }
        public int idCliente { get; set; }
        public int EmpresaId { get; set; }
        public DateTime DataHora { get; set; }
        public string Status { get; set; } = string.Empty;

        public string ServicoNome { get; set; } = string.Empty;
        public string ProfissionalNome { get; set; } = string.Empty;
        public string EmpresaNome { get; set; } = string.Empty;
    }
}
