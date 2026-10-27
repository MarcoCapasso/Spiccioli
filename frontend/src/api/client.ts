import { config } from '../config';

//Il corpo degli errori del backend
export type ProblemDetails = {
  title?: string;
  status?: number;
  detail?: string;
  errors?: Record<string, string[]>;
};

//Un errore restituito dall'API: lo stato HTTP e, se c'è, il corpo Problem Details
export class ApiError extends Error {
  readonly status: number;
  readonly problem: ProblemDetails | null;

  constructor(status: number, problem: ProblemDetails | null) {
    super(problem?.title ?? `Errore ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.problem = problem;
  }
}

//Chi fornisce il token di accesso
let getAccessToken: () => Promise<string | null> = async () => null;

export function setAccessTokenProvider(provider: () => Promise<string | null>) {
  getAccessToken = provider;
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
};

//Chiama l'API: aggiunge indirizzo, token e JSON; restituisce il corpo, o lancia un ApiError
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = await getAccessToken();

  const headers: Record<string, string> = {};
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${config.apiUrl}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    throw new ApiError(response.status, await readProblem(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

//Scarica un file dall'API (per esempio un CSV): stesso token e stessi errori di apiFetch.
//Serve una chiamata e non un semplice link, perché il token va nell'intestazione
export async function apiDownload(path: string): Promise<Blob> {
  const token = await getAccessToken();

  const response = await fetch(`${config.apiUrl}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    throw new ApiError(response.status, await readProblem(response));
  }

  return response.blob();
}

//Legge il Problem Details dal corpo, se c'è ed è JSON; altrimenti null (per esempio un 401 senza corpo)
async function readProblem(response: Response): Promise<ProblemDetails | null> {
  const contentType = response.headers.get('Content-Type') ?? '';
  if (!contentType.includes('json')) {
    return null;
  }

  try {
    return (await response.json()) as ProblemDetails;
  } catch {
    return null;
  }
}

//Il messaggio da mostrare all'utente per un errore qualunque
export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.problem?.detail ?? error.problem?.title ?? 'Si è verificato un errore. Riprova.';
  }
  //fetch lancia un TypeError quando la richiesta non arriva: server spento, rete assente, CORS
  return 'Impossibile contattare il server. Controlla la connessione e riprova.';
}


//I messaggi del backend per campo, con i nomi in camelCase come nei moduli: { categoryId: "…" }
export function fieldErrors(error: unknown): Record<string, string> {
  const result: Record<string, string> = {};

  if (error instanceof ApiError && error.problem?.errors) {
    for (const [field, messages] of Object.entries(error.problem.errors)) {
      const key = field.charAt(0).toLowerCase() + field.slice(1);
      result[key] = messages.join(' ');
    }
  }

  return result;
}