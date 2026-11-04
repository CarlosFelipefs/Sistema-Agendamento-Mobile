using Dominio.Entidades;
using InfraEstrutura.Data;
using Interface.RepositorioI;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace InfraEstrutura.Repositorio
{
    public class ClienteRepositorio: IClienteRepositorio
    {
        private EmpresaContexto contexto;

        public ClienteRepositorio(EmpresaContexto contexto)
        {
            this.contexto = contexto;
        }

        public async Task<Cliente> addAsync(Cliente cliente)
        {
            await this.contexto.cliente.AddAsync(cliente);
            await this.contexto.SaveChangesAsync();
            return cliente;
        }

        public async Task<IEnumerable<Cliente>> getAllAsync(Expression<Func<Cliente, bool>> expression)
        {
            return await
               this.contexto.cliente
               .Where(expression)
               .Include(p => p.agendamentos)
               .OrderBy(p => p.nome)
               .ToListAsync();
        }

        public async Task<Cliente?> getAsyc(int id)
        {
            return await
               this.contexto.cliente
               .Where(p => p.Id == id)
               .Include(p => p.agendamentos)
               .FirstOrDefaultAsync();
        }

        public async Task removeAsyc(Cliente cliente)
        {
            this.contexto.cliente.Remove(cliente);
            await this.contexto.SaveChangesAsync();
        }

        public async Task updateAsync(Cliente cliente)
        {
            this.contexto.Entry(cliente).State
                = EntityState.Modified;
            await this.contexto.SaveChangesAsync();
        }
    }
}

