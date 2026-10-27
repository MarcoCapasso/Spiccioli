using System.Globalization;
using System.Text;
using Microsoft.Extensions.Caching.Memory;
using Spiccioli.Api.Repositories;

namespace Spiccioli.Api.Services;

public class AccountService : IAccountService
{
    private readonly IAccountRepository _accounts;
    private readonly ISupabaseAdminClient _supabase;
    private readonly IMemoryCache _cache;

    public AccountService(IAccountRepository accounts, ISupabaseAdminClient supabase, IMemoryCache cache)
    {
        _accounts = accounts;
        _supabase = supabase;
        _cache = cache;
    }

    public async Task<byte[]> ExportTransactionsCsvAsync(Guid userId)
    {
        var transactions = await _accounts.GetTransactionsAsync(userId);

        //Ogni riga termina con CRLF, come si aspettano i fogli di calcolo
        var csv = new StringBuilder();
        csv.Append("Data;Tipo;Categoria;Descrizione;Nota;Importo\r\n");

        foreach (var t in transactions)
        {
            csv.Append(string.Join(';',
                t.Date.ToString("dd/MM/yyyy", CultureInfo.InvariantCulture),
                Field(t.Type.ToString()),
                Field(t.Category?.Name),
                Field(t.Description),
                Field(t.Note),
                //Virgola decimale, come in un Excel italiano; l'importo è sempre positivo, il segno lo dà il tipo
                t.Amount.ToString("0.00", CultureInfo.InvariantCulture).Replace('.', ',')));
            csv.Append("\r\n");
        }

        //Il BOM fa riconoscere a Excel l'UTF-8, altrimenti le lettere accentate si rovinano
        var encoding = new UTF8Encoding(encoderShouldEmitUTF8Identifier: true);
        return encoding.GetPreamble().Concat(encoding.GetBytes(csv.ToString())).ToArray();
    }

    public async Task DeleteAsync(Guid userId)
    {
        //Si controlla prima di cancellare: senza chiave non si arriverebbe in fondo
        if (!_supabase.IsConfigured)
        {
            throw new InvalidOperationException(
                "Chiave segreta di Supabase mancante ('Supabase:SecretKey'): impossibile eliminare l'account.");
        }

        await _accounts.DeleteAllAsync(userId);

        //Il token resta valido fino alla scadenza: senza questo, una richiesta in ritardo
        //troverebbe l'utente "già verificato" oppure lo ricreerebbe vuoto
        _cache.Remove(UserProvisioner.CacheKey(userId));

        await _supabase.DeleteUserAsync(userId);
    }

    //Un campo del CSV: protetto dalle formule e racchiuso tra virgolette quando serve
    private static string Field(string? value)
    {
        if (string.IsNullOrEmpty(value))
        {
            return string.Empty;
        }

        //Un testo che inizia con = + - @ verrebbe eseguito come formula dal foglio di calcolo
        if ("=+-@\t\r".Contains(value[0]))
        {
            value = "'" + value;
        }

        if (value.IndexOfAny([';', '"', '\r', '\n']) >= 0)
        {
            value = "\"" + value.Replace("\"", "\"\"") + "\"";
        }

        return value;
    }
}