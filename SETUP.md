# 🎵 Escalas App Web

Uma aplicação web moderna e responsiva para gerenciar escalas de igreja, construída com React, TypeScript, TailwindCSS e integrada com Supabase.

## ✨ Funcionalidades

### 🔐 Autenticação

- Login e Cadastro de usuários
- Recuperação de senha
- Sistema de autenticação JWT com Supabase

### 📅 Gestão de Escalas

- Criar, visualizar, editar e deletar escalas
- Notificações automáticas (24h, 48h)
- Visualização de slots por escala
- Filtros e buscas

### 👥 Gestão de Perfis

- Visualização de todos os membros
- Perfis de Professor e Músico
- Filtros por tipo de perfil
- Estatísticas de membros

### 📋 Atribuições

- Visualizar suas atribuições em slots
- Gerenciar participação em escalas
- Histórico de atribuições

### 📨 Convites

- Receber convites para participar de slots
- Aceitar ou recusar convites
- Histórico de respostas

## 🚀 Tecnologias Utilizadas

- **React 18** - Framework UI
- **TypeScript** - Type safety
- **TailwindCSS** - Estilização
- **React Router DOM** - Navegação
- **Axios** - Cliente HTTP
- **date-fns** - Manipulação de datas
- **Lucide React** - Ícones modernos
- **Vite** - Build tool e dev server
- **Supabase** - Backend (Auth + Database)

## 📦 Instalação

1. **Clone o repositório**

```bash
git clone <seu-repositorio>
cd escalasAppWeb
```

2. **Instale as dependências**

```bash
npm install
```

3. **Configure as variáveis de ambiente**
   Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

4. **Execute o projeto**

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

## 🏗️ Arquitetura do Projeto

```
src/
├── components/           # Componentes reutilizáveis
│   ├── auth/            # Componentes de autenticação
│   ├── layout/          # Layout e navegação
│   └── ui/              # Componentes UI (Button, Input, Card, Modal)
├── context/             # Contextos React (AuthContext)
├── pages/               # Páginas da aplicação
│   ├── auth/            # Páginas de autenticação
│   ├── Dashboard.tsx    # Dashboard principal
│   ├── Schedules.tsx    # Gestão de escalas
│   ├── Assignments.tsx  # Minhas atribuições
│   ├── Invites.tsx      # Gerenciar convites
│   ├── Profiles.tsx     # Lista de perfis
│   └── Profile.tsx      # Perfil do usuário
├── services/            # Serviços de API
│   ├── auth.service.ts
│   ├── profile.service.ts
│   ├── schedule.service.ts
│   ├── slot.service.ts
│   ├── theme.service.ts
│   ├── assignment.service.ts
│   └── invite.service.ts
├── types/               # Tipos TypeScript
├── utils/               # Utilitários (API client)
├── routes/              # Configuração de rotas
├── App.tsx              # Componente principal
└── main.tsx             # Entry point
```

## 🎨 Design System

### Componentes UI

#### Button

```tsx
<Button variant="primary" size="md" isLoading={false}>
  Click me
</Button>
```

Variantes: `primary`, `secondary`, `danger`, `ghost`

#### Input

```tsx
<Input label="Email" type="email" error="Mensagem de erro" />
```

#### Card

```tsx
<Card title="Título" hover>
  Conteúdo
</Card>
```

#### Modal

```tsx
<Modal isOpen={true} onClose={() => {}} title="Título" footer={<>Botões</>}>
  Conteúdo
</Modal>
```

## 🔌 Endpoints Integrados (25/50)

### Auth (5 endpoints)

- ✅ POST `/auth/v1/token` - Sign In
- ✅ POST `/auth/v1/signup` - Sign Up
- ✅ POST `/auth/v1/logout` - Sign Out
- ✅ POST `/auth/v1/recover` - Reset Password
- ✅ GET `/auth/v1/user` - Get Current User

### Profiles (3 endpoints)

- ✅ GET `/rest/v1/profiles` - Get All Profiles
- ✅ GET `/rest/v1/profiles?id=eq.{id}` - Get Profile by ID
- ✅ PATCH `/rest/v1/profiles?id=eq.{id}` - Update Profile

### Schedules (5 endpoints)

- ✅ GET `/rest/v1/schedules` - Get All Schedules
- ✅ GET `/rest/v1/schedules?id=eq.{id}` - Get Schedule by ID
- ✅ POST `/rest/v1/schedules` - Create Schedule
- ✅ PATCH `/rest/v1/schedules?id=eq.{id}` - Update Schedule
- ✅ DELETE `/rest/v1/schedules?id=eq.{id}` - Delete Schedule

### Slots (4 endpoints)

- ✅ GET `/rest/v1/slots?schedule_id=eq.{id}` - Get Slots by Schedule
- ✅ POST `/rest/v1/slots` - Create Slot
- ✅ PATCH `/rest/v1/slots?id=eq.{id}` - Update Slot
- ✅ DELETE `/rest/v1/slots?id=eq.{id}` - Delete Slot

### Themes (2 endpoints)

- ✅ GET `/rest/v1/themes` - Get All Themes
- ✅ POST `/rest/v1/themes` - Create Theme

### Assignments (3 endpoints)

- ✅ GET `/rest/v1/assignments?user_id=eq.{id}` - Get My Assignments
- ✅ POST `/rest/v1/assignments` - Assign to Slot
- ✅ DELETE `/rest/v1/assignments?id=eq.{id}` - Unassign from Slot

### Slot Invites (3 endpoints)

- ✅ GET `/rest/v1/slot_invites?email=eq.{email}` - Get My Invites
- ✅ PATCH `/rest/v1/slot_invites?id=eq.{id}` - Accept Invite
- ✅ PATCH `/rest/v1/slot_invites?id=eq.{id}` - Decline Invite

## 🎯 Próximos Passos (25 endpoints restantes)

- Announcements (Get All, Create)
- Public Events (CRUD completo)
- Notifications (Get My, Mark as Read, Create)
- Device Tokens (Get My, Upsert, Deactivate)
- Scheduled Notifications (Get All, Create, Delete)
- Students (CRUD completo)
- Groups (CRUD completo)
- Edge Functions (Send Emails, Send Notifications)

## 📱 Responsividade

A aplicação é totalmente responsiva e funciona perfeitamente em:

- 📱 Mobile (320px+)
- 📱 Tablet (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large Desktop (1280px+)

## 🎨 Temas e Cores

```css
Primary: Blue (#2563eb)
Secondary: Gray (#6b7280)
Success: Green (#10b981)
Danger: Red (#ef4444)
Warning: Yellow (#f59e0b)
Info: Purple (#8b5cf6)
```

## 🛡️ Segurança

- Tokens JWT armazenados com segurança
- Rotas protegidas com ProtectedRoute
- Interceptors para gerenciar autenticação
- Validação de formulários
- Tratamento de erros centralizado

## 📄 Scripts Disponíveis

```bash
npm run dev          # Inicia o servidor de desenvolvimento
npm run build        # Cria build de produção
npm run preview      # Preview do build de produção
npm run lint         # Executa o linter
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT.

## 👨‍💻 Autor

Desenvolvido com ❤️ por [Seu Nome]

## 📞 Suporte

Para suporte, envie um email para [seu-email@example.com]

---

⭐ Se este projeto foi útil, deixe uma estrela!
