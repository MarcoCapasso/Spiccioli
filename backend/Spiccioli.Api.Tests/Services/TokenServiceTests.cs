using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.JsonWebTokens;
using Spiccioli.Api.Common;
using Spiccioli.Api.Models;
using Spiccioli.Api.Services;

namespace Spiccioli.Api.Tests.Services;

//Test creazione Token
public class TokenServiceTests
{
    [Fact]
    public void CreateToken_ContainsUserIdAsSubject()
    {
        //Arrange
        var options = Options.Create(new JwtOptions
        {
            Issuer = "test-issuer",
            Audience = "test-audience",
            Key = "una-chiave-di-prova-lunga-almeno-32-caratteri",
            ExpirationMinutes = 60,
        });

        var service = new TokenService(options);
        var user = new User { Id = Guid.NewGuid(), Email = "mario@esempio.it" };

        //Act
        var token = service.CreateToken(user);

        //Assert
        var decoded = new JsonWebTokenHandler().ReadJsonWebToken(token);
        Assert.Equal(user.Id.ToString(), decoded.Subject);
    }
}