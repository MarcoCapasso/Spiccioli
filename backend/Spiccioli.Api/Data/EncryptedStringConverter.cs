using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Spiccioli.Api.Common;

namespace Spiccioli.Api.Data;

//EF Core lo applica alle proprietà di testo scelte: nel database finisce il testo cifrato,
//nel codice (Service, DTO) si vede sempre il testo in chiaro. I valori null restano null
public class EncryptedStringConverter : ValueConverter<string, string>
{
    public EncryptedStringConverter(IFieldCipher cipher)
        : base(plain => cipher.Encrypt(plain), stored => cipher.Decrypt(stored))
    {
    }
}
