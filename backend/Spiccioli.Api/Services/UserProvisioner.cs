using System.Security.Claims;
using System.Text.Json;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.IdentityModel.JsonWebTokens;
using Spiccioli.Api.Models;
using Spiccioli.Api.Repositories;

namespace Spiccioli.Api.Services;

//Crea l'utente al primo accesso, e ricorda in memoria chi esiste già, per non interrogare il database a ogni richiesta
public class UserProvisioner : IUserProvisioner
{
    private readonly IUserRepository _users;
    private readonly IMemoryCache _cache;

    public UserProvisioner(IUserRepository users, IMemoryCache cache)
    {
        _users = users;
        _cache = cache;
    }

    //La chiave con cui si ricorda un utente già verificato; condivisa per poterla togliere alla cancellazione dell'account
    public static string CacheKey(Guid userId) => $"user-exists:{userId}";

    public async Task EnsureExistsAsync(ClaimsPrincipal principal)
    {
        var subject = principal.FindFirstValue(JwtRegisteredClaimNames.Sub)
            ?? throw new InvalidOperationException("Token autenticato senza claim 'sub'.");
        var userId = Guid.Parse(subject);

        //Già verificato di recente: nessuna query
        var cacheKey = CacheKey(userId);
        if (_cache.TryGetValue(cacheKey, out _))
        {
            return;
        }

        if (!await _users.ExistsAsync(userId))
        {
            var email = principal.FindFirstValue(JwtRegisteredClaimNames.Email) ?? string.Empty;

            var created = await _users.TryAddAsync(new User
            {
                Id = userId,
                Email = email.Trim().ToLowerInvariant(),
                //Il nome arriva da Google; con email e password non c'è, e si usa la parte prima della chiocciola
                FirstName = ReadName(principal) ?? email.Split('@')[0],
            });

            //False può significare "creato da un'altra richiesta", ma anche un altro conflitto (per esempio l'email):
            //si verifica che l'utente esista davvero, invece di fidarsi
            if (!created && !await _users.ExistsAsync(userId))
            {
                throw new InvalidOperationException("Impossibile creare l'utente al primo accesso.");
            }
        }

        _cache.Set(cacheKey, true, TimeSpan.FromHours(1));
    }

    //Il nome dell'utente, dai metadati che Supabase riceve da Google ("full_name" o "name"); null se assente
    private static string? ReadName(ClaimsPrincipal principal)
    {
        var metadata = principal.FindFirstValue("user_metadata");
        if (metadata is null)
        {
            return null;
        }

        using var document = JsonDocument.Parse(metadata);
        foreach (var key in new[] { "full_name", "name" })
        {
            if (document.RootElement.TryGetProperty(key, out var value) && value.ValueKind == JsonValueKind.String)
            {
                return value.GetString();
            }
        }

        return null;
    }
}