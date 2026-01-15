import { ExternalLink, Link } from "lucide-react";
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

      {/* Organizadores e Mesa de Som */}
      {(setlist.organizers || setlist.soundDesk) && (
        <div className="flex flex-wrap items-center gap-1.5 text-sm">
          {setlist.organizers && (
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-gray-700">Organizadores:</span>
              <span className="text-gray-600">{setlist.organizers}</span>
            </div>
          )}
          {setlist.organizers && setlist.soundDesk && (
            <span className="text-gray-400">•</span>
          )}
          {setlist.soundDesk && (
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-gray-700">Mesa de Som:</span>
              <span className="text-gray-600">{setlist.soundDesk}</span>
            </div>
          )}
        </div>
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
          className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-3 transition-colors group"
        >
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shrink-0">
            <Link size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">
              Link da Playlist
            </p>
            <p className="text-xs text-gray-500 truncate">
              {setlist.playlistUrl}
            </p>
          </div>
          <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
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
