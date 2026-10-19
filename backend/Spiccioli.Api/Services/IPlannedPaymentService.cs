using Spiccioli.Api.Common;
using Spiccioli.Api.Dtos;

namespace Spiccioli.Api.Services;

//Operazioni sui pagamenti previsti dei piani
public interface IPlannedPaymentService
{
    //Salda un pagamento previsto creando la transazione collegata, con importo e data reali.
    //NotFound se il pagamento non esiste o non è dell'utente, Conflict se è già saldato,
    //Validation se la categoria della spesa non è più utilizzabile
    Task<Result<TransactionResponse>> PayAsync(Guid userId, int plannedPaymentId, PayPlannedPaymentRequest request);
}