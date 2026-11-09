using System.Security.Cryptography;
using System.Text;

namespace Spiccioli.Api.Common;

//Cifra e decifra i testi salvati nel database, e calcola l'impronta dei nomi delle categorie
public interface IFieldCipher
{
    //Il testo in chiaro diventa "enc:v1:..." (diverso a ogni chiamata, anche per lo stesso testo)
    string Encrypt(string plaintext);

    //Il contrario. Un testo senza il prefisso è un dato vecchio, salvato in chiaro prima della cifratura: si restituisce com'è
    string Decrypt(string stored);

    //Un'impronta stabile del testo, senza maiuscole e spazi ai bordi: serve a trovare e a rendere unico
    //un nome senza poterlo leggere. Non si può tornare indietro al nome
    string BlindIndex(string text);
}

//AES-256-GCM: cifra e insieme garantisce che il testo non sia stato modificato.
//Formato salvato: "enc:v1:" + base64( nonce 12 byte + tag 16 byte + testo cifrato )
public sealed class FieldCipher : IFieldCipher
{
    //Il prefisso dice che il valore è cifrato e con quale versione: cambiare algoritmo o chiave
    //in futuro vorrà dire aggiungere "enc:v2:" senza perdere i dati vecchi
    public const string Prefix = "enc:v1:";

    private const int NonceSize = 12;
    private const int TagSize = 16;

    private readonly byte[] _encryptionKey;
    private readonly byte[] _indexKey;

    //La chiave principale: 32 byte casuali scritti in base64
    public FieldCipher(string base64Key)
    {
        byte[] master;
        try
        {
            master = Convert.FromBase64String(base64Key);
        }
        catch (FormatException)
        {
            throw new InvalidOperationException("La chiave 'Encryption:Key' non è in base64.");
        }

        if (master.Length != 32)
        {
            throw new InvalidOperationException(
                $"La chiave 'Encryption:Key' deve essere di 32 byte (oggi {master.Length}).");
        }

        //Dalla chiave principale si ricavano due chiavi separate, una per cifrare e una per le impronte:
        //se una venisse usata male, l'altra non ne risente
        _encryptionKey = HKDF.DeriveKey(HashAlgorithmName.SHA256, master, 32,
            info: Encoding.UTF8.GetBytes("spiccioli/encrypt/v1"));
        _indexKey = HKDF.DeriveKey(HashAlgorithmName.SHA256, master, 32,
            info: Encoding.UTF8.GetBytes("spiccioli/blind-index/v1"));
    }

    public string Encrypt(string plaintext)
    {
        var plain = Encoding.UTF8.GetBytes(plaintext);

        //Un numero casuale nuovo a ogni cifratura: due testi uguali non danno mai lo stesso risultato
        var nonce = RandomNumberGenerator.GetBytes(NonceSize);
        var cipherText = new byte[plain.Length];
        var tag = new byte[TagSize];

        using var aes = new AesGcm(_encryptionKey, TagSize);
        aes.Encrypt(nonce, plain, cipherText, tag);

        var payload = new byte[NonceSize + TagSize + cipherText.Length];
        nonce.CopyTo(payload, 0);
        tag.CopyTo(payload, NonceSize);
        cipherText.CopyTo(payload, NonceSize + TagSize);

        return Prefix + Convert.ToBase64String(payload);
    }

    public string Decrypt(string stored)
    {
        //Dato vecchio, mai cifrato: lo si lascia passare, verrà cifrato alla prossima scrittura
        if (!stored.StartsWith(Prefix, StringComparison.Ordinal))
        {
            return stored;
        }

        var payload = Convert.FromBase64String(stored[Prefix.Length..]);
        if (payload.Length < NonceSize + TagSize)
        {
            throw new CryptographicException("Testo cifrato non valido.");
        }

        var nonce = payload.AsSpan(0, NonceSize);
        var tag = payload.AsSpan(NonceSize, TagSize);
        var cipherText = payload.AsSpan(NonceSize + TagSize);
        var plain = new byte[cipherText.Length];

        //Con la chiave sbagliata o un testo manomesso lancia un'eccezione: meglio un errore che dati sbagliati
        using var aes = new AesGcm(_encryptionKey, TagSize);
        aes.Decrypt(nonce, cipherText, tag, plain);

        return Encoding.UTF8.GetString(plain);
    }

    public string BlindIndex(string text)
    {
        var normalized = text.Trim().ToLowerInvariant();
        var hash = HMACSHA256.HashData(_indexKey, Encoding.UTF8.GetBytes(normalized));
        return Convert.ToHexString(hash);
    }
}
