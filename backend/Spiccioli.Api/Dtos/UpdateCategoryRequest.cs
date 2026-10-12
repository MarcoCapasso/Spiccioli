namespace Spiccioli.Api.Dtos;

//solo il nome, il tipo si decide alla creazione e non cambia più
public record UpdateCategoryRequest(
    string Name
);