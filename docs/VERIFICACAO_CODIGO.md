# Sistema de Verificação por Código - Recuperação de Senha

Este documento descreve o sistema customizado de verificação por código para recuperação de senha, substituindo o fluxo nativo do Supabase.

## Visão Geral

O sistema implementa um fluxo de recuperação de senha em 3 etapas:

1. **Solicitar código** - Usuário informa o email
2. **Verificar código** - Usuário digita o código de 6 dígitos recebido por email
3. **Atualizar senha** - Usuário cria uma nova senha

## Arquivos Criados/Modificados

### Novos Arquivos

- `supabase/migrations/verification_codes.sql` - Script SQL para criar a tabela e funções
- `supabase/functions/send-verification-code/index.ts` - Edge Function para envio de código por email
- `supabase/functions/update-password/index.ts` - Edge Function para atualização segura de senha
- `src/services/verificationCode.service.ts` - Serviço para gerenciar códigos de verificação
- `src/pages/auth/VerifyCode.tsx` - Tela de verificação de código

### Arquivos Modificados

- `src/pages/auth/ResetPassword.tsx` - Atualizado para usar o novo fluxo
- `src/pages/auth/UpdatePassword.tsx` - Atualizado para suportar o novo fluxo
- `src/routes/index.tsx` - Adicionada rota `/verify-code`
- `src/services/index.ts` - Exportação do novo serviço
- `src/lib/validations/auth.schema.ts` - Schema de validação para código

## Configuração no Supabase

### 1. Executar o Script SQL

Execute o conteúdo de `supabase/migrations/verification_codes.sql` no SQL Editor do Supabase:

1. Acesse o painel do Supabase
2. Vá em **Database** > **SQL Editor**
3. Cole o conteúdo do arquivo e execute

### 2. Deploy das Edge Functions

Para envio de emails, você precisa fazer o deploy das Edge Functions:

```bash
# Instale o Supabase CLI se ainda não tiver
npm install -g supabase

# Login no Supabase
supabase login

# Link com seu projeto
supabase link --project-ref seu-projeto-ref

# Deploy das funções
supabase functions deploy send-verification-code
supabase functions deploy update-password
```

### 3. Configurar Secrets para Email (Gmail SMTP)

Configure as variáveis de ambiente para envio de email via Gmail:

```bash
# Credenciais do Gmail
supabase secrets set GMAIL_USER=seu-email@gmail.com
supabase secrets set GMAIL_APP_PASSWORD=sua-app-password

# Opcional: ambiente de desenvolvimento
supabase secrets set ENVIRONMENT=production
```

> **Nota:** Para usar o Gmail, você precisa de uma "App Password" (senha de aplicativo).
> Acesse: Google Account > Segurança > Verificação em 2 etapas > Senhas de app

### 4. Limpeza Automática (Opcional)

Para limpeza automática de códigos expirados, habilite o pg_cron no Supabase:

1. Acesse **Database** > **Extensions**
2. Habilite a extensão `pg_cron`
3. Execute no SQL Editor:

```sql
SELECT cron.schedule(
    'cleanup-expired-verification-codes',
    '*/15 * * * *',
    'SELECT cleanup_expired_verification_codes()'
);
```

## Estrutura da Tabela `verification_codes`

| Coluna       | Tipo      | Descrição                       |
| ------------ | --------- | ------------------------------- |
| `id`         | UUID      | Chave primária                  |
| `email`      | TEXT      | Email do usuário (único)        |
| `code`       | TEXT      | Código de 6 dígitos             |
| `created_at` | TIMESTAMP | Data/hora de criação            |
| `expires_at` | TIMESTAMP | Data/hora de expiração (30 min) |

## Funções RPC Disponíveis

### `create_or_update_verification_code(p_email TEXT)`

Gera um novo código de 6 dígitos para o email. Se já existir um código para o email, ele é substituído.

**Retorno:** O código gerado (TEXT)

### `validate_verification_code(p_email TEXT, p_code TEXT)`

Valida o código informado. Se válido, remove o registro da tabela.

**Retorno:** `{ is_valid: boolean, message: text }`

### `cleanup_expired_verification_codes()`

Remove todos os códigos expirados da tabela.

**Retorno:** Número de registros removidos

## Fluxo de Telas

```
/reset-password          →  Informar email
        ↓
/verify-code             →  Digitar código de 6 dígitos
        ↓
/update-password         →  Criar nova senha
        ↓
/login                   →  Fazer login com nova senha
```

## Regras de Negócio

1. **Um código ativo por email** - Ao solicitar novo código, o anterior é substituído
2. **Expiração de 30 minutos** - Após esse tempo, o código é invalidado
3. **Remoção automática** - Código é removido após validação bem-sucedida
4. **Código de 6 dígitos** - Apenas números, gerado aleatoriamente

## Segurança

- Códigos são gerados no servidor (função SQL SECURITY DEFINER)
- Atualização de senha usa Edge Function com service_role
- Token temporário após verificação expira em 10 minutos
- Dados sensíveis não são expostos no frontend
- Limpeza automática evita dados órfãos

## Desenvolvimento Local

Em ambiente de desenvolvimento (`import.meta.env.DEV = true`):

- O código de verificação é retornado na resposta para facilitar testes
- Os logs do console mostram o código gerado

## Customização do Email

Edite o template HTML em `supabase/functions/send-verification-code/index.ts`:

- O email é enviado via Gmail SMTP usando `denomailer`
- Personalize o design conforme sua marca
- Ajuste os textos conforme necessário

## Troubleshooting

### Código não está sendo enviado

- Verifique se a Edge Function está deployada
- Confirme que GMAIL_USER e GMAIL_APP_PASSWORD estão configurados
- Cheque os logs da função no painel do Supabase
- Verifique se a "App Password" do Gmail está correta

### Código sempre inválido

- Verifique se o email está em minúsculas
- Confirme que o código não expirou (30 minutos)
- Cheque se a função RPC está criada corretamente

### Erro ao atualizar senha

- Verifique se a Edge Function `update-password` está deployada
- Confirme que o verificationToken está sendo passado
- Cheque os logs da função para erros específicos
