using Dominio.Dto;
using FluentValidation;
using InfraEstrutura.Data;
using InfraEstrutura.Repositorio;
using Interface.RepositorioI;
using Interface.Service;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Service;
using Sistema_Agendamento.Mapping;
using Sistema_Agendamento.Validation;
using System.Security.Claims;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Minha API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Insira 'Bearer' + espa�o + token",
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});


//configurar JWT
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,

                        ValidIssuer = builder.Configuration["Jwt:Issuer"],
                        ValidAudience = builder.Configuration["Jwt:Audience"],
                        IssuerSigningKey = new SymmetricSecurityKey
                      (Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"])),
                        NameClaimType = ClaimTypes.NameIdentifier
                    };
                });
builder.Services.AddSingleton<IConfiguration>(builder.Configuration);

builder.Services.AddDbContext<EmpresaContexto>(p => p.UseSqlServer(builder.Configuration.GetConnectionString("Default")));

builder.Services.AddAutoMapper(
    p => p.AddProfile<MappingProfile>());

builder.Services.AddScoped<IClienteRepositorio,ClienteRepositorio>();
builder.Services.AddScoped<IClienteService,ClienteService>();
builder.Services.AddScoped<IValidator<ClienteDto>,ClienteVallidation>();

builder.Services.AddScoped<IProfissionalRepositorio,
    ProfissionalRepositorio>();
builder.Services.AddScoped<IProfissionalService,
    ProfissionalService>();
builder.Services.AddScoped<IValidator<ProfissionalDto>,
        ProfissionalVallidation>();

builder.Services.AddScoped<IServicoRepositorio,
    ServicoRepositorio>();
builder.Services.AddScoped<IServicoService,
    ServicoService>();
builder.Services.AddScoped<IValidator<ServicoDto>,
        ServicoValidation>();

builder.Services.AddScoped<IAgendamentoRepositorio,
    AgendamentoRepositorio>();
builder.Services.AddScoped<IAgendamentoService,
    AgendamentoService>();
builder.Services.AddScoped<IValidator<AgendamentoDto>,
        AgendamentoValidation>();

builder.Services.AddScoped<IEmpresaRepositorio,
    EmpresaRepositorio>();
builder.Services.AddScoped<IEmpresaService,
    EmpresaService>();
builder.Services.AddScoped<IValidator<EmpresaDto>,
        EmpresaValidation>();

builder.Services.AddScoped<IUserRepositorio, 
    UserRepositorio>();
builder.Services.AddScoped<IUserService, 
    UserService>();
builder.Services.AddScoped<IValidator<UserDto>,
        UserValidation>();
builder.Services.AddScoped<IValidator<UserRegisterDto>, UserRegisterValidation>();


builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:3000",
                "http://localhost:8081"
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseCors("AllowFrontend");
app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
