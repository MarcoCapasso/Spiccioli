namespace Spiccioli.Api.Common;

//Tavolozza colori per le categorie
public static class CategoryPalette
{
    public static readonly IReadOnlyList<string> Colors =
    [
        "#F97316", "#3B82F6", "#8B5CF6", "#EC4899", "#14B8A6",
        "#EAB308", "#64748B", "#22C55E", "#EF4444", "#0EA5E9",
    ];

    //Colore default
    public const string Default = "#64748B";

    //Un colore valido è #RRGGBB: il cancelletto e sei cifre esadecimali
    public static bool IsValidColor(string color) =>
        color.Length == 7 && color[0] == '#' && color.Skip(1).All(Uri.IsHexDigit);
}