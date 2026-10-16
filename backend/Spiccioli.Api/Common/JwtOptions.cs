using System.ComponentModel.DataAnnotations;

namespace Spiccioli.Api.Common;

//Impostazioni dei Token
public class JwtOptions
{
    public const string SectionName = "Jwt";

    [Required]
    public string Issuer { get; init; } = string.Empty;

    [Required]
    public string Audience { get; init; } = string.Empty;

    //Segreto dagli user-secrets
    [Required, MinLength(32)]
    public string Key { get; init; } = string.Empty;

    [Range(1, 1440)]
    public int ExpirationMinutes { get; init; }
}