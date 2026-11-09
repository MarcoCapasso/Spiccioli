using System.Security.Cryptography;
using Spiccioli.Api.Common;
using Spiccioli.Api.Data;

namespace Spiccioli.Api.Tests.Common;

//Test della cifratura dei testi: chi la rompe, rompe la privacy degli utenti
public class FieldCipherTests
{
    //Due chiavi di prova diverse (32 byte ciascuna, in base64)
    private static readonly string KeyA = Convert.ToBase64String(Enumerable.Repeat((byte)7, 32).ToArray());
    private static readonly string KeyB = Convert.ToBase64String(Enumerable.Repeat((byte)9, 32).ToArray());

    private static FieldCipher NewCipher(string? key = null) => new(key ?? KeyA);

    [Theory]
    [InlineData("Spesa al supermercato")]
    [InlineData("Caffè e cornetto ☕")]
    [InlineData("")]
    [InlineData("enc:v1:non-è-davvero-cifrato")]
    public void Decrypt_returns_the_original_text(string text)
    {
        var cipher = NewCipher();

        var stored = cipher.Encrypt(text);

        Assert.Equal(text, cipher.Decrypt(stored));
    }

    [Fact]
    public void Encrypted_text_has_the_prefix_and_hides_the_original()
    {
        var stored = NewCipher().Encrypt("Visita dal dentista");

        Assert.StartsWith(FieldCipher.Prefix, stored);
        Assert.DoesNotContain("dentista", stored);
    }

    [Fact]
    public void Same_text_encrypted_twice_gives_different_results()
    {
        var cipher = NewCipher();

        Assert.NotEqual(cipher.Encrypt("Affitto"), cipher.Encrypt("Affitto"));
    }

    [Fact]
    public void Text_without_the_prefix_is_legacy_plaintext_and_passes_through()
    {
        Assert.Equal("Affitto", NewCipher().Decrypt("Affitto"));
    }

    [Fact]
    public void Tampered_text_is_rejected()
    {
        var cipher = NewCipher();
        var stored = cipher.Encrypt("Affitto");

        //Si cambia un carattere del contenuto cifrato (dopo il prefisso)
        var index = FieldCipher.Prefix.Length + 30;
        var tampered = stored[..index] + (stored[index] == 'A' ? 'B' : 'A') + stored[(index + 1)..];

        Assert.ThrowsAny<CryptographicException>(() => cipher.Decrypt(tampered));
    }

    [Fact]
    public void Wrong_key_cannot_decrypt()
    {
        var stored = NewCipher(KeyA).Encrypt("Affitto");

        Assert.ThrowsAny<CryptographicException>(() => NewCipher(KeyB).Decrypt(stored));
    }

    [Fact]
    public void Truncated_payload_is_rejected()
    {
        Assert.ThrowsAny<CryptographicException>(
            () => NewCipher().Decrypt(FieldCipher.Prefix + Convert.ToBase64String(new byte[5])));
    }

    [Fact]
    public void BlindIndex_ignores_case_and_surrounding_spaces()
    {
        var cipher = NewCipher();

        Assert.Equal(cipher.BlindIndex("Cibo"), cipher.BlindIndex("  cIBO "));
    }

    [Fact]
    public void BlindIndex_differs_for_different_names_and_keys()
    {
        Assert.NotEqual(NewCipher().BlindIndex("Cibo"), NewCipher().BlindIndex("Casa"));
        Assert.NotEqual(NewCipher(KeyA).BlindIndex("Cibo"), NewCipher(KeyB).BlindIndex("Cibo"));
    }

    [Fact]
    public void BlindIndex_is_64_hex_characters_and_hides_the_name()
    {
        var key = NewCipher().BlindIndex("Psicologo");

        Assert.Equal(64, key.Length);
        Assert.Matches("^[0-9A-F]{64}$", key);
    }

    [Fact]
    public void Constructor_rejects_a_key_that_is_not_32_bytes()
    {
        var shortKey = Convert.ToBase64String(new byte[16]);

        Assert.Throws<InvalidOperationException>(() => new FieldCipher(shortKey));
    }

    [Fact]
    public void Constructor_rejects_a_key_that_is_not_base64()
    {
        Assert.Throws<InvalidOperationException>(() => new FieldCipher("questa non è una chiave!"));
    }

    [Fact]
    public void Converter_encrypts_going_to_the_database_and_decrypts_coming_back()
    {
        var converter = new EncryptedStringConverter(NewCipher());

        var toDatabase = (string)converter.ConvertToProvider("Visita dal dentista")!;
        var fromDatabase = (string)converter.ConvertFromProvider(toDatabase)!;

        Assert.StartsWith(FieldCipher.Prefix, toDatabase);
        Assert.Equal("Visita dal dentista", fromDatabase);
    }

    [Fact]
    public void Converter_reads_legacy_plaintext_rows()
    {
        var converter = new EncryptedStringConverter(NewCipher());

        Assert.Equal("Affitto", converter.ConvertFromProvider("Affitto"));
    }
}
