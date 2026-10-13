namespace Spiccioli.Api.Common;

// Esito di un'operazione: o un valore (successo) o un errore (fallimento), mai entrambi
public class Result<T>
{
    public T? Value { get; }
    public Error? Error { get; }
    public bool IsSuccess => Error is null;

    //Costruttori privati
    private Result(T value) => Value = value;
    private Result(Error error) => Error = error;

    public static Result<T> Success(T value) => new(value);
    public static Result<T> Failure(Error error) => new(error);
}