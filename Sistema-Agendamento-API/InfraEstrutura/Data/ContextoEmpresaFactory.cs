using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace InfraEstrutura.Data
{
    public class ContextoEmpresaFactory : IDesignTimeDbContextFactory<EmpresaContexto>
    {
        public EmpresaContexto CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<EmpresaContexto>();

            // Defina a string de conexão de forma que o EF possa usar durante o processo de migração.
            optionsBuilder.UseSqlServer(@"Server=DESKTOP-F7AEMPC\CARLOSFELIPE;Database=dbSistemaAgenda;Integrated Security=True;TrustServerCertificate=True;");
            return new EmpresaContexto(optionsBuilder.Options);
        }
    }
}
