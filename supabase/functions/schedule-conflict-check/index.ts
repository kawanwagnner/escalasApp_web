import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AssignmentRequest {
  action: "create_invite" | "accept_invite" | "self_assign";
  slot_id?: string;
  user_id?: string;
  email?: string;
  invite_id?: string;
  assigned_by?: string;
}

interface ConflictInfo {
  hasConflict: boolean;
  conflictingSlot?: {
    id: string;
    title: string;
    date: string;
    start_time: string;
    end_time: string;
    schedule_title?: string;
  };
  message?: string;
}

/**
 * Formata uma data para exibição no formato brasileiro
 */
function formatDate(dateString: string): string {
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
}

/**
 * Verifica se há conflito de escala para um usuário em uma determinada data
 */
async function checkScheduleConflict(
  supabase: any,
  userId: string,
  targetDate: string,
  excludeSlotId?: string
): Promise<ConflictInfo> {
  // Buscar todos os assignments do usuário com dados do slot e schedule
  const { data: assignments, error } = await supabase
    .from("assignments")
    .select(`
      id,
      slot_id,
      slot:slots!slot_id (
        id,
        title,
        date,
        start_time,
        end_time,
        schedule_id,
        schedule:schedules!schedule_id (
          id,
          title
        )
      )
    `)
    .eq("user_id", userId);

  if (error) {
    console.error("Erro ao buscar assignments:", error);
    throw new Error("Erro ao verificar conflitos de escala");
  }

  // Filtrar assignments do mesmo dia
  const conflictingAssignment = assignments?.find((assignment: any) => {
    const slot = assignment.slot;
    if (!slot) return false;

    // Excluir o slot alvo se especificado
    if (excludeSlotId && slot.id === excludeSlotId) return false;

    // Comparar datas (apenas o dia, ignorando horário)
    return slot.date === targetDate;
  });

  if (conflictingAssignment && conflictingAssignment.slot) {
    const slot = conflictingAssignment.slot;
    const scheduleName = slot.schedule?.title || "Ministério";

    return {
      hasConflict: true,
      conflictingSlot: {
        id: slot.id,
        title: slot.title,
        date: slot.date,
        start_time: slot.start_time,
        end_time: slot.end_time,
        schedule_title: scheduleName,
      },
      message: `Este membro já está escalado no dia ${formatDate(targetDate)} na escala "${slot.title}" do ministério "${scheduleName}" (${slot.start_time} - ${slot.end_time}).`,
    };
  }

  return { hasConflict: false };
}

/**
 * Busca o ID do usuário pelo email
 */
async function getUserIdByEmail(
  supabase: any,
  email: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email.toLowerCase().trim())
    .limit(1);

  if (error || !data || data.length === 0) {
    return null;
  }

  return data[0].id;
}

/**
 * Busca os dados de um slot pelo ID
 */
async function getSlotById(
  supabase: any,
  slotId: string
): Promise<{ id: string; date: string; title: string } | null> {
  const { data, error } = await supabase
    .from("slots")
    .select("id, date, title")
    .eq("id", slotId)
    .limit(1);

  if (error || !data || data.length === 0) {
    return null;
  }

  return data[0];
}

/**
 * Busca os dados de um convite pelo ID
 */
