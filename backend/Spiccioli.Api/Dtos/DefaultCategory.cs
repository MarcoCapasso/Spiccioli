using Spiccioli.Api.Models;

namespace Spiccioli.Api.Dtos;

//Una categoria proposta al primo accesso: l'utente sceglie quali crearsi
public record DefaultCategory(string Name, TransactionType Type);