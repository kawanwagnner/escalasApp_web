import { useState } from "react";
import { X } from "lucide-react";

interface DescriptionRendererProps {
    description: string;
    className?: string;
}

/**
 * Componente que renderiza descrições com suporte a:
 * - Markdown básico (negrito, itálico, links)
 * - Imagens com preview e visualização em tela cheia
 */
export const DescriptionRenderer: React.FC<DescriptionRendererProps> = ({
    description,
    className = "",
}) => {
    const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

    // Regex para encontrar imagens markdown: ![alt](url)
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;

    // Separa o texto em partes: texto normal e imagens
    const parts: Array<{ type: "text" | "image"; content: string; alt?: string }> = [];
    let lastIndex = 0;
    let match;

    while ((match = imageRegex.exec(description)) !== null) {
        // Adiciona o texto antes da imagem
        if (match.index > lastIndex) {
            parts.push({
                type: "text",
                content: description.slice(lastIndex, match.index),
            });
        }
        // Adiciona a imagem
        parts.push({
            type: "image",
            content: match[2], // URL
            alt: match[1] || "Imagem",
        });
        lastIndex = match.index + match[0].length;
    }

    // Adiciona o texto restante
    if (lastIndex < description.length) {
        parts.push({
            type: "text",
            content: description.slice(lastIndex),
        });
    }

    // Função para processar markdown de texto
    const processTextMarkdown = (text: string): string => {
        return (
            text
                // Negrito: **texto** -> <strong>texto</strong>
                .replace(
                    /\*\*(.+?)\*\*/g,
                    '<strong class="font-bold text-gray-800">$1</strong>'
                )
                // Itálico: _texto_ -> <em>texto</em>
                .replace(/(?<!\w)_(.+?)_(?!\w)/g, '<em class="italic">$1</em>')
                // Links: [texto](url) -> <a href="url">texto</a>
                .replace(
                    /\[(.+?)\]\((.+?)\)/g,
                    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 hover:underline">$1</a>'
                )
                // URLs diretas
                .replace(
                    /(?<!href=")(https?:\/\/[^\s<]+)/g,
                    '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 hover:underline break-all">$1</a>'
                )
        );
    };

    return (
        <>
            <div className={`text-sm text-gray-600 whitespace-pre-wrap wrap-break-word ${className}`}>
                {parts.map((part, index) => {
                    if (part.type === "image") {
                        return (
                            <div key={index} className="my-3">
                                <button
                                    type="button"
                                    onClick={() => setFullscreenImage(part.content)}
                                    className="block w-full max-w-xs sm:max-w-sm md:max-w-md cursor-zoom-in 
                             rounded-lg overflow-hidden shadow-md hover:shadow-lg 
                             transition-shadow border border-gray-200"
                                >
                                    <img
                                        src={part.content}
                                        alt={part.alt}
                                        className="w-full h-auto object-cover max-h-48 sm:max-h-64"
                                        loading="lazy"
                                    />
                                </button>
                            </div>
                        );
                    } else {
                        // Remove linhas vazias extras ao redor de onde estavam as imagens
                        const cleanedContent = part.content.trim();
                        if (!cleanedContent) return null;

                        return (
                            <span
                                key={index}
                                dangerouslySetInnerHTML={{
                                    __html: processTextMarkdown(cleanedContent),
                                }}
                            />
                        );
                    }
                })}
            </div>

            {/* Modal de imagem em tela cheia */}
            {fullscreenImage && (
                <div
                    className="fixed inset-0 z-9999 bg-black/90 flex items-center justify-center p-4"
                    onClick={() => setFullscreenImage(null)}
                >
                    {/* Botão de fechar */}
                    <button
                        onClick={() => setFullscreenImage(null)}
                        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 
                       rounded-full transition-colors z-10"
                        aria-label="Fechar"
                    >
                        <X className="h-6 w-6 text-white" />
                    </button>

                    {/* Imagem */}
                    <img
                        src={fullscreenImage}
                        alt="Imagem em tela cheia"
                        className="max-w-full max-h-full object-contain rounded-lg"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </>
    );
};

export default DescriptionRenderer;
