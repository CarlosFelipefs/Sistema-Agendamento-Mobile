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
    public class EmpresaRepositorio: IEmpresaRepositorio
    {
        private EmpresaContexto contexto;

        public EmpresaRepositorio(EmpresaContexto contexto)
        {
            this.contexto = contexto;
        }

        public async Task<Empresa> addAsync(Empresa empresa)
        {
            await this.contexto.empresas.AddAsync(empresa);
            await this.contexto.SaveChangesAsync();
            return empresa;
        }

        public async Task<IEnumerable<Empresa>> getAllAsync(Expression<Func<Empresa, bool>> expression)
        {
            return await
               this.contexto.empresas
               .Where(expression)
               .Include(p => p.Profissionais)
                .Include(p => p.Servicos)
               .OrderBy(p => p.Nome)
               .ToListAsync();
        }

        public async Task<Empresa?> getAsyc(int id)
        {
            return await
               this.contexto.empresas
               .Where(p => p.Id == id)
               .Include(p => p.Profissionais)
               .Include(p => p.Servicos)
               .FirstOrDefaultAsync();
        }

        public async Task removeAsyc(Empresa empresa)
        {
            this.contexto.empresas.Remove(empresa);
            await this.contexto.SaveChangesAsync();
        }

        public async Task updateAsync(Empresa empresa)
        {
            // Verifica se já existe uma instância rastreada com o mesmo Id
            var local = contexto.Set<Empresa>()
                .Local
                .FirstOrDefault(entry => entry.Id == empresa.Id);

            if (local != null)
            {
                // Desanexa o objeto antigo do contexto
                contexto.Entry(local).State = EntityState.Detached;
            }

            // Marca a nova entidade como modificada
            contexto.Entry(empresa).State = EntityState.Modified;

            await contexto.SaveChangesAsync();
        }


        public async Task<IEnumerable<Empresa>> getEmpresasProximasAsync(double latitude, double longitude, double raioKm)
        {
            var empresas = await this.contexto.empresas
                .Include(p => p.Profissionais)
                .Include(p => p.Servicos)
                .ToListAsync();

            return empresas.Where(e => CalcularDistancia(latitude, longitude, e.Latitude, e.Longitude) <= raioKm)
                            .OrderBy(e => e.Nome)
                            .ToList();
        }

        private double CalcularDistancia(double lat1, double lon1, double lat2, double lon2)
        {
            double R = 6371; // Raio da Terra em km
            double dLat = ToRadians(lat2 - lat1);
            double dLon = ToRadians(lon2 - lon1);
            double a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                       Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
                       Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
            double c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            return R * c;
        }

        private double ToRadians(double deg) => deg * (Math.PI / 180);

        public IQueryable<Empresa> GetQueryable()
        {
            return this.contexto.empresas.AsQueryable();
        }
    }
}