async function getInviteById(
  supabase: any,
  inviteId: string
): Promise<{ id: string; slot_id: string; email: string; status: string } | null> {
  const { data, error } = await supabase
    .from("slot_invites")
    .select("id, slot_id, email, status")
    .eq("id", inviteId)
    .limit(1);

  if (error || !data || data.length === 0) {
    return null;
  }

  return data[0];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const requestData: AssignmentRequest = await req.json();
    const { action } = requestData;

    if (!action) {
      return new Response(
        JSON.stringify({ success: false, error: "Ação é obrigatória" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Criar cliente Supabase com service role key (bypass RLS para operação atômica)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // ========== CRIAR CONVITE ==========
    if (action === "create_invite") {
      const { slot_id, email } = requestData;

      if (!slot_id || !email) {
        return new Response(
          JSON.stringify({ success: false, error: "slot_id e email são obrigatórios" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Buscar dados do slot
      const slot = await getSlotById(supabaseAdmin, slot_id);
      if (!slot) {
        return new Response(
          JSON.stringify({ success: false, error: "Slot não encontrado" }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Buscar ID do usuário pelo email
      const userId = await getUserIdByEmail(supabaseAdmin, email);

      // Se o usuário existe no sistema, verificar conflitos
      if (userId) {
        const conflictCheck = await checkScheduleConflict(
          supabaseAdmin,
          userId,
          slot.date,
          slot_id
        );

        if (conflictCheck.hasConflict) {
          return new Response(
            JSON.stringify({
              success: false,
              error: conflictCheck.message,
              conflict: conflictCheck,
            }),
            {
              status: 409, // Conflict
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
      }

      // Deletar convites anteriores do mesmo email/slot para permitir re-convite
      await supabaseAdmin
        .from("slot_invites")
        .delete()
        .eq("slot_id", slot_id)
        .eq("email", email.toLowerCase().trim());

      // Criar o convite
      const { data: invite, error: inviteError } = await supabaseAdmin
        .from("slot_invites")
        .insert({
          slot_id,
          email: email.toLowerCase().trim(),
          status: "pending",
        })
        .select()
        .single();

      if (inviteError) {
        console.error("Erro ao criar convite:", inviteError);
        return new Response(
          JSON.stringify({ success: false, error: "Erro ao criar convite" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({ success: true, data: invite }),
        {
          status: 201,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ========== ACEITAR CONVITE ==========
    if (action === "accept_invite") {
      const { invite_id, user_id } = requestData;

      if (!invite_id || !user_id) {
        return new Response(
          JSON.stringify({ success: false, error: "invite_id e user_id são obrigatórios" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Buscar dados do convite
      const invite = await getInviteById(supabaseAdmin, invite_id);
      if (!invite) {
        return new Response(
          JSON.stringify({ success: false, error: "Convite não encontrado" }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (invite.status !== "pending") {
        return new Response(
          JSON.stringify({ success: false, error: "Este convite já foi respondido" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Buscar dados do slot
      const slot = await getSlotById(supabaseAdmin, invite.slot_id);
      if (!slot) {
        return new Response(
          JSON.stringify({ success: false, error: "Slot não encontrado" }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Verificar conflitos
      const conflictCheck = await checkScheduleConflict(
        supabaseAdmin,
        user_id,
        slot.date,
        invite.slot_id
      );

      if (conflictCheck.hasConflict) {
        return new Response(
          JSON.stringify({
            success: false,
            error: conflictCheck.message,
            conflict: conflictCheck,
          }),
          {
            status: 409, // Conflict
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Atualizar o status do convite
      const { error: updateError } = await supabaseAdmin
        .from("slot_invites")
        .update({
          status: "accepted",
          accepted_by: user_id,
          accepted_at: new Date().toISOString(),
        })
        .eq("id", invite_id);

      if (updateError) {
        console.error("Erro ao atualizar convite:", updateError);
        return new Response(
          JSON.stringify({ success: false, error: "Erro ao aceitar convite" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Criar o assignment
      const { data: assignment, error: assignmentError } = await supabaseAdmin
        .from("assignments")
        .insert({
          slot_id: invite.slot_id,
          user_id: user_id,
          assigned_by: user_id,
        })
        .select()
        .single();

      if (assignmentError) {
        // Se o assignment já existe, não é erro crítico
        if (!assignmentError.message?.includes("duplicate")) {
          console.error("Erro ao criar assignment:", assignmentError);
        }
      }

      return new Response(
        JSON.stringify({ success: true, data: { invite, assignment } }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ========== AUTO-INSCRIÇÃO (ESCALA LIVRE) ==========
    if (action === "self_assign") {
      const { slot_id, user_id, assigned_by } = requestData;

      if (!slot_id || !user_id) {
        return new Response(
          JSON.stringify({ success: false, error: "slot_id e user_id são obrigatórios" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Buscar dados do slot
      const slot = await getSlotById(supabaseAdmin, slot_id);
      if (!slot) {
        return new Response(
          JSON.stringify({ success: false, error: "Slot não encontrado" }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Verificar conflitos
      const conflictCheck = await checkScheduleConflict(
        supabaseAdmin,
        user_id,
        slot.date,
        slot_id
      );

      if (conflictCheck.hasConflict) {
        return new Response(
          JSON.stringify({
            success: false,
            error: conflictCheck.message,
            conflict: conflictCheck,
          }),
          {
            status: 409, // Conflict
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Verificar se já está inscrito
      const { data: existingAssignment } = await supabaseAdmin
        .from("assignments")
        .select("id")
        .eq("slot_id", slot_id)
        .eq("user_id", user_id)
        .limit(1);

      if (existingAssignment && existingAssignment.length > 0) {
        return new Response(
          JSON.stringify({ success: false, error: "Você já está inscrito nesta escala" }),
          {
            status: 409,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Criar o assignment
      const { data: assignment, error: assignmentError } = await supabaseAdmin
        .from("assignments")
        .insert({
          slot_id,
          user_id,
          assigned_by: assigned_by || user_id,
        })
        .select()
        .single();

      if (assignmentError) {
        console.error("Erro ao criar assignment:", assignmentError);
        return new Response(
          JSON.stringify({ success: false, error: "Erro ao realizar inscrição" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({ success: true, data: assignment }),
        {
          status: 201,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Ação não reconhecida
    return new Response(
      JSON.stringify({ success: false, error: "Ação não reconhecida" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Erro na função:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Erro interno do servidor" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
