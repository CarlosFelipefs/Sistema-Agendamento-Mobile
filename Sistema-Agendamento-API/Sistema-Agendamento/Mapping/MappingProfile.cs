using AutoMapper;
using Dominio.Dto;
using Dominio.Entidades;

namespace Sistema_Agendamento.Mapping
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<AgendamentoDto, Agendamento>()
                .ForMember(dest => dest.Empresa, opt => opt.Ignore()) // não criar Empresa nova
                .ReverseMap();
            CreateMap<Cliente, ClienteDto>().ReverseMap();
            CreateMap<Profissional, ProfissionalDto>().ReverseMap();
            CreateMap<Servico, ServicoDto>().ReverseMap();
            CreateMap<Empresa, EmpresaDto>().ReverseMap();

            CreateMap<User, UserDto>()
                // Mapeia o nome do cliente vinculado automaticamente
                .ForMember(dest => dest.ClienteNome, opt => opt.MapFrom(src => src.Cliente != null ? src.Cliente.nome : null))
                .ReverseMap();

            // 🔹 UserRegisterDto → User
            CreateMap<UserRegisterDto, User>().ReverseMap();

        }
    }
}
