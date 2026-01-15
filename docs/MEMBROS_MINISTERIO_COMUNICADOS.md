# 📋 Funcionalidade: Membros por Ministério + Comunicados Segmentados

> Documento de planejamento para implementação das novas funcionalidades.
> Criado em: 15/01/2026

---

## 🔍 Situação Atual

### Estrutura existente:

- **Ministérios (Schedule)**: Louvor, Diáconos, Recepção, etc.
- **Escalas (Slot)**: Eventos específicos dentro de um ministério (ex: "Domingo Manhã")
- **Membros em escalas (Assignment)**: Atribuição de um membro a uma escala específica
- **Comunicados (Announcement)**: Hoje são enviados para **todos** os membros

### ⚠️ Problema identificado

Atualmente não existe uma relação direta "**Membro → Ministério**". O membro só aparece no ministério quando é escalado em um Slot específico. Isso significa que não temos uma lista fixa de "quem faz parte do ministério de Louvor".

---

## 🎯 Proposta de Solução

### 1. Nova tabela: `ministry_members` (Membros do Ministério)

| Campo         | Tipo      | Descrição                                 |
| ------------- | --------- | ----------------------------------------- |
| `id`          | uuid      | PK                                        |
| `schedule_id` | uuid      | FK → schedules (ministério)               |
| `user_id`     | uuid      | FK → profiles (membro)                    |
| `role`        | string    | Ex: "membro", "líder", "apoio" (opcional) |
| `created_at`  | timestamp | Data de adição                            |

**Isso permite:**

- ✅ Um membro estar em **múltiplos ministérios**
- ✅ Ver rapidamente **quem faz parte de cada ministério**
- ✅ Não depender de escalas para saber a composição do time

---

### 2. Nova tela: "Membros por Ministério"

**Opções de onde colocar:**

| Opção  | Descrição                                                                                          | Prós                                  | Contras                           |
| ------ | -------------------------------------------------------------------------------------------------- | ------------------------------------- | --------------------------------- |
| **A)** | Aba dentro da página de Ministérios (ao clicar em um ministério, ter abas: "Escalas" \| "Membros") | Mantém tudo organizado no mesmo lugar | Modal pode ficar carregado        |
| **B)** | Nova página separada "Equipes" no menu                                                             | Visão mais limpa e dedicada           | Mais um item no menu              |
| **C)** | Seção expandida dentro do card do ministério                                                       | Acesso rápido                         | Pode poluir a tela de ministérios |

---

### 3. Comunicados Segmentados

No modal de criação de comunicado, adicionar:

```
Enviar para:
○ Todos os membros
○ Ministério específico → [Dropdown: Louvor, Diáconos, ...]
○ Múltiplos ministérios → [Multi-select]
```

**Lógica:**

1. Se "Todos" → envia para todos os profiles
2. Se ministério específico → busca na `ministry_members` quem está naquele ministério
3. Remove duplicatas (se um membro está em 2 ministérios selecionados, recebe só 1 email)

---

## 📝 Passos para Implementar

### Fase 1: Backend (Supabase)

- [ ] Criar tabela `ministry_members`
- [ ] Criar políticas RLS adequadas
- [ ] Criar funções para buscar membros por ministério
- [ ] (Opcional) Migração automática de membros existentes baseado em assignments

### Fase 2: Frontend - Serviços/Tipos

- [ ] Novo tipo `MinistryMember` em `types/index.ts`
- [ ] Novo serviço `ministryMember.service.ts`
- [ ] Novo hook `useMinistryMembers.ts`

### Fase 3: Frontend - Tela de Membros do Ministério

- [ ] UI para visualizar membros de um ministério
- [ ] Funcionalidade de adicionar membro ao ministério
- [ ] Funcionalidade de remover membro do ministério
- [ ] (Opcional) Definir papel/função do membro

### Fase 4: Frontend - Comunicados Segmentados

- [ ] Atualizar modal de criação de comunicado para selecionar destinatários
- [ ] Atualizar tabela `announcements` para guardar `target_schedules[]` ou similar
- [ ] Atualizar edge function de envio para filtrar destinatários
- [ ] (Opcional) Mostrar no histórico para quem foi enviado

---

## ❓ Perguntas para Definir

### 1. Onde mostrar os membros do ministério?

- [ ] **A)** Aba dentro do modal de Ministérios ("Escalas" | "Membros")
- [ ] **B)** Nova página separada "Equipes" no menu
- [ ] **C)** Seção expandida dentro do card do ministério

### 2. Quer ter "papéis" no ministério?

- [ ] **Sim** - Ex: Líder, Membro, Apoio
- [ ] **Não** - Apenas uma lista simples de membros

### 3. Os membros atuais das escalas devem ser migrados automaticamente?

- [ ] **Sim** - Quem já foi escalado no Louvor vira membro do ministério de Louvor
- [ ] **Não** - Começar do zero, cadastrar manualmente

### 4. Comunicados segmentados devem ter histórico?

- [ ] **Sim** - Guardar e mostrar para quem foi enviado
- [ ] **Não** - Apenas enviar, sem histórico detalhado

---

## 📐 Wireframes / Mockups

_(Adicionar aqui quando definido)_

---

## 🗓️ Cronograma Estimado

| Fase      | Descrição               | Estimativa     |
| --------- | ----------------------- | -------------- |
| 1         | Backend (Supabase)      | 2-3 horas      |
| 2         | Serviços/Tipos Frontend | 1 hora         |
| 3         | Tela de Membros         | 3-4 horas      |
| 4         | Comunicados Segmentados | 2-3 horas      |
| **Total** |                         | **8-11 horas** |

---

## 📌 Notas Adicionais

- Considerar notificações push para ministérios específicos no futuro
- Possibilidade de exportar lista de membros por ministério
- Relatórios de participação por ministério

---

> **Próximo passo:** Responder as perguntas acima para definir o escopo e iniciar a implementação.
