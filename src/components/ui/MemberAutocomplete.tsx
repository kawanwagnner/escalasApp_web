import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Search, Clock, User, X } from "lucide-react";
import type { Profile } from "../../types";

interface MemberAutocompleteProps {
  members: Profile[];
  onSelect: (member: Profile) => void;
  placeholder?: string;
  excludeIds?: string[];
}

const RECENT_MEMBERS_KEY = "escalas_recent_members";
const MAX_RECENT = 5;

export const MemberAutocomplete: React.FC<MemberAutocompleteProps> = ({
  members,
  onSelect,
  placeholder = "Digite o nome ou email...",
  excludeIds = [],
}) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [recentMembers, setRecentMembers] = useState<Profile[]>([]);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Carregar membros recentes do localStorage
  useEffect(() => {
    const stored = localStorage.getItem(RECENT_MEMBERS_KEY);
    if (stored) {
      try {
        const recentIds: string[] = JSON.parse(stored);
        const recent = recentIds
          .map((id) => members.find((m) => m.id === id))
          .filter((m): m is Profile => m !== undefined);
        setRecentMembers(recent);
      } catch {
        setRecentMembers([]);
      }
    }
  }, [members]);

  // Atualizar posição do dropdown
  const updateDropdownPosition = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: "fixed",
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 99999,
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition();
      window.addEventListener("scroll", updateDropdownPosition, true);
      window.addEventListener("resize", updateDropdownPosition);
    }
    return () => {
      window.removeEventListener("scroll", updateDropdownPosition, true);
      window.removeEventListener("resize", updateDropdownPosition);
    };
  }, [isOpen]);

  // Salvar membro no histórico
  const saveToRecent = (member: Profile) => {
    const stored = localStorage.getItem(RECENT_MEMBERS_KEY);
    let recentIds: string[] = stored ? JSON.parse(stored) : [];
    recentIds = recentIds.filter((id) => id !== member.id);
    recentIds.unshift(member.id);
    recentIds = recentIds.slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_MEMBERS_KEY, JSON.stringify(recentIds));
    const recent = recentIds
      .map((id) => members.find((m) => m.id === id))
      .filter((m): m is Profile => m !== undefined);
    setRecentMembers(recent);
  };

  // Filtrar membros pela query
  const filteredMembers = members.filter((member) => {
    if (excludeIds.includes(member.id)) return false;
    if (!query) return false;
    const searchLower = query.toLowerCase();
    return (
      member.full_name?.toLowerCase().includes(searchLower) ||
      member.email?.toLowerCase().includes(searchLower)
    );
  });

  // Membros recentes que não estão excluídos
  const availableRecent = recentMembers.filter(
    (m) => !excludeIds.includes(m.id)
  );

  // Lista de itens para navegação (filtrados ou recentes)
  const navigableItems = query ? filteredMembers : availableRecent;

  // Reset highlighted index quando muda a query ou abre/fecha
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [query, isOpen]);

  // Navegação por teclado
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || navigableItems.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < navigableItems.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : navigableItems.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < navigableItems.length) {
          handleSelect(navigableItems[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  // Scroll automático para o item destacado
  useEffect(() => {
    if (highlightedIndex >= 0 && dropdownRef.current) {
      const items = dropdownRef.current.querySelectorAll("[data-member-item]");
      const item = items[highlightedIndex] as HTMLElement;
      if (item) {
        item.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex]);

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (member: Profile) => {
    saveToRecent(member);
    onSelect(member);
    setQuery("");
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const showDropdown =
    isOpen && (query.length > 0 || availableRecent.length > 0);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 
                     hover:bg-gray-100 focus:bg-white focus:border-blue-500 focus:ring-2 
                     focus:ring-blue-200 transition-all outline-none"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full"
          >
            <X className="h-3 w-3 text-gray-400" />
          </button>
        )}
      </div>

      {showDropdown &&
        createPortal(
          <div
            ref={dropdownRef}
            style={dropdownStyle}
            className="bg-white border border-gray-200 rounded-lg shadow-2xl max-h-64 overflow-y-auto"
          >
            {/* Resultados da busca */}
            {query && filteredMembers.length > 0 && (
              <div>
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase bg-gray-50 border-b">
                  Resultados ({filteredMembers.length})
                </div>
                {filteredMembers.map((member, index) => (
                  <button
                    key={member.id}
                    data-member-item
                    onClick={() => handleSelect(member)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`w-full px-3 py-2 flex items-center gap-3 transition-colors text-left ${
                      highlightedIndex === index
                        ? "bg-blue-100 border-l-2 border-blue-500"
                        : "hover:bg-blue-50"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        highlightedIndex === index
                          ? "bg-blue-200"
                          : "bg-blue-100"
                      }`}
                    >
                      <span className="text-sm font-medium text-blue-600">
                        {member.full_name?.charAt(0)?.toUpperCase() || "?"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {member.full_name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {member.email}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Sem resultados */}
            {query && filteredMembers.length === 0 && (
              <div className="px-3 py-4 text-center text-sm text-gray-500">
                Nenhum membro encontrado com "{query}"
              </div>
            )}

            {/* Histórico de recentes */}
            {!query && availableRecent.length > 0 && (
              <div>
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase bg-gray-50 flex items-center gap-1 border-b">
                  <Clock className="h-3 w-3" />
                  Usados recentemente
                </div>
                {availableRecent.map((member, index) => (
                  <button
                    key={member.id}
                    data-member-item
                    onClick={() => handleSelect(member)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`w-full px-3 py-2 flex items-center gap-3 transition-colors text-left ${
                      highlightedIndex === index
                        ? "bg-blue-100 border-l-2 border-blue-500"
                        : "hover:bg-blue-50"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        highlightedIndex === index
                          ? "bg-gray-200"
                          : "bg-gray-100"
                      }`}
                    >
                      <User className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {member.full_name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {member.email}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Instrução quando vazio */}
            {!query && availableRecent.length === 0 && (
              <div className="px-3 py-4 text-center text-sm text-gray-500">
                Digite para buscar membros
              </div>
            )}
          </div>,
          document.body
        )}
    </div>
  );
};
