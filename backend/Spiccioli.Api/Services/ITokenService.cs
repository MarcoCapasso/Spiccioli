using Spiccioli.Api.Models;

namespace Spiccioli.Api.Services;

public interface ITokenService
{
    string CreateToken(User user);
}