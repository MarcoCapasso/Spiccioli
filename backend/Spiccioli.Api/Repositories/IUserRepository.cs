using Spiccioli.Api.Models;

namespace Spiccioli.Api.Repositories;

public interface IUserRepository
{
   Task<User?> GetByEmailAsync(string email);

   Task AddAsync(User user);
}