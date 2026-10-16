using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using Spiccioli.Api.Common;
using Spiccioli.Api.Models;

namespace Spiccioli.Api.Services;

public class TokenService : ITokenService
{
    private readonly JwtOptions _options;
    public TokenService(IOptions<JwtOptions> options)
    {
        _options = options.Value;
    }
    public string CreateToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.Key));

        var descriptor = new SecurityTokenDescriptor
        {
            Issuer = _options.Issuer,
            Audience = _options.Audience,
            Expires = DateTime.UtcNow.AddMinutes(_options.ExpirationMinutes),
            Claims = new Dictionary<string, object>
            {
              [JwtRegisteredClaimNames.Sub] = user.Id.ToString(),
              [JwtRegisteredClaimNames.Email] = user.Email,  
            },
            SigningCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256),
        };

        return new JsonWebTokenHandler().CreateToken(descriptor);
    }
}