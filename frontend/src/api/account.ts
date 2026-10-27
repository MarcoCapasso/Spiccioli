import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiDownload, apiFetch } from './client';
import { queryKeys } from './queries';
import { supabase } from './supabase';
import type { UserResponse } from '../types';

//Cambia il nome mostrato: PUT /api/me
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (firstName: string) =>
      apiFetch<UserResponse>('/api/me', { method: 'PUT', body: { firstName } }),
    //La risposta è il profilo aggiornato: lo si mette in cache e il nome cambia ovunque
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.profile, user);
    },
  });
}

//Fa scaricare un file al browser: un link invisibile cliccato dal codice
function saveFile(file: Blob, filename: string) {
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

//Scarica i movimenti in CSV: GET /api/me/export
export function useExportTransactions() {
  return useMutation({
    mutationFn: async () => {
      const file = await apiDownload('/api/me/export');
      saveFile(file, 'spiccioli-movimenti.csv');
    },
  });
}

//Elimina l'account e tutti i dati: DELETE /api/me
export function useDeleteAccount() {
  return useMutation({
    mutationFn: () => apiFetch<void>('/api/me', { method: 'DELETE' }),
  });
}

//Cambia la password dell'account con email: la gestisce Supabase, non il nostro backend
export function useChangePassword() {
  return useMutation({
    mutationFn: async (password: string) => {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        throw error;
      }
    },
  });
}

//Messaggi in italiano per gli errori di Supabase più probabili
export function passwordErrorMessage(error: unknown): string {
  const code = error instanceof Error && 'code' in error ? String(error.code) : '';

  if (code === 'same_password') {
    return 'La nuova password deve essere diversa da quella attuale.';
  }
  if (code === 'weak_password') {
    return 'La password è troppo debole: scegline una più lunga o più varia.';
  }
  return 'Impossibile cambiare la password. Riprova.';
}