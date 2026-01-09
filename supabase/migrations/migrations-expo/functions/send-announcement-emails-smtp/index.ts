import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import nodemailer from 'npm:nodemailer@6.9.8'

// Tipos de requisição suportados
interface AnnouncementRequest {
  type?: 'announcement'
  announcementId: string
}

interface VerificationCodeRequest {
  type: 'verification_code'
  email: string
  code: string
}

type EmailRequest = AnnouncementRequest | VerificationCodeRequest

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const body: EmailRequest = await req.json()

    // Determina o tipo de requisição
    const requestType = 'type' in body ? body.type : 'announcement'

    // Roteamento baseado no tipo
    if (requestType === 'verification_code') {
      return await handleVerificationCode(body as VerificationCodeRequest)
    } else {
      return await handleAnnouncement(body as AnnouncementRequest)
    }
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// ========================================
// HANDLER: Código de Verificação
// ========================================
async function handleVerificationCode(request: VerificationCodeRequest): Promise<Response> {
  const { email, code } = request

  if (!email || !code) {
    return new Response(
      JSON.stringify({ error: 'Email e código são obrigatórios' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const gmailUser = Deno.env.get('GMAIL_USER')
  const gmailPassword = Deno.env.get('GMAIL_APP_PASSWORD')

  if (!gmailUser || !gmailPassword) {
    throw new Error('Gmail credentials not configured')
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: gmailUser,
      pass: gmailPassword,
    },
  })

  const emailHTML = generateVerificationCodeHTML(code)

  try {
    await transporter.sendMail({
      from: `Escalas App <${gmailUser}>`,
      to: email,
      subject: '🔐 Código de Verificação - Recuperação de Senha',
      text: `Seu código de verificação é: ${code}. Este código expira em 30 minutos.`,
      html: emailHTML,
    })

    console.log(`Código de verificação enviado para ${email}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Código de verificação enviado com sucesso' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error(`Erro ao enviar email para ${email}:`, error)
    return new Response(
      JSON.stringify({ error: 'Erro ao enviar email. Tente novamente.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

// ========================================
// HANDLER: Comunicados (código existente)
// ========================================
async function handleAnnouncement(request: AnnouncementRequest): Promise<Response> {
  const { announcementId } = request

  // Create Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseKey)

  // Get announcement details
  const { data: announcement, error: announcementError } = await supabase
    .from('announcements')
    .select('title, message')
    .eq('id', announcementId)
    .single()

  if (announcementError || !announcement) {
    throw new Error('Announcement not found')
  }

  // Get all profiles with email (from profiles table or auth.users)
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, email, full_name')

  if (profilesError) {
    console.error('Error fetching profiles:', profilesError)
    throw profilesError
  }

  // Get emails from auth.users for users without email in profiles
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
  
  if (authError) {
    console.error('Error fetching auth users:', authError)
  }

  // Combine emails from both sources
  const recipients: Array<{ email: string; name: string }> = []
  
  // Add users from profiles with email
  if (profiles) {
    profiles.forEach(profile => {
      if (profile.email) {
        recipients.push({
          email: profile.email,
          name: profile.full_name || 'Membro'
        })
      }
    })
  }

  // Add users from auth.users if not already in recipients
  if (authUsers?.users) {
    authUsers.users.forEach(user => {
      if (user.email && !recipients.find(r => r.email === user.email)) {
        const profile = profiles?.find(p => p.id === user.id)
        recipients.push({
          email: user.email,
          name: profile?.full_name || user.user_metadata?.full_name || 'Membro'
        })
      }
    })
  }

  if (recipients.length === 0) {
    return new Response(
      JSON.stringify({ success: true, message: 'No recipients found' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const gmailUser = Deno.env.get('GMAIL_USER')
  const gmailPassword = Deno.env.get('GMAIL_APP_PASSWORD')

  if (!gmailUser || !gmailPassword) {
    throw new Error('Gmail credentials not configured')
  }

  // Create nodemailer transporter
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: gmailUser,
      pass: gmailPassword,
    },
  })

  let successCount = 0
  const results = []

  // Send email to each recipient
  for (const recipient of recipients) {
    try {
      const emailHTML = generateAnnouncementHTML(
        recipient.name,
        announcement.title,
        announcement.message || ''
      )

      await transporter.sendMail({
        from: `Sistema de Escalas <${gmailUser}>`,
        to: recipient.email,
        subject: `📢 ${announcement.title}`,
        html: emailHTML,
      })

      successCount++
      results.push({ email: recipient.email, success: true })
    } catch (error) {
      console.error(`Failed to send email to ${recipient.email}:`, error)
      results.push({ email: recipient.email, success: false, error: error.message })
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      sent: successCount,
      total: recipients.length,
      results
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// ========================================
// TEMPLATES DE EMAIL
// ========================================

function generateVerificationCodeHTML(code: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Código de Verificação</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800;">
                🔐 Recuperação de Senha
              </h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                Escalas App
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Olá!
              </p>
              <p style="margin: 0 0 30px; color: #374151; font-size: 16px; line-height: 1.6;">
                Recebemos uma solicitação para recuperar a senha da sua conta. Use o código abaixo para verificar sua identidade:
              </p>
              
              <!-- Código -->
              <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 2px dashed #10b981; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
                <p style="margin: 0 0 10px; color: #059669; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">
                  Seu código de verificação
                </p>
                <p style="margin: 0; font-size: 42px; font-weight: 700; letter-spacing: 12px; color: #059669; font-family: 'Courier New', monospace;">
                  ${code}
                </p>
              </div>
              
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Digite este código de <strong>6 dígitos</strong> na tela de verificação para continuar com a redefinição da sua senha.
              </p>
              
              <!-- Info Box -->
              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 25px 0;">
                <p style="margin: 0 0 10px; color: #1e40af; font-size: 14px; font-weight: 600;">
                  📋 Próximos passos:
                </p>
                <ul style="margin: 0; padding-left: 20px; color: #1e40af; font-size: 14px;">
                  <li style="margin: 5px 0;">Acesse a tela de verificação no app</li>
                  <li style="margin: 5px 0;">Digite o código acima</li>
                  <li style="margin: 5px 0;">Crie uma nova senha segura</li>
                </ul>
              </div>
              
              <!-- Warning -->
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px 20px; border-radius: 0 8px 8px 0; margin-top: 25px;">
                <p style="margin: 0; color: #92400e; font-size: 14px;">
                  <strong>⚠️ Atenção:</strong> Este código é válido por <strong>30 minutos</strong>. Se você não solicitou esta recuperação, ignore este email - sua conta permanece segura.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #F9FAFB; padding: 30px; text-align: center; border-top: 1px solid #E5E7EB;">
              <p style="margin: 0 0 10px; color: #6B7280; font-size: 14px;">
                Escalas App
              </p>
              <p style="margin: 0; color: #9CA3AF; font-size: 12px;">
                Este é um email automático, por favor não responda.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

function generateAnnouncementHTML(name: string, title: string, message: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Comunicado</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #2563EB 0%, #1E40AF 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800;">
                Lembrete!
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Olá, espero que esta mensagem lhe encontre bem <strong>${name}</strong>.
              </p>
              
              <div style="background-color: #EEF2FF; border-left: 4px solid #2563EB; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <h2 style="margin: 0 0 16px; color: #1E40AF; font-size: 22px; font-weight: 700;">
                  ${title}
                </h2>
                <p style="margin: 0; color: #374151; font-size: 16px; line-height: 1.6; text-align: left;">
                  ${message}
                </p>
              </div>
              
              <p style="margin: 20px 0 0; color: #6B7280; font-size: 14px; line-height: 1.6;">
                Fique atento às próximas atualizações e escalas!
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #F9FAFB; padding: 30px; text-align: center; border-top: 1px solid #E5E7EB;">
              <p style="margin: 0 0 10px; color: #6B7280; font-size: 14px;">
                Sistema de Gerenciamento de Escalas
              </p>
              <p style="margin: 0; color: #9CA3AF; font-size: 12px;">
                Este é um email automático, por favor não responda.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}
