using AutoMapper;
using Dominio.Dto;
using Dominio.Entidades;
using Interface.RepositorioI;
using Interface.Service;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Service
{
    public class UserService: IUserService
    {
        private IUserRepositorio repositorio;

        private IMapper mapper;
        private IClienteRepositorio clienteRepositorio;

        public UserService(IUserRepositorio repositorio,
            IMapper mapper,
            IClienteRepositorio clienteRepositorio)
        {
            this.repositorio = repositorio;
            this.mapper = mapper;
            this.clienteRepositorio = clienteRepositorio;
        }

        public async Task<UserDto> addAsync(UserDto userDtos)
        {
            var existe = await repositorio.getAllAsync(u => u.user == userDtos.user);
            if (existe.Any())
                throw new Exception("Já existe um usuário com este nome.");

            var entidade = mapper.Map<User>(userDtos);

            // Ideal: aplicar hash na senha antes de salvar
            // entidade.senha = BCrypt.Net.BCrypt.HashPassword(userDto.senha);

            entidade = await repositorio.addAsync(entidade);
            return mapper.Map<UserDto>(entidade);
        }

        public async Task<IEnumerable<UserDto>> getAllAsync(Expression<Func<User, bool>> expression)
        {
            var listaCat =
               await this.repositorio.getAllAsync(expression);
            return mapper.Map<IEnumerable<UserDto>>(listaCat);
        }

        public async Task<UserDto?> getAsyc(int id)
        {
            var cat = await this.repositorio.getAsyc(id);
            return mapper.Map<UserDto>(cat);
        }

        public async Task removeAsyc(int id)
        {
            var cat = await this.repositorio.getAsyc(id);
            if (cat != null)
                await this.repositorio.removeAsyc(cat);
        }

        public async Task AlterarSenhaAsync(AlterarSenhaDto dto)
        {
            var userExistente = await repositorio.getAsyc(dto.UserId);
            if (userExistente == null)
                throw new Exception("Usuário não encontrado.");

            if (userExistente.senha != dto.SenhaAtual)
                throw new Exception("Senha atual incorreta.");

            userExistente.senha = dto.NovaSenha;

            await repositorio.updateAsync(userExistente);
        }



        public async Task<UserDto> RegisterAsync(UserRegisterDto registerDto)
        {
            // 1️⃣ Validação de senha
            if (registerDto.Senha != registerDto.ConfirmarSenha)
                throw new Exception("As senhas não coincidem.");

            // 2️⃣ Verifica se o usuário já existe
            var existe = await repositorio.getAllAsync(u => u.user == registerDto.User);
            if (existe.Any())
                throw new Exception("Usuário já existe.");

            // 3️⃣ Verifica se já existe cliente com mesmo e-mail
            var clientes = await clienteRepositorio.getAllAsync(c => c.email == registerDto.Email);
            var cliente = clientes.FirstOrDefault();


            if (cliente == null)
            {
                cliente = new Cliente
                {
                    nome = registerDto.Nome,
                    email = registerDto.Email,
                    telefone = registerDto.Telefone
                };

                cliente = await clienteRepositorio.addAsync(cliente);
            }

            // 4️⃣ Cria o usuário vinculado ao cliente
            var entidade = new User
            {
                user = registerDto.User,
                senha = registerDto.Senha, // ideal: criptografar
                ClienteId = cliente.Id
            };

            entidade = await repositorio.addAsync(entidade);

            // 5️⃣ Retorna o DTO mapeado
            return mapper.Map<UserDto>(entidade);
        }


        public async Task updateAsync(UserDto userDtos)
        {
            var userExistente = await repositorio.getAsyc(userDtos.Id);
            if (userExistente == null)
                throw new Exception("Usuário não encontrado.");

            // Atualiza os campos necessários
            userExistente.user = userDtos.user;
            userExistente.senha = userDtos.senha;

            await repositorio.updateAsync(userExistente);
        }


    }
}
