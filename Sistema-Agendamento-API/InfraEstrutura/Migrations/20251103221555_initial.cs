using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InfraEstrutura.Migrations
{
    /// <inheritdoc />
    public partial class initial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "cliente",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    nome = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    email = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    telefone = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_cliente", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "empresas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nome = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Endereco = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Cidade = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Estado = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Cep = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Latitude = table.Column<double>(type: "float(9)", precision: 9, scale: 6, nullable: false),
                    Longitude = table.Column<double>(type: "float(9)", precision: 9, scale: 6, nullable: false),
                    Telefone = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Categoria = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_empresas", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    user = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    senha = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ClienteId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_users", x => x.Id);
                    table.ForeignKey(
                        name: "FK_users_cliente_ClienteId",
                        column: x => x.ClienteId,
                        principalTable: "cliente",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "profissional",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    nome = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    especialidade = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    EmpresaId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_profissional", x => x.Id);
                    table.ForeignKey(
                        name: "FK_profissional_empresas_EmpresaId",
                        column: x => x.EmpresaId,
                        principalTable: "empresas",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "servicio",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    nome = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    DuracaoEmMinutos = table.Column<int>(type: "int", nullable: false),
                    preco = table.Column<decimal>(type: "decimal(8,2)", precision: 8, scale: 2, nullable: false),
                    EmpresaId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_servicio", x => x.Id);
                    table.ForeignKey(
                        name: "FK_servicio_empresas_EmpresaId",
                        column: x => x.EmpresaId,
                        principalTable: "empresas",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "agendamento",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    idServico = table.Column<int>(type: "int", nullable: false),
                    idProfissional = table.Column<int>(type: "int", nullable: false),
                    idCliente = table.Column<int>(type: "int", nullable: false),
                    EmpresaId = table.Column<int>(type: "int", nullable: false),
                    DataHora = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_agendamento", x => x.Id);
                    table.ForeignKey(
                        name: "FK_agendamento_cliente_idCliente",
                        column: x => x.idCliente,
                        principalTable: "cliente",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_agendamento_empresas_EmpresaId",
                        column: x => x.EmpresaId,
                        principalTable: "empresas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_agendamento_profissional_idProfissional",
                        column: x => x.idProfissional,
                        principalTable: "profissional",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_agendamento_servicio_idServico",
                        column: x => x.idServico,
                        principalTable: "servicio",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_agendamento_EmpresaId",
                table: "agendamento",
                column: "EmpresaId");

            migrationBuilder.CreateIndex(
                name: "IX_agendamento_idCliente",
                table: "agendamento",
                column: "idCliente");

            migrationBuilder.CreateIndex(
                name: "IX_agendamento_idProfissional",
                table: "agendamento",
                column: "idProfissional");

            migrationBuilder.CreateIndex(
                name: "IX_agendamento_idServico",
                table: "agendamento",
                column: "idServico");

            migrationBuilder.CreateIndex(
                name: "IX_empresas_Latitude_Longitude",
                table: "empresas",
                columns: new[] { "Latitude", "Longitude" });

            migrationBuilder.CreateIndex(
                name: "IX_profissional_EmpresaId",
                table: "profissional",
                column: "EmpresaId");

            migrationBuilder.CreateIndex(
                name: "IX_servicio_EmpresaId",
                table: "servicio",
                column: "EmpresaId");

            migrationBuilder.CreateIndex(
                name: "IX_users_ClienteId",
                table: "users",
                column: "ClienteId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_users_user",
                table: "users",
                column: "user",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "agendamento");

            migrationBuilder.DropTable(
                name: "users");

            migrationBuilder.DropTable(
                name: "profissional");

            migrationBuilder.DropTable(
                name: "servicio");

            migrationBuilder.DropTable(
                name: "cliente");

            migrationBuilder.DropTable(
                name: "empresas");
        }
    }
}
