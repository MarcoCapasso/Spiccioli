namespace Spiccioli.Api.Tests.Fakes;

//Orologio fermo a un istante scelto dal test: "oggi" non cambia mai
public class FixedTimeProvider : TimeProvider
{
    private readonly DateTimeOffset _now;

    public FixedTimeProvider(DateTimeOffset now)
    {
        _now = now;
    }

    public override DateTimeOffset GetUtcNow() => _now;

    //Fuso UTC: così GetLocalNow() dà lo stesso giorno su qualunque computer
    public override TimeZoneInfo LocalTimeZone => TimeZoneInfo.Utc;
}