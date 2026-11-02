using Spiccioli.Api.Common;
using Spiccioli.Api.Dtos;
using Spiccioli.Api.Models;
using Spiccioli.Api.Repositories;

namespace Spiccioli.Api.Services;

//Regole sui buoni pasto: il saldo non è mai salvato, si calcola da ricariche e usi
public class VoucherService : IVoucherService
{
    private readonly IVoucherRepository _repository;

    public VoucherService(IVoucherRepository repository)
    {
        _repository = repository;
    }

    public async Task<VoucherSummaryResponse> GetSummaryAsync(Guid userId)
    {
        var settings = await _repository.GetSettingsAsync(userId);
        var (topUps, used) = await GetTotalsAsync(userId);

        return ToSummary(settings?.Value, topUps, used);
    }

    public async Task<VoucherSummaryResponse> SetValueAsync(Guid userId, UpdateVoucherSettingsRequest request)
    {
        var value = Math.Round(request.Value, 2, MidpointRounding.AwayFromZero);

        //Una riga sola per utente: si crea la prima volta, poi si aggiorna
        var settings = await _repository.GetSettingsAsync(userId);
        if (settings is null)
        {
            _repository.AddSettings(new VoucherSettings { UserId = userId, Value = value });
        }
        else
        {
            settings.Value = value;
        }

        await _repository.SaveChangesAsync();

        return await GetSummaryAsync(userId);
    }

    public async Task<IReadOnlyList<VoucherTopUpResponse>> GetTopUpsAsync(Guid userId)
    {
        var topUps = await _repository.GetTopUpsAsync(userId);

        return topUps.Select(ToResponse).ToList();
    }

    public async Task<VoucherTopUpResponse> AddTopUpAsync(Guid userId, CreateVoucherTopUpRequest request)
    {
        var topUp = new VoucherTopUp
        {
            Date = request.Date,
            Amount = Math.Round(request.Amount, 2, MidpointRounding.AwayFromZero),
            UserId = userId,
        };

        _repository.AddTopUp(topUp);
        await _repository.SaveChangesAsync();

        return ToResponse(topUp);
    }

    public async Task<Result<bool>> DeleteTopUpAsync(Guid userId, int id)
    {
        var topUp = await _repository.GetTopUpAsync(id, userId);
        if (topUp is null)
        {
            return Result<bool>.Failure(Error.NotFound("Ricarica non trovata."));
        }

        //Senza questa ricarica il credito non coprirebbe più i buoni già usati
        var (topUps, used) = await GetTotalsAsync(userId);
        if (topUps - topUp.Amount < used)
        {
            return Result<bool>.Failure(Error.Conflict(
                "Non puoi eliminare questa ricarica: hai già usato più buoni di quelli che il credito resterebbe a coprire."));
        }

        _repository.RemoveTopUp(topUp);
        await _repository.SaveChangesAsync();

        return Result<bool>.Success(true);
    }

    public async Task<IReadOnlyList<VoucherUsageResponse>> GetUsagesAsync(Guid userId)
    {
        var usages = await _repository.GetUsagesAsync(userId);

        return usages.Select(ToResponse).ToList();
    }

    public async Task<Result<VoucherUsageResponse>> AddUsageAsync(Guid userId, CreateVoucherUsageRequest request)
    {
        //Senza il valore del buono non si può sapere quanti euro scalare
        var settings = await _repository.GetSettingsAsync(userId);
        if (settings is null)
        {
            return Result<VoucherUsageResponse>.Failure(
                Error.Validation(nameof(request.Count), "Imposta prima il valore del buono."));
        }

        //Il credito non può diventare negativo
        var (topUps, used) = await GetTotalsAsync(userId);
        var balance = topUps - used;
        if (request.Count * settings.Value > balance)
        {
            var remaining = RemainingVouchers(balance, settings.Value);
            var message = remaining switch
            {
                0 => "Il credito non basta: non ti restano buoni.",
                1 => "Il credito non basta: ti resta 1 buono.",
                _ => $"Il credito non basta: ti restano {remaining} buoni.",
            };

            return Result<VoucherUsageResponse>.Failure(Error.Validation(nameof(request.Count), message));
        }

        var usage = new VoucherUsage
        {
            Date = request.Date,
            Count = request.Count,

            //La fotografia del valore di oggi: se un giorno cambia, questo uso non cambia
            UnitValue = settings.Value,

            Note = string.IsNullOrWhiteSpace(request.Note) ? null : request.Note.Trim(),
            UserId = userId,
        };

        _repository.AddUsage(usage);
        await _repository.SaveChangesAsync();

        return Result<VoucherUsageResponse>.Success(ToResponse(usage));
    }

    public async Task<bool> DeleteUsageAsync(Guid userId, int id)
    {
        var usage = await _repository.GetUsageAsync(id, userId);
        if (usage is null)
        {
            return false;
        }

        _repository.RemoveUsage(usage);
        await _repository.SaveChangesAsync();

        return true;
    }

    //Ricariche e usi totali, sommati dal database
    private async Task<(decimal TopUps, decimal Used)> GetTotalsAsync(Guid userId)
    {
        var topUps = await _repository.GetTotalTopUpsAsync(userId);
        var used = await _repository.GetTotalUsedAsync(userId);

        return (topUps, used);
    }

    //Quanti buoni interi ci stanno nel credito, al valore indicato
    private static int RemainingVouchers(decimal balance, decimal? unitValue)
    {
        if (unitValue is not > 0m || balance <= 0m)
        {
            return 0;
        }

        return (int)Math.Floor(balance / unitValue.Value);
    }

    private static VoucherSummaryResponse ToSummary(decimal? unitValue, decimal topUps, decimal used)
    {
        var balance = topUps - used;

        return new VoucherSummaryResponse(unitValue, balance, RemainingVouchers(balance, unitValue), topUps, used);
    }

    private static VoucherTopUpResponse ToResponse(VoucherTopUp topUp)
    {
        return new VoucherTopUpResponse(topUp.Id, topUp.Date, topUp.Amount);
    }

    private static VoucherUsageResponse ToResponse(VoucherUsage usage)
    {
        return new VoucherUsageResponse(
            usage.Id,
            usage.Date,
            usage.Count,
            usage.UnitValue,
            usage.Count * usage.UnitValue,
            usage.Note);
    }
}
