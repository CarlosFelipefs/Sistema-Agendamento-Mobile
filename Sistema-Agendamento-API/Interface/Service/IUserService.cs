using Dominio.Dto;
using Dominio.Entidades;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Interface.Service
{
    public interface IUserService
    {
        Task<UserDto> addAsync(UserDto userDtos);
        Task removeAsyc(int id);
        Task<UserDto?> getAsyc(int id);
        Task<IEnumerable<UserDto>>
            getAllAsync(Expression<Func<User, bool>>
                        expression);
        Task updateAsync(UserDto userDtos);
        Task<UserDto> RegisterAsync(UserRegisterDto registerDto);
        Task AlterarSenhaAsync(AlterarSenhaDto dto);
    }
}
