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

Non inserire la connection string nei file del progetto