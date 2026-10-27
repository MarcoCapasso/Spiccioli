namespace Spiccioli.Api.Services;

public interface IAccountService
{
    //I movimenti dell'utente in formato CSV (UTF-8 con BOM, separatore ";") pronti per Excel
    Task<byte[]> ExportTransactionsCsvAsync(Guid userId);

    //Elimina tutti i dati dell'utente e il suo accesso. Ripetibile senza danni
    Task DeleteAsync(Guid userId);
}