import { useState, useRef } from "react";
import { Bold, Italic, Link, List, ListOrdered } from "lucide-react";

interface RichTextareaProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

export const RichTextarea: React.FC<RichTextareaProps> = ({
  label,
  value,
  onChange,
  placeholder = "Digite aqui...",
  rows = 4,
  className = "",
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Insere formatação no texto selecionado
  const insertFormatting = (prefix: string, suffix: string = prefix) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    const beforeText = value.substring(0, start);
    const afterText = value.substring(end);

    // Se há texto selecionado, envolve com a formatação
    // Se não há, insere os marcadores e posiciona o cursor no meio
    const newText = selectedText
      ? `${beforeText}${prefix}${selectedText}${suffix}${afterText}`
      : `${beforeText}${prefix}${suffix}${afterText}`;

    onChange(newText);

    // Reposiciona o cursor
    setTimeout(() => {
      textarea.focus();
      if (selectedText) {
        textarea.setSelectionRange(start + prefix.length, end + prefix.length);
      } else {
        const cursorPos = start + prefix.length;
        textarea.setSelectionRange(cursorPos, cursorPos);
      }
    }, 0);
  };

  const handleBold = () => insertFormatting("**");
  const handleItalic = () => insertFormatting("_");
  const handleLink = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    // Se o texto selecionado parece uma URL, formata como link
    if (selectedText.startsWith("http")) {
      insertFormatting("[Link](", ")");
    } else if (selectedText) {
      // Se há texto selecionado, pergunta a URL ou usa placeholder
      const newText =
        value.substring(0, start) +
        `[${selectedText}](url)` +
        value.substring(end);
      onChange(newText);
    } else {
      insertFormatting("[texto](", ")");
    }
  };
  const handleList = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const beforeLine = value.substring(0, lineStart);
    const afterCursor = value.substring(start);
    const currentLineBeforeCursor = value.substring(lineStart, start);

    const newText = `${beforeLine}• ${currentLineBeforeCursor}${afterCursor}`;
    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      const newPos = start + 2;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const handleNumberedList = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const beforeLine = value.substring(0, lineStart);
    const afterCursor = value.substring(start);
    const currentLineBeforeCursor = value.substring(lineStart, start);

    // Conta quantas linhas numeradas já existem antes
    const previousLines = beforeLine
      .split("\n")
      .filter((line) => /^\d+\./.test(line.trim()));
    const nextNumber = previousLines.length + 1;

    const newText = `${beforeLine}${nextNumber}. ${currentLineBeforeCursor}${afterCursor}`;
    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      const newPos = start + `${nextNumber}. `.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      {/* Barra de ferramentas */}
      <div className="flex items-center gap-1 p-1.5 bg-gray-50 border border-b-0 border-gray-300 rounded-t-lg">
        <button
          type="button"
          onClick={handleBold}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
          title="Negrito (selecione o texto)"
        >
          <Bold className="h-4 w-4 text-gray-600" />
        </button>
        <button
          type="button"
          onClick={handleItalic}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
          title="Itálico (selecione o texto)"
        >
          <Italic className="h-4 w-4 text-gray-600" />
        </button>
        <button
          type="button"
          onClick={handleLink}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
          title="Inserir link"
        >
          <Link className="h-4 w-4 text-gray-600" />
        </button>
        <button
          type="button"
          onClick={handleList}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
          title="Lista com marcador"
        >
          <List className="h-4 w-4 text-gray-600" />
        </button>
        <button
          type="button"
          onClick={handleNumberedList}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
          title="Lista numerada"
        >
          <ListOrdered className="h-4 w-4 text-gray-600" />
        </button>
        <span className="ml-auto text-xs text-gray-400 pr-2">
          Suporta quebra de linha
        </span>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-b-lg 
                   focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                   transition-all outline-none resize-y min-h-[120px]"
      />

      {/* Dica */}
      <p className="mt-1 text-xs text-gray-400">
        Use Enter para quebrar linha • **texto** para negrito • _texto_ para
        itálico
      </p>
    </div>
  );
};

export default RichTextarea;
