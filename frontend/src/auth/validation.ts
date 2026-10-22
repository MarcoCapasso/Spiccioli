export type AuthMode = 'login' | 'register';

//I campi del modulo: in accesso si usano solo email e password
export type AuthFields = {
  name: string;
  email: string;
  password: string;
  confirm: string;
};

//Un messaggio per ogni campo non valido
export type AuthErrors = Partial<Record<keyof AuthFields, string>>;

//L'ordine in cui compaiono i campi
export const FIELD_ORDER: (keyof AuthFields)[] = ['name', 'email', 'password', 'confirm'];

//Espressione regolare per la forma dell'email
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//Controlla la forma dei campi
export function validateAuth(mode: AuthMode, fields: AuthFields): AuthErrors {
  const errors: AuthErrors = {};

  if (mode === 'register' && !fields.name.trim()) {
    errors.name = 'Inserisci il tuo nome';
  }

  if (!EMAIL_PATTERN.test(fields.email.trim())) {
    errors.email = "Inserisci un'email valida, ad esempio nome@esempio.it";
  }

  if (mode === 'login' && !fields.password) {
    errors.password = 'Inserisci la password';
  }

  if (mode === 'register' && fields.password.length < 8) {
    errors.password = 'La password deve avere almeno 8 caratteri';
  }

  if (mode === 'register' && fields.confirm !== fields.password) {
    errors.confirm = 'Le password non coincidono';
  }

  return errors;
}