import { api } from '../utils/api';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const BUCKET_NAME = 'midia-images';

export const storageService = {
  /**
   * Upload de imagem para o Storage do Supabase
   * @param file - Arquivo de imagem
   * @param path - Caminho opcional dentro do bucket
   * @returns URL pública da imagem
   */
  async uploadImage(file: File, path?: string): Promise<string> {
    // Gera um nome único para o arquivo
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop() || 'png';
    const fileName = path 
      ? `${path}/${timestamp}-${randomStr}.${extension}`
      : `${timestamp}-${randomStr}.${extension}`;

    // Obtém o token de autenticação do localStorage
    const accessToken = localStorage.getItem('access_token');

    if (!accessToken) {
      throw new Error('Usuário não autenticado');
    }

    // Faz upload para o Supabase Storage
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(
      `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${fileName}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: file,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao fazer upload da imagem');
    }

    // Retorna a URL pública da imagem
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${fileName}`;
    return publicUrl;
  },

  /**
   * Deleta uma imagem do Storage
   * @param imageUrl - URL da imagem a ser deletada
   */
  async deleteImage(imageUrl: string): Promise<void> {
    // Extrai o caminho do arquivo da URL
    const pathMatch = imageUrl.match(new RegExp(`${BUCKET_NAME}/(.+)$`));
    if (!pathMatch) {
      throw new Error('URL de imagem inválida');
    }

    const filePath = pathMatch[1];

    const accessToken = localStorage.getItem('access_token');

    if (!accessToken) {
      throw new Error('Usuário não autenticado');
    }

    const response = await fetch(
      `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${filePath}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao deletar imagem');
    }
  },

  /**
   * Valida se o arquivo é uma imagem válida
   * @param file - Arquivo a ser validado
   * @returns true se for válido
   */
  validateImage(file: File): { valid: boolean; error?: string } {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      return { valid: false, error: 'Formato inválido. Use JPEG, PNG, GIF ou WebP.' };
    }

    if (file.size > maxSize) {
      return { valid: false, error: 'Imagem muito grande. Máximo 5MB.' };
    }

    return { valid: true };
  },
};
