using System.Net;
using Microsoft.Extensions.Options;
using Spiccioli.Api.Common;

namespace Spiccioli.Api.Services;

public class SupabaseAdminClient : ISupabaseAdminClient
{
    private readonly HttpClient _http;
    private readonly SupabaseOptions _options;

    public SupabaseAdminClient(HttpClient http, IOptions<SupabaseOptions> options)
    {
        _http = http;
        _options = options.Value;
    }

    public bool IsConfigured => !string.IsNullOrWhiteSpace(_options.SecretKey);

    public async Task DeleteUserAsync(Guid userId)
    {
        using var request = new HttpRequestMessage(
            HttpMethod.Delete, $"{_options.Authority}/admin/users/{userId}");

        //La chiave segreta va nell'intestazione "apikey", non in "Authorization: Bearer"
        request.Headers.Add("apikey", _options.SecretKey);

        using var response = await _http.SendAsync(request);

        //Account già eliminato: l'operazione è ripetibile
        if (response.StatusCode == HttpStatusCode.NotFound)
        {
            return;
        }

        response.EnsureSuccessStatusCode();
    }
}