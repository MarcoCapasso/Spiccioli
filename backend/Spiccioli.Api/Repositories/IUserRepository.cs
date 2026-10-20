using Spiccioli.Api.Models;

namespace Spiccioli.Api.Repositories;

//Accesso agli utenti l'Id è quello di Supabase
public interface IUserRepository
{
    //L'utente con questo Id, tracciato per poterlo modificare; null se non esiste
    Task<User?> GetByIdAsync(Guid id);

    //True se l'utente esiste già nella tabella Users
    Task<bool> ExistsAsync(Guid id);

    //Salva un nuovo utente. False se nel frattempo un'altra richiesta lo ha già creato
    Task<bool> TryAddAsync(User user);

    //Salva tutte le modifiche registrate nel DbContext della richiesta, di qualunque tabella
    Task SaveChangesAsync();
}