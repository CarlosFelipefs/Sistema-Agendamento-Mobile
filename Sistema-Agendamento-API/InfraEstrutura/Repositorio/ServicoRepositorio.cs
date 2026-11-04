using Dominio.Dto;
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
    public class ServicoRepositorio: IServicoRepositorio
    {
        private EmpresaContexto contexto;
        public ServicoRepositorio(EmpresaContexto contexto)
        {
            this.contexto = contexto;
        }

        public async Task<Servico> addAsync(Servico servicio)
        {
            await this.contexto.servicio.AddAsync(servicio);
            await this.contexto.SaveChangesAsync();
            return servicio;
        }

        public async Task<IEnumerable<Servico>> getAllAsync(Expression<Func<Servico, bool>> expression)
        {
            return await
               this.contexto.servicio
               .Where(expression)
            .Include(p => p.agendamentos)
               .OrderBy(p => p.nome)
               .ToListAsync();
        }

        public async Task<Servico?> getAsyc(int id)
        {
            return await
              this.contexto.servicio
              .Where(p => p.Id == id)
              .Include(p => p.agendamentos)
              .FirstOrDefaultAsync();
        }

        public async Task removeAsyc(Servico servicio)
        {
            this.contexto.servicio.Remove(servicio);
            await this.contexto.SaveChangesAsync();
        }

        public async Task updateAsync(Servico dto)
        {
            var servico = await contexto.servicio.FindAsync(dto.Id);
            if (servico == null)
                throw new Exception("Serviço não encontrado");

            // Atualiza apenas os campos necessários
            servico.nome = dto.nome;
            servico.preco = dto.preco;
            servico.DuracaoEmMinutos = dto.DuracaoEmMinutos;
            servico.EmpresaId = dto.EmpresaId;

            await contexto.SaveChangesAsync();
        }

    }
}

