import { useState } from "react";
import {
  Plus,
  Trash2,
  Music,
  GripVertical,
  Link as LinkIcon,
  MessageSquare,
} from "lucide-react";
import { Input } from "./Input";

export interface SetlistSong {
  id: string;
  title: string;
  key: string;
  artist: string;
  notes?: string;
}

export interface SetlistData {
  title: string;
  songs: SetlistSong[];
  notes: string;
  playlistUrl: string;
  organizers: string;
  soundDesk: string;
}

interface SetlistFormProps {
  value: SetlistData;
  onChange: (data: SetlistData) => void;
}

const MUSICAL_KEYS = [
  "C",
  "C#",
  "Db",
  "D",
  "D#",
  "Eb",
  "E",
  "F",
  "F#",
  "Gb",
  "G",
  "G#",
  "Ab",
  "A",
  "A#",
  "Bb",
  "B",
  "Cm",
  "C#m",
  "Dbm",
  "Dm",
  "D#m",
  "Ebm",
  "Em",
  "Fm",
  "F#m",
  "Gbm",
  "Gm",
  "G#m",
  "Abm",
  "Am",
  "A#m",
  "Bbm",
  "Bm",
];

export const SetlistForm: React.FC<SetlistFormProps> = ({
  value,
  onChange,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const addSong = () => {
    const newSong: SetlistSong = {
      id: `song-${Date.now()}`,
      title: "",
      key: "",
      artist: "",
      notes: "",
    };
    onChange({ ...value, songs: [...value.songs, newSong] });
  };

  const removeSong = (index: number) => {
    const newSongs = value.songs.filter((_, i) => i !== index);
    onChange({ ...value, songs: newSongs });
  };

  const updateSong = (
    index: number,
    field: keyof SetlistSong,
    fieldValue: string
  ) => {
    const newSongs = [...value.songs];
    newSongs[index] = { ...newSongs[index], [field]: fieldValue };
    onChange({ ...value, songs: newSongs });
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newSongs = [...value.songs];
    const draggedSong = newSongs[draggedIndex];
    newSongs.splice(draggedIndex, 1);
    newSongs.splice(index, 0, draggedSong);

    onChange({ ...value, songs: newSongs });
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-4">
      {/* Título do Setlist */}
      <Input
        label="Título do Setlist *"
        placeholder="Ex: Setlist 1º culto do ano"
        value={value.title}
        onChange={(e) => onChange({ ...value, title: e.target.value })}
        required
      />

      {/* Organizadores do Dia */}
      <Input
        label="Organizadores do Dia"
        placeholder="Ex: João, Maria, Pedro"
        value={value.organizers || ""}
        onChange={(e) => onChange({ ...value, organizers: e.target.value })}
      />

      {/* Mesa de Som */}
      <Input
        label="Mesa de Som"
        placeholder="Ex: Carlos, Ana"
        value={value.soundDesk || ""}
        onChange={(e) => onChange({ ...value, soundDesk: e.target.value })}
      />

      {/* Lista de Músicas */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            Músicas *
          </label>
          <button
            type="button"
            onClick={addSong}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Adicionar música
          </button>
        </div>

        {value.songs.length === 0 ? (
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
            <Music className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Nenhuma música adicionada</p>
            <button
              type="button"
              onClick={addSong}
              className="mt-2 text-sm text-blue-600 hover:text-blue-700"
            >
              Clique para adicionar a primeira
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {value.songs.map((song, index) => (
              <div
                key={song.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`bg-gray-50 border rounded-lg p-3 transition-all ${
                  draggedIndex === index
                    ? "opacity-50 border-blue-400 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {/* Header com número, drag e delete */}
                <div className="flex items-center gap-2 mb-2">
                  {/* Drag Handle */}
                  <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
                    <GripVertical className="h-4 w-4" />
                  </div>

                  {/* Número */}
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                    {index + 1}
                  </div>

                  {/* Título da música - principal */}
                  <input
                    type="text"
                    placeholder="Nome da música *"
                    value={song.title}
                    onChange={(e) => updateSong(index, "title", e.target.value)}
                    className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none"
                    required
                  />

                  {/* Remover */}
                  <button
                    type="button"
                    onClick={() => removeSong(index)}
                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors shrink-0"
                    title="Remover música"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Campos secundários - Tom, Artista, Observação */}
                <div className="ml-8 grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {/* Tom */}
                  <select
                    value={song.key}
                    onChange={(e) => updateSong(index, "key", e.target.value)}
                    className="px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none bg-white"
                  >
                    <option value="">Tom</option>
                    {MUSICAL_KEYS.map((key) => (
                      <option key={key} value={key}>
                        {key}
                      </option>
                    ))}
                  </select>

                  {/* Artista */}
                  <input
                    type="text"
                    placeholder="Artista/Banda"
                    value={song.artist}
                    onChange={(e) =>
                      updateSong(index, "artist", e.target.value)
                    }
                    className="px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none"
                  />

                  {/* Observação */}
                  <input
                    type="text"
                    placeholder="Observação..."
                    value={song.notes || ""}
                    onChange={(e) => updateSong(index, "notes", e.target.value)}
                    className="col-span-2 sm:col-span-1 px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none text-gray-500"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Observações gerais */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <MessageSquare className="h-4 w-4 inline mr-1" />
          Observações gerais
        </label>
        <textarea
          placeholder="Ex: Pausa breve para ministração, avisos importantes..."
          value={value.notes}
          onChange={(e) => onChange({ ...value, notes: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none resize-y"
        />
      </div>

      {/* Link da Playlist */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <LinkIcon className="h-4 w-4 inline mr-1" />
          Link da Playlist (opcional)
        </label>
        <input
          type="url"
          placeholder="https://youtube.com/playlist?list=..."
          value={value.playlistUrl}
          onChange={(e) => onChange({ ...value, playlistUrl: e.target.value })}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
        />
      </div>
    </div>
  );
};

// Função para converter SetlistData em descrição formatada
export const setlistToDescription = (data: SetlistData): string => {
  let description = "";

  // Título do setlist
  if (data.title) {
    description += `**${data.title}**\n\n`;
  }

  // Organizadores do Dia
  if (data.organizers) {
    description += `Organizadores: ${data.organizers}\n`;
  }

  // Mesa de Som
  if (data.soundDesk) {
    description += `Mesa de Som: ${data.soundDesk}\n`;
  }

  // Adiciona linha em branco se tiver organizadores ou mesa de som
  if (data.organizers || data.soundDesk) {
    description += "\n";
  }

  // Lista de músicas
  if (data.songs.length > 0) {
    data.songs.forEach((song, index) => {
      let line = `${index + 1}. ${song.title}`;

      if (song.key) {
        line += ` - Tom: ${song.key}`;
      }

      if (song.artist) {
        line += ` - ${song.artist}`;
      }

      if (song.notes) {
        line += ` - ${song.notes}`;
      }

      description += line + "\n";
    });
  }

  // Observações gerais
  if (data.notes) {
    description += `\n${data.notes}\n`;
  }

  // Link da playlist
  if (data.playlistUrl) {
    description += `\nPlay youtube: ${data.playlistUrl}`;
  }

  return description.trim();
};

// Função para tentar parsear descrição de volta para SetlistData
export const descriptionToSetlist = (
  description: string
): SetlistData | null => {
  try {
    const lines = description.split("\n").filter((line) => line.trim());
    const data: SetlistData = {
      title: "",
      songs: [],
      notes: "",
      playlistUrl: "",
      organizers: "",
      soundDesk: "",
    };

    let isInSongs = false;
    const notesLines: string[] = [];

    for (const line of lines) {
      // Título (negrito no início)
      if (line.startsWith("**") && line.endsWith("**") && !data.title) {
        data.title = line.replace(/\*\*/g, "");
        continue;
      }

      // Organizadores do Dia
      if (line.toLowerCase().startsWith("organizadores:")) {
        data.organizers = line.replace(/organizadores:\s*/i, "").trim();
        continue;
      }

      // Mesa de Som
      if (line.toLowerCase().startsWith("mesa de som:")) {
        data.soundDesk = line.replace(/mesa de som:\s*/i, "").trim();
        continue;
      }

      // Link da playlist
      if (
        line.toLowerCase().includes("play youtube:") ||
        line.toLowerCase().includes("playlist")
      ) {
        const urlMatch = line.match(/(https?:\/\/[^\s]+)/);
        if (urlMatch) {
          data.playlistUrl = urlMatch[1];
          continue;
        }
      }

      // Músicas (começam com número.)
      const songMatch = line.match(/^(\d+)\.\s*(.+)$/);
      if (songMatch) {
        isInSongs = true;
        const songParts = songMatch[2];

        // Parse: "Título - Tom: X - Artista - notas"
        const parts = songParts.split(" - ");
        const song: SetlistSong = {
          id: `song-${Date.now()}-${data.songs.length}`,
          title: parts[0]?.trim() || "",
          key: "",
          artist: "",
          notes: "",
        };

        for (let i = 1; i < parts.length; i++) {
          const part = parts[i].trim();
          if (part.toLowerCase().startsWith("tom:")) {
            song.key = part.replace(/tom:\s*/i, "").trim();
          } else if (!song.artist && !part.includes(":")) {
            song.artist = part;
          } else if (song.artist) {
            song.notes = (song.notes ? song.notes + " - " : "") + part;
          }
        }

        data.songs.push(song);
        continue;
      }

      // Observações (linhas após as músicas que não são playlist)
      if (isInSongs && !line.toLowerCase().includes("play youtube")) {
        notesLines.push(line);
      }
    }

    data.notes = notesLines.join("\n").trim();

    // Só retorna se parece um setlist válido
    if (data.songs.length > 0 || data.title) {
      return data;
    }

    return null;
  } catch {
    return null;
  }
};

export default SetlistForm;
