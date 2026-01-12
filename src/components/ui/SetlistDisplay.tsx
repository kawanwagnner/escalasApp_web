import { ExternalLink } from "lucide-react";
import { descriptionToSetlist, SetlistData } from "./SetlistForm";

interface SetlistDisplayProps {
  description: string;
}

export const SetlistDisplay: React.FC<SetlistDisplayProps> = ({
  description,
}) => {
  const setlist = descriptionToSetlist(description);

  // Se não conseguir parsear como setlist, não renderiza este componente
  if (!setlist || (setlist.songs.length === 0 && !setlist.title)) {
    return null;
  }

  return (
    <div className="space-y-4 mb-5">
      {/* Título do Setlist */}
      {setlist.title && (
        <h3 className="font-semibold text-gray-900">{setlist.title}</h3>
      )}

      {/* Lista de Músicas */}
      {setlist.songs.length > 0 && (
        <ol className="space-y-1.5">
          {setlist.songs.map((song, index) => (
            <li key={song.id} className="flex items-start gap-2 text-sm">
              <span className="text-gray-400 font-medium min-w-5">
                {index + 1}.
              </span>
              <div className="flex-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span className="font-medium text-gray-800">{song.title}</span>

                {song.key && (
                  <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded">
                    Tom: {song.key}
                  </span>
                )}

                {song.artist && (
                  <span className="text-gray-500">- {song.artist}</span>
                )}

                {song.notes && (
                  <span className="text-gray-400 text-xs">- {song.notes}</span>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}

      {/* Observações */}
      {setlist.notes && (
        <p className="text-sm text-gray-600 whitespace-pre-wrap pt-2">
          {setlist.notes}
        </p>
      )}

      {/* Link da Playlist */}
      {setlist.playlistUrl && (
        <a
          href={setlist.playlistUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg p-3 transition-colors group"
        >
          <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg
              className="w-4 h-4 text-white"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">
              Playlist no YouTube
            </p>
            <p className="text-xs text-gray-500 truncate">
              {setlist.playlistUrl}
            </p>
          </div>
          <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-red-500 transition-colors" />
        </a>
      )}
      <hr className="text-gray-300" />
    </div>
  );
};

// Função auxiliar para verificar se uma descrição é um setlist
export const isSetlistDescription = (description: string): boolean => {
  const setlist = descriptionToSetlist(description);
  return (
    setlist !== null && (setlist.songs.length > 0 || Boolean(setlist.title))
  );
};

export default SetlistDisplay;
