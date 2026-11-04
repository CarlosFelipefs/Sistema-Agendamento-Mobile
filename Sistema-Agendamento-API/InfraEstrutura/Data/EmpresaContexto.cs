using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Dominio.Entidades;

namespace InfraEstrutura.Data
{
    public class EmpresaContexto : DbContext
    {
        public EmpresaContexto(DbContextOptions<EmpresaContexto> opcoes) : base(opcoes)
        {

        }

        public DbSet<Cliente> cliente { get; set; }
        public DbSet<Servico> servicio { get; set; }
        public DbSet<Profissional> profissional { get; set; }
        public DbSet<Agendamento> agendamento { get; set; }
        public DbSet<Empresa> empresas { get; set; }
        public DbSet<User> users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {

            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Cliente>(builder =>
            {
                builder.Property(p => p.nome).IsRequired().HasMaxLength(150);
                builder.Property(p => p.email).IsRequired().HasMaxLength(150);
                builder.Property(p => p.telefone).IsRequired().HasMaxLength(150);
                builder.HasOne(c => c.User)
                   .WithOne(u => u.Cliente)
                   .HasForeignKey<User>(u => u.ClienteId)
                   .IsRequired()  // obrigatório
                   .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Empresa>(builder =>
            {
                builder.HasKey(e => e.Id);
                builder.Property(e => e.Nome)
                      .IsRequired()
                      .HasMaxLength(100);
                builder.Property(e => e.Latitude).HasPrecision(9, 6);  
                builder.Property(e => e.Longitude).HasPrecision(9, 6);
                builder.HasIndex(e => new { e.Latitude, e.Longitude });
                builder.HasMany(e => e.Profissionais)
                   .WithOne(p => p.Empresa)
                   .HasForeignKey(p => p.EmpresaId)
                   .OnDelete(DeleteBehavior.NoAction);
                builder.HasMany(e => e.Servicos)
                       .WithOne(s => s.Empresa)
                       .HasForeignKey(s => s.EmpresaId)
                       .OnDelete(DeleteBehavior.NoAction);
            });

            modelBuilder.Entity<User>(builder =>
            {
                builder.Property(e => e.user )
                    .IsRequired()
                    .HasMaxLength(100);
                builder.Property(e => e.senha)
                   .IsRequired()
                   .HasMaxLength(100);
                builder.HasIndex(u => u.user)
                  .IsUnique();
            });

            
            modelBuilder.Entity<Servico>(builder => {
                builder.Property(p => p.nome).IsRequired().HasMaxLength(150);
                builder.Property(p => p.preco).HasPrecision(8, 2).IsRequired();
                builder.HasOne(p => p.Empresa)//lado um
               .WithMany(p => p.Servicos)//lado muitos
               .HasForeignKey(p => p.EmpresaId) //chave estrangeira
               .OnDelete(DeleteBehavior.NoAction);

            });

            modelBuilder.Entity<Profissional>(builder => {
                builder.Property(p => p.nome).IsRequired().HasMaxLength(150);
                builder.Property(p => p.especialidade).IsRequired().HasMaxLength(150);
                builder.HasOne(p => p.Empresa)//lado um
               .WithMany(p => p.Profissionais)//lado muitos
               .HasForeignKey(p => p.EmpresaId) //chave estrangeira
               .OnDelete(DeleteBehavior.NoAction);

            });

            modelBuilder.Entity<Agendamento>(builder => {
                //Cliente Relacionamento

                builder.HasOne(p => p.cliente)//lado um
               .WithMany(p => p.agendamentos)//lado muitos
               .HasForeignKey(p => p.idCliente) //chave estrangeira
               .OnDelete(DeleteBehavior.NoAction);

                //Profissional

                builder.HasOne(p => p.profissional)//lado um
               .WithMany(p => p.agendamentos)//lado muitos
               .HasForeignKey(p => p.idProfissional) //chave estrangeira
               .OnDelete(DeleteBehavior.NoAction);

                //Servicio
                builder.HasOne(p => p.servico)//lado um
               .WithMany(p => p.agendamentos)//lado muitos
               .HasForeignKey(p => p.idServico) //chave estrangeira
               .OnDelete(DeleteBehavior.NoAction);

            });



        }
    }
}
