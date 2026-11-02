namespace Spiccioli.Api.Dtos;

//Il riepilogo dei buoni pasto: il saldo si calcola da ricariche e usi, non si salva
public record VoucherSummaryResponse(
    //Il valore attuale di un buono; null finché non è stato impostato
    decimal? UnitValue,

    //Credito rimasto in euro: ricariche meno usi
    decimal Balance,

    //Quanti buoni interi ci stanno nel credito rimasto, al valore attuale
    int RemainingVouchers,

    decimal TotalTopUps,
    decimal TotalUsed);
