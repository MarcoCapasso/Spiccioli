using System.Security.Claims;

namespace Spiccioli.Api.Services;

//Garantisce che l'utente di un token valido esista nella tabella Users
public interface IUserProvisioner
{
    //Crea l'utente al primo accesso, con l'Id di Supabase; dopo, non fa nulla
    Task EnsureExistsAsync(ClaimsPrincipal principal);
}