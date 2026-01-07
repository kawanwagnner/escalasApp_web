# 🚀 Guia Rápido de Uso - Escalas App

## 🎯 Primeiros Passos

### 1. Configuração Inicial

1. **Crie um arquivo `.env` na raiz do projeto:**

```bash
cp .env.example .env
```

2. **Edite o arquivo `.env` com suas credenciais do Supabase:**

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

3. **Inicie o projeto:**

```bash
npm run dev
```

4. **Acesse no navegador:**

```
http://localhost:5173
```

---

## 👤 Fluxo de Uso

### 1. Registro e Login

1. **Primeira vez?**

   - Clique em "Cadastre-se" na tela de login
   - Preencha: Nome Completo, Email e Senha
   - Clique em "Criar Conta"

2. **Já tem conta?**

   - Acesse `/login`
   - Digite email e senha
   - Clique em "Entrar"

3. **Esqueceu a senha?**
   - Clique em "Esqueceu a senha?" no login
   - Digite seu email
   - Clique em "Enviar Link de Recuperação"

---

### 2. Dashboard

Após o login, você verá:

- **📊 Cards de Estatísticas:**

  - Total de escalas ativas
  - Suas atribuições
  - Convites pendentes
  - Seu tipo de perfil

- **📅 Próximas Escalas:**

  - Lista das 5 próximas escalas
  - Título, descrição e data

- **🔔 Convites Pendentes:**
  - Convites aguardando sua resposta

---

### 3. Gerenciar Escalas

**Acessar:** Menu → Escalas

#### Criar Nova Escala

1. Clique em "Nova Escala"
2. Preencha:
   - Título (ex: "Culto de Domingo")
   - Descrição (ex: "Culto matinal")
   - Data
   - Opções de notificação:
     - ☑️ Notificar 24h antes
     - ☑️ Notificar 48h antes
     - ☑️ Notificar músicos 48h antes
3. Clique em "Criar Escala"

#### Visualizar Slots de uma Escala

1. Encontre a escala desejada
2. Clique em "Ver Slots"
3. Veja todos os slots cadastrados com:
   - Título e descrição
   - Horário (início - fim)
   - Capacidade
   - Modo (Manual/Automático)

#### Deletar Escala

1. Encontre a escala
2. Clique no ícone de lixeira 🗑️
3. Confirme a ação

---

### 4. Minhas Atribuições

**Acessar:** Menu → Minhas Atribuições

Aqui você vê:

- Todos os slots onde você foi escalado
- Data e horário de cada slot
- Quando foi atribuído
- Modo do slot (Manual/Automático)

**Remover Atribuição:**

1. Encontre a atribuição
2. Clique em "Remover Atribuição"
3. Confirme

---

### 5. Gerenciar Convites

**Acessar:** Menu → Convites

#### Convites Pendentes

- Aparecem em destaque no topo
- Botões para "Aceitar" ou "Recusar"

**Aceitar Convite:**

1. Clique em "Aceitar"
2. O convite é movido para o histórico

**Recusar Convite:**

1. Clique em "Recusar"
2. Confirme a ação
3. O convite é movido para o histórico

#### Histórico de Respostas

- Todos os convites já respondidos
- Status: Aceito ou Recusado
- Data de recebimento e resposta

---

### 6. Visualizar Perfis

**Acessar:** Menu → Perfis

#### Filtros Disponíveis

- **Todos:** Todos os membros
- **Professores:** Apenas professores
- **Músicos:** Apenas músicos

#### Informações Exibidas

- Nome completo
- ID do usuário
- Badges de função (Professor/Músico)
- Data de cadastro

#### Estatísticas

No final da página:

- Total de membros
- Total de professores
- Total de músicos

---

### 7. Meu Perfil

**Acessar:** Menu → [Seu Nome] → Perfil ou Menu → Perfil

#### Visualizar Informações

- Avatar com inicial do nome
- Nome completo
- Email
- Data de cadastro
- Funções ativas (Professor/Músico)

#### Editar Perfil

1. Clique em "Editar Perfil"
2. Altere:
   - Nome completo
   - Marque/desmarque "Professor"
   - Marque/desmarque "Músico"
3. Clique em "Salvar Alterações"

**Funções:**

- **Professor:** Pode ministrar aulas e gerenciar alunos
- **Músico:** Participa de atividades musicais

---

## 🎨 Dicas de UX

### Navegação

- **Desktop:** Use o menu superior
- **Mobile:** Menu hambúrguer com todos os itens

### Cores e Status

- 🔵 **Azul:** Informações principais, professores
- 🟣 **Roxo:** Músicos, notificações especiais
- 🟢 **Verde:** Ações de sucesso, confirmações
- 🟡 **Amarelo:** Alertas, pendentes
- 🔴 **Vermelho:** Deletar, recusar, erros

### Notificações

- 🔔 24h: Notificação geral 24h antes
- 🔔 48h: Notificação geral 48h antes
- 🎵 Músicos: Notificação especial para músicos

---

## ⚡ Atalhos e Dicas

### Atalhos de Navegação

- Clique no logo "Escalas App" → Volta ao Dashboard
- Pressione ESC → Fecha modais abertos

### Boas Práticas

1. **Mantenha seu perfil atualizado**

   - Marque suas funções corretamente
   - Isso ajuda na organização das escalas

2. **Responda convites rapidamente**

   - Facilita o planejamento das escalas
   - Evita retrabalho dos organizadores

3. **Verifique o Dashboard regularmente**

   - Fique atento a novas escalas
   - Não perca convites pendentes

4. **Notificações**
   - Configure as notificações das escalas
   - Garante que todos sejam avisados

---

## 🐛 Solução de Problemas

### Não consigo fazer login

1. Verifique seu email e senha
2. Tente resetar a senha
3. Limpe o cache do navegador
4. Verifique as variáveis de ambiente

### Não vejo minhas escalas

1. Verifique se você tem permissão
2. Recarregue a página
3. Verifique sua conexão com a internet

### Erro ao carregar dados

1. Verifique sua conexão
2. Verifique as variáveis de ambiente (.env)
3. Confirme que o Supabase está configurado
4. Verifique as permissões no Supabase

---

## 📱 Acesso Mobile

A aplicação é totalmente responsiva:

- Menu adaptativo
- Cards empilhados verticalmente
- Botões touch-friendly
- Formulários otimizados

---

## 🔐 Segurança

### O que é armazenado

- Token de autenticação (localStorage)
- Dados básicos do usuário

### O que NÃO é armazenado

- Senha do usuário
- Dados sensíveis

### Logout

- Clique no ícone de sair no canto superior direito
- Remove todos os dados locais
- Redireciona para login

---

## 🎯 Recursos Futuros

Em breve:

- 📢 Comunicados e anúncios
- 📅 Eventos públicos
- 🔔 Notificações push
- 👶 Gestão de alunos
- 👥 Gestão de grupos
- 📊 Relatórios e estatísticas avançadas

---

## 💡 Precisa de Ajuda?

1. Consulte o [SETUP.md](./SETUP.md) para mais detalhes técnicos
2. Veja a documentação da API no Postman
3. Entre em contato com o suporte

---

**Versão:** 1.0.0  
**Última Atualização:** Janeiro 2026
