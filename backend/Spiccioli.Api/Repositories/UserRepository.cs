using Microsoft.EntityFrameworkCore;
using Npgsql;
using Spiccioli.Api.Data;
using Spiccioli.Api.Models;


namespace Spiccioli.Api.Repositories;

//Accesso ai dati degli utenti tramite EF Core
public class UserRepository : IUserRepository
{
    private readonly AppDbContext _context;

    public UserRepository(AppDbContext context)
    {
        _context = context;
    }

    
    //L'utente con questo Id, tracciato: l'onboarding lo modificherà
    public async Task<User?> GetByIdAsync(Guid id)
    {
        return await _context.Users
            .Where(u => u.Id == id)
            .FirstOrDefaultAsync();
    }

    public async Task<bool> ExistsAsync(Guid id)
    {
        return await _context.Users.AnyAsync(u => u.Id == id);
    }

    public async Task<bool> TryAddAsync(User user)
    {
        _context.Users.Add(user);

        try
        {
            await _context.SaveChangesAsync();
            return true;
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation })
        {
            //Un'altra richiesta ha creato lo stesso utente un istante prima: si scarta il nostro tentativo
            _context.ChangeTracker.Clear();
            return false;
        }
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}