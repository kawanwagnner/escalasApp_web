import { useMutation } from "@tanstack/react-query";
import { scheduleConflictService, type ConflictInfo } from "../services/scheduleConflict.service";

/**
 * Hook para verificar conflitos de escala por slot_id
 * Uso: ao escalar um usuário, verificar se há conflito antes de confirmar
 */
export function useCheckScheduleConflict() {
  return useMutation({
    mutationFn: ({ userId, targetSlotId }: { userId: string; targetSlotId: string }) =>
      scheduleConflictService.checkConflictBySlotId(userId, targetSlotId),
  });
}

/**
 * Hook para verificar conflitos de escala por email
 * Uso: ao enviar convite, verificar se o membro convidado tem conflito
 */
export function useCheckScheduleConflictByEmail() {
  return useMutation({
    mutationFn: ({ email, targetSlotId }: { email: string; targetSlotId: string }) =>
      scheduleConflictService.checkConflictByEmail(email, targetSlotId),
  });
}

/**
 * Hook para verificar conflitos de escala por data
 * Uso: verificação mais genérica quando já se tem a data
 */
export function useCheckScheduleConflictByDate() {
  return useMutation({
    mutationFn: ({ userId, targetDate, excludeSlotId }: { 
      userId: string; 
      targetDate: string; 
      excludeSlotId?: string 
    }) =>
      scheduleConflictService.checkConflict(userId, targetDate, excludeSlotId),
  });
}

export type { ConflictInfo };
