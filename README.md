# 🎵 Escalas App Web

> Sistema web moderno para gerenciar escalas de igreja, desenvolvido com React, TypeScript e TailwindCSS

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)](https://vitejs.dev/)

---

## 🚀 Início Rápido

```bash
# 1. Instalar dependências (já feito)
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais do Supabase

# 3. Executar em desenvolvimento
npm run dev

# Acesse: http://localhost:5173
```

---

## ✨ Características

- 🎨 **UI Moderna** - Interface bonita e responsiva com TailwindCSS
- 🔐 **Autenticação Completa** - Login, registro e recuperação de senha
- 📅 **Gestão de Escalas** - CRUD completo de escalas e slots
- 👥 **Gerenciamento de Perfis** - Professores, músicos e membros
- 📨 **Sistema de Convites** - Aceitar/recusar convites para slots
- 📊 **Dashboard Interativo** - Visão geral com estatísticas
- 📱 **100% Responsivo** - Funciona perfeitamente em todos os dispositivos
- ⚡ **Performance** - Build otimizado com Vite
- 🛡️ **Type-Safe** - TypeScript para maior segurança

---

## 📦 Tecnologias

- **React 18** - UI Library
- **TypeScript** - Type Safety
- **TailwindCSS 4** - Styling
- **React Router DOM** - Routing
- **Axios** - HTTP Client
- **date-fns** - Date Formatting
- **Lucide React** - Icons
- **Vite** - Build Tool
- **Supabase** - Backend

---

## 📚 Documentação

- **[📖 LEIA-ME-PRIMEIRO.md](./LEIA-ME-PRIMEIRO.md)** - Comece por aqui!
- **[🔧 SETUP.md](./SETUP.md)** - Documentação técnica completa
- **[📘 GUIA_DE_USO.md](./GUIA_DE_USO.md)** - Guia prático de uso

---

## 🎯 Endpoints Implementados

### ✅ 25/50 Endpoints Integrados

| Módulo           | Endpoints                                            | Status |
| ---------------- | ---------------------------------------------------- | ------ |
| **Auth**         | Sign In, Sign Up, Sign Out, Reset Password, Get User | ✅ 5/5 |
| **Profiles**     | Get All, Get by ID, Update                           | ✅ 3/3 |
| **Schedules**    | Get All, Get by ID, Create, Update, Delete           | ✅ 5/5 |
| **Slots**        | Get by Schedule, Create, Update, Delete              | ✅ 4/4 |
| **Themes**       | Get All, Create                                      | ✅ 2/2 |
| **Assignments**  | Get My, Assign, Unassign                             | ✅ 3/3 |
| **Slot Invites** | Get My, Accept, Decline                              | ✅ 3/3 |

---

## 🏗️ Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── auth/           # ProtectedRoute
│   ├── layout/         # Layout, Navbar
│   └── ui/             # Button, Input, Card, Modal
├── context/            # React Contexts (Auth)
├── pages/              # Páginas da aplicação
│   ├── auth/           # Login, Register, Reset Password
│   └── ...            # Dashboard, Schedules, etc
├── services/           # API Services
├── types/              # TypeScript Types
├── utils/              # Utilities (API client)
└── routes/             # Route Configuration
```

---

## 🎨 Componentes Disponíveis

### UI Components

- `<Button />` - Botão com variantes e loading
- `<Input />` - Input com label e erro
- `<Card />` - Card com hover e shadow
- `<Modal />` - Modal com overlay e footer

### Layout

- `<Layout />` - Layout principal com navbar
- `<Navbar />` - Barra de navegação responsiva
- `<ProtectedRoute />` - Proteção de rotas

---

## 🔒 Segurança

- ✅ JWT Authentication
- ✅ Protected Routes
- ✅ Auto-refresh tokens
- ✅ Auto logout on 401
- ✅ Secure local storage

---

## 🎯 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build de Produção
npm run build

# Preview do Build
npm run preview

# Type Check
npm run typecheck

# Lint
npm run lint
```

---

## 📱 Páginas

1. `/login` - Login
2. `/register` - Registro
3. `/reset-password` - Recuperação de senha
4. `/` - Dashboard (protegido)
5. `/schedules` - Escalas (protegido)
6. `/assignments` - Minhas Atribuições (protegido)
7. `/invites` - Convites (protegido)
8. `/profiles` - Perfis (protegido)
9. `/profile` - Meu Perfil (protegido)

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 Autor

Desenvolvido com ❤️ e ☕ por [Seu Nome]

---

## 🙏 Agradecimentos

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/)
- [Lucide Icons](https://lucide.dev/)

---

⭐ **Se este projeto foi útil, deixe uma estrela!** ⭐

```js
export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
