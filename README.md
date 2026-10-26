# Spiccioli

Un'app per tenere sotto controllo entrate e uscite, con un piano mensile e le spese ricorrenti.

È un **progetto didattico**: nasce per imparare C#/.NET e React da zero, costruendo un'applicazione completa un passo alla volta. Il codice è ricco di commenti proprio per questo.

## Cosa fa

- Movimenti (entrate e uscite) con categorie, filtri e ricerca
- Piano del mese: entrate previste, risparmio e importo previsto per categoria, confrontati con il reale
- Spese ricorrenti (affitto, abbonamenti, rate) con calendario delle scadenze e pulsante "Pagato"
- Panoramica con totali e uscite per categoria
- Accesso con email o con Google

## Tecnologie

- **Backend:** .NET 10, ASP.NET Core Web API, Entity Framework Core, test con xUnit
- **Database e accesso:** PostgreSQL e autenticazione su Supabase (JWT)
- **Frontend:** React, TypeScript, Vite, React Router, TanStack Query, CSS

## Struttura

```
backend/Spiccioli.Api         API: controller, servizi, repository, modelli
backend/Spiccioli.Api.Tests   test automatici
frontend/                     applicazione React
```

## Configurazione del backend

1. Clona il repository.
2. Crea un progetto su Supabase con queste opzioni di sicurezza:
   Data API disattivata, esposizione automatica delle tabelle
   disattivata, RLS automatica attivata.
3. In Supabase: Connect → Session pooler. Componi la stringa
   in questo formato (lo username include il codice progetto):

   Host=HOST;Port=5432;Database=postgres;Username=postgres.CODICE;Password=PASSWORD;SSL Mode=Require

4. Dalla cartella backend/Spiccioli.Api esegui:

   dotnet user-secrets set "ConnectionStrings:DefaultConnection" "LA_TUA_STRINGA"

Non inserire la connection string nei file del progetto.

## Avvio

Backend (da `backend/Spiccioli.Api`):

```
dotnet run
```

Frontend (da `frontend`): copia `.env.example` in `.env.development` e compila i valori:

- `VITE_API_URL`: l'indirizzo del backend (in locale `http://localhost:5046`)
- `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`: indirizzo e chiave pubblica del tuo progetto Supabase (Project Settings → API)

Poi:

```
npm install
npm run dev
```

L'app è su http://localhost:5173. Gli indirizzi ammessi dal backend (CORS) sono in `appsettings.Development.json`.

Test (da `backend`):

```
dotnet test
```

## Stato del progetto

- Backend completo e testato (58 test)
- Frontend completo: accesso, movimenti, categorie, spese ricorrenti, piano del mese, panoramica, tema chiaro e scuro, accessibilità
- Da fare: pubblicazione online (hosting, configurazione di Supabase e CORS di produzione) e installazione sul telefono (PWA)