using System.ComponentModel.DataAnnotations;

namespace Spiccioli.Api.Common;

//Impostazioni di Supabase Auth, lette dalla sezione "Supabase" e verificate all'avvio
public class SupabaseOptions
{
    public const string SectionName = "Supabase";

    //Il destinatario dei token degli utenti autenticati, fissato da Supabase
    public const string Audience = "authenticated";

    [Required, Url]
    public string Url { get; init; } = string.Empty;

    //La chiave segreta (sb_secret_...): solo lato server, mai nel codice né in Git.
    //Non è obbligatoria all'avvio: serve solo per eliminare un account
    public string SecretKey { get; init; } = string.Empty;

    //L'emittente dei token, e l'indirizzo da cui ASP.NET Core scopre le chiavi pubbliche
    public string Authority => $"{Url.TrimEnd('/')}/auth/v1";
}