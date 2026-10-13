namespace Spiccioli.Api.Common;

//Categorie di fallimento previste, ognuna corrisponde a un codice HTTP preciso
public enum ErrorType
{
    Validation = 1,   // 400: un campo della richiesta non è valido
    NotFound = 2,     // 404: la risorsa indicata nell'URL non esiste
    Conflict = 3      // 409: la richiesta è in conflitto con lo stato attuale dei dati
}

//Un fallimento previsto, descritto: tipo, messaggio e (se c'è) il campo errato
public record Error(ErrorType Type, string Message, string? Field = null)
{
    public static Error Validation(string field, string message) =>
        new(ErrorType.Validation, message, field);

    public static Error NotFound(string message) =>
        new(ErrorType.NotFound, message);

    public static Error Conflict(string message) =>
        new(ErrorType.Conflict, message);
}