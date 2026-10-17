using Spiccioli.Api.Models;

namespace Spiccioli.Api.Repositories;

public interface IUserRepository
{
   //L'utente con questa email, null se non esiste
   Task<User?> GetByEmailAsync(string email);

   //L'utente con questo Id
   Task<User?> GetByIdAsync(Guid id);

   //Salva un nuovo utente
   Task AddAsync(User user);

   //Salva tutte le modifiche di qualunque tabella
   Task SaveChangesAsync();
}