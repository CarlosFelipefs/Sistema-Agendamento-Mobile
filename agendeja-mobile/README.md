# AgendeJá Mobile

Aplicativo mobile desenvolvido com Expo SDK 57, React Native e TypeScript, consumindo a API .NET do sistema AgendeJá.

## 🚀 Como rodar

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar a API

⚠️ **IMPORTANTE:** A API deve estar rodando em **HTTP** (não HTTPS) para funcionar no mobile.

#### Subir a API .NET

```bash
cd Sistema-Agendamento-API/Sistema-Agendamento
dotnet run --urls "http://0.0.0.0:5253"
```

#### Liberar porta no firewall

Abra o Windows Firewall e permita a porta 5253 para tráfego de entrada.

#### Configuração de Ambiente (`.env.local`)

O projeto utiliza `.env.local` (ignorado no git) para a configuração ativa da API. Um modelo com todas as opções está disponível em `.env.example`.

Crie ou edite o arquivo `.env.local` na raiz de `agendeja-mobile`:

```env
# Para celular físico na mesma rede Wi-Fi:
# EXPO_PUBLIC_API_URL=http://<IP-DO-SEU-PC>:5253

# Para emulador Android:
# EXPO_PUBLIC_API_URL=http://10.0.2.2:5253

# Para simulador iOS ou Web:
EXPO_PUBLIC_API_URL=http://localhost:5253
```

### 3. Iniciar o app

```bash
npx expo start -c
```

Após iniciar, você pode:
- Escanear o QR Code com o **Expo Go** (celular e PC na mesma rede Wi-Fi)
- Pressionar `a` para abrir no emulador Android
- Pressionar `i` para abrir no simulador iOS
- Pressionar `w` para abrir no navegador (`http://localhost:8081`)

## 📱 Funcionalidades implementadas

- **Autenticação & Sessão:** Login (`/login`), Cadastro (`/cadastro`) com validações robustas, sessão persistente com SecureStore e AsyncStorage, decodificação manual de JWT e logout automático em token expirado (401).
- **Início:** Saudação com horário, data por extenso, busca rápida e listagem de empresas mais próximas com verificação de GPS e permissões.
- **Busca:** Abas de filtro por Nome, Cidade e Próximas, validação de tamanho mínimo de busca e feedback claro para estados vazio e de erro.
- **Detalhes da Empresa:** Avatar, categoria, botão de agendamento em destaque, abas de Serviços e Profissionais, integração nativa com Google Maps (pelo endereço textual) e discador telefônico.
- **Fluxo de Agendamento:** Agendamento em 3 passos (Profissional → Data/Hora → Revisão), seleção de horários por turnos, bloqueio de horários passados e detecção de conflitos da agenda.
- **Meus Agendamentos:** Listagem completa com `RefreshControl` e `useFocusEffect`, modal com detalhes completos, cancelamento com liberação de horário e edição completa (`/agendamento/[id]`).
- **Meu Perfil:** Edição dos dados cadastrais e alteração de senha autenticada (`/perfil`).
- **Área do Gestor:** Cadastro de empresas com geocodificação Nominatim (OpenStreetMap), listagem geral e edição/exclusão com sincronização de serviços e profissionais e preservação de coordenadas.
- **Acessibilidade e Usabilidade:** Alvos de toque com altura mínima de 44 px, `accessibilityLabel` nos botões de ícone, suporte completo a temas claro/escuro e suporte a múltiplos idiomas (Português/Inglês).

## 🛠️ Stack

- **Expo SDK 57** - Framework React Native
- **Expo Router** - Navegação por arquivos
- **TypeScript** - Tipagem estática
- **React Native Safe Area Context** - Áreas seguras
- **Expo Location** - Localização
- **Expo Secure Store** - Armazenamento seguro de tokens
- **AsyncStorage** - Persistência de preferências
- **Expo Splash Screen** - Gerenciamento de inicialização suave
- **@expo/vector-icons** - Ícones (Ionicons, FontAwesome5)

## 📁 Estrutura do projeto

```
src/
├── app/
│   ├── _layout.tsx              # Providers, SplashScreen e Stack raiz
│   ├── index.tsx                # Redirecionamento para /(tabs)
│   ├── login.tsx                # Tela de Login
│   ├── cadastro.tsx             # Tela de Cadastro de Usuário
│   ├── perfil.tsx               # Perfil (Meus Dados e Segurança)
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Abas com Header persistente
│   │   ├── index.tsx            # Tela Inicial (Main)
│   │   ├── buscar.tsx           # Tela de Busca (Nome, Cidade, Próximas)
│   │   └── agendamentos.tsx     # Meus Agendamentos
│   ├── empresa/[id].tsx         # Detalhes da Empresa e Serviços
│   ├── agendar/[empresaId].tsx  # Fluxo de Agendamento em 3 etapas
│   ├── agendamento/[id].tsx     # Edição de Agendamento existente
│   └── gestor/
│       ├── index.tsx            # Cadastro de nova empresa
│       ├── empresas.tsx         # Listagem de empresas cadastradas
│       └── empresa/[id].tsx     # Edição e exclusão de empresa
├── components/                  # Botao, CampoTexto, EstadoTela, EstadoDeslogado,
│                                # SeletorAbas, ListaSelecionavel, SeletorDataHora,
│                                # AgendamentoCard, EmpresaCard, Header, Footer, Main
├── constants/                   # cores.ts, status.ts, agenda.ts
├── contexts/                    # PreferenciasContext.tsx, AuthContext.tsx
├── hooks/                       # useEmpresasProximas, useEmpresaPorId, useExigirLogin
├── services/                    # api, sessao, authService, clienteService,
│                                # empresaService, agendamentoService, geocodingService
├── types/                       # empresa, agendamento, cliente, auth
└── utils/                       # dialogos, datas, formatadores, jwt, erros
```

## 🔧 Scripts úteis

```bash
# Limpar cache do Metro e iniciar
npx expo start -c

# Verificar tipos TypeScript
npx tsc --noEmit

# Executar linter
npx expo lint
```
