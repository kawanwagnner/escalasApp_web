import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Formata uma data para exibição
 * @param date - Data em string ou Date
 * @param pattern - Padrão de formatação (opcional)
 * @returns String formatada ou fallback se inválida
 */
export const formatDate = (
  date: string | Date | null | undefined,
  pattern: "short" | "long" | "full" | "datetime" | "weekday" | "monthDay" = "short"
): string => {
  if (!date) return "Sem data";

  try {
    // Se for string, adiciona T00:00:00 para evitar problemas de timezone
    const dateObj = typeof date === "string" 
      ? new Date(date.includes("T") ? date : date + "T00:00:00")
      : date;

    if (isNaN(dateObj.getTime())) return "Data inválida";

    const patterns = {
      short: "dd/MM/yyyy",                          // 08/01/2026
      long: "dd 'de' MMMM 'de' yyyy",              // 08 de Janeiro de 2026
      full: "EEEE, dd 'de' MMMM 'de' yyyy",        // Quarta-feira, 08 de Janeiro de 2026
      datetime: "dd 'de' MMMM 'às' HH:mm",         // 08 de Janeiro às 14:30
      weekday: "EEEE, dd 'de' MMMM",               // Quarta-feira, 08 de Janeiro
      monthDay: "dd 'de' MMMM",                    // 08 de Janeiro
    };

    return format(dateObj, patterns[pattern], { locale: ptBR });
  } catch {
    return "Data inválida";
  }
};

/**
 * Verifica se uma data é válida
 */
export const isValidDate = (date: string | Date | null | undefined): boolean => {
  if (!date) return false;
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return !isNaN(dateObj.getTime());
};

/**
 * Formata apenas o dia/mês (para uso em badges curtos)
 */
export const formatShortDate = (date: string | Date | null | undefined): string => {
  if (!date) return "--/--";
  
  try {
    const dateObj = typeof date === "string" 
      ? new Date(date.includes("T") ? date : date + "T00:00:00")
      : date;

    if (isNaN(dateObj.getTime())) return "--/--";

    return format(dateObj, "dd/MM", { locale: ptBR });
  } catch {
    return "--/--";
  }
};

/**
 * Formata horário para exibição (HH:mm)
 * Aceita strings ISO (2026-01-15T20:00:00-03:00) ou simples (20:00:00)
 */
export const formatTime = (time: string | null | undefined): string => {
  if (!time) return "";
  
  try {
    // Se for ISO string completa, extrair apenas o horário
    if (time.includes("T")) {
      const dateObj = new Date(time);
      if (isNaN(dateObj.getTime())) return time;
      return format(dateObj, "HH:mm", { locale: ptBR });
    }
    
    // Se já for HH:mm ou HH:mm:ss, retornar apenas HH:mm
    return time.substring(0, 5);
  } catch {
    return time;
  }
};
