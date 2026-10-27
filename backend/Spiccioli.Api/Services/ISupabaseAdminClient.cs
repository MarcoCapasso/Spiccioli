namespace Spiccioli.Api.Services;

//Le operazioni di amministrazione su Supabase Auth, che richiedono la chiave segreta
public interface ISupabaseAdminClient
{
    //False se la chiave segreta non è stata configurata
    bool IsConfigured { get; }

    //Elimina l'account di accesso; se non esiste più va bene lo stesso
    Task DeleteUserAsync(Guid userId);
}