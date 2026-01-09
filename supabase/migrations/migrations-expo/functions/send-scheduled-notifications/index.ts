import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'

// Configuração de fuso horário - Brasil (UTC-3)
const TIMEZONE_OFFSET = -3 * 60 * 60 * 1000 // -3 horas em milissegundos

interface ScheduledNotification {
  id: string
  user_id: string
  title: string
  body: string
  type: string
  payload: any
  send_at: string
}

interface DeviceToken {
  id: string
  token: string
  provider: string
  platform: string
  active: boolean
}

function getBrazilTime(): Date {
  const now = new Date()
  const utcTime = now.getTime()
  return new Date(utcTime + TIMEZONE_OFFSET)
}

async function sendExpoPushNotifications(messages: any[]) {
  if (messages.length === 0) return []

  try {
    const response = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Expo push failed: ${response.status} ${text}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error sending push notifications:', error)
    throw error
  }
}

serve(async (req) => {
  try {
    // Verifica se é uma requisição autorizada (cron job ou admin)
    const authHeader = req.headers.get('Authorization')
    
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Cria cliente Supabase com service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Pega horário atual do Brasil
    const nowBrazil = getBrazilTime()
    const nowISO = nowBrazil.toISOString()

    console.log(`[${nowISO}] Checking for scheduled notifications...`)

    // Busca notificações agendadas que devem ser enviadas agora
    const { data: scheduledNotifications, error: fetchError } = await supabase
      .from('scheduled_notifications')
      .select('*')
      .lte('send_at', nowISO)
      .limit(100)

    if (fetchError) {
      console.error('Error fetching scheduled notifications:', fetchError)
      throw fetchError
    }

    if (!scheduledNotifications || scheduledNotifications.length === 0) {
      console.log('No scheduled notifications to send')
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No notifications to send',
          timestamp: nowISO 
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Found ${scheduledNotifications.length} notifications to send`)

    let sentCount = 0
    let errorCount = 0
    const processedIds: string[] = []

    // Processa cada notificação agendada
    for (const notification of scheduledNotifications as ScheduledNotification[]) {
      try {
        console.log(`Processing notification ${notification.id} for user ${notification.user_id}`)

        // 1. Salva no banco (tabela notifications) para aparecer no app
        const { data: insertedNotification, error: insertError } = await supabase
          .from('notifications')
          .insert({
            user_id: notification.user_id,
            title: notification.title,
            body: notification.body,
            data: notification.payload,
            type: notification.type,
            external_id: null,
          })
          .select('id')
          .single()

        if (insertError) {
          console.error(`Failed to insert notification for user ${notification.user_id}:`, insertError)
          errorCount++
          continue
        }

        console.log(`Notification saved to database: ${insertedNotification.id}`)

        // 2. Busca tokens de dispositivos do usuário
        const { data: deviceTokens, error: tokensError } = await supabase
          .from('device_tokens')
          .select('*')
          .eq('user_id', notification.user_id)
          .eq('active', true)

        if (tokensError) {
          console.error(`Failed to fetch device tokens for user ${notification.user_id}:`, tokensError)
        }

        // 3. Envia push notifications
        if (deviceTokens && deviceTokens.length > 0) {
          const expoMessages = deviceTokens
            .filter((token: DeviceToken) => 
              token.token && 
              token.token.startsWith('ExponentPushToken[')
            )
            .map((token: DeviceToken) => ({
              to: token.token,
              sound: 'default',
              title: notification.title,
              body: notification.body,
              data: notification.payload || {},
              priority: 'high',
              channelId: 'default',
            }))

          if (expoMessages.length > 0) {
            console.log(`Sending ${expoMessages.length} push notifications`)
            const pushResult = await sendExpoPushNotifications(expoMessages)
            console.log('Push result:', pushResult)
          }
        } else {
          console.log(`No device tokens found for user ${notification.user_id}`)
        }

        // 4. Remove da fila de agendados
        const { error: deleteError } = await supabase
          .from('scheduled_notifications')
          .delete()
          .eq('id', notification.id)

        if (deleteError) {
          console.error(`Failed to delete scheduled notification ${notification.id}:`, deleteError)
        } else {
          processedIds.push(notification.id)
          sentCount++
        }

      } catch (error) {
        console.error(`Error processing notification ${notification.id}:`, error)
        errorCount++
      }
    }

    console.log(`Processed ${sentCount} notifications successfully, ${errorCount} errors`)

    return new Response(
      JSON.stringify({
        success: true,
        sent: sentCount,
        errors: errorCount,
        processed_ids: processedIds,
        timestamp: nowISO,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Fatal error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString() 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
