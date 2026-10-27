import { useProfile } from '../api/queries';
import { useAuth } from './auth-context';

//Le informazioni dell'utente collegato, pronte da mostrare; null se non c'è una sessione
export function useAccountInfo() {
  const { session } = useAuth();
  const { data: profile } = useProfile();
  const user = session?.user;

  if (!user) {
    return null;
  }

  const email = user.email ?? '';
  const meta = user.user_metadata;

  //Il nome di Google, altrimenti quello breve, altrimenti la parte prima della @
  const googleName =
    [meta?.full_name, meta?.name].find(
      (value): value is string => typeof value === 'string' && value !== '',
    ) ?? email.split('@')[0];

  //Il nome scelto dall'utente nell'app vince su quello di Google
  const name = profile?.firstName || googleName;

  //La foto del profilo Google, se c'è
  const avatarUrl = [meta?.avatar_url, meta?.picture].find(
    (value): value is string => typeof value === 'string' && value !== '',
  );

  //Solo gli account creati con email e password hanno una password da cambiare
  const hasPassword = user.app_metadata?.provider === 'email';

  return { name, email, avatarUrl, hasPassword };
}