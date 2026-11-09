using Microsoft.EntityFrameworkCore;

namespace Spiccioli.Api.Data;

//Comando una tantum: cifra i testi salvati in chiaro prima dell'introduzione della cifratura
//e calcola l'impronta dei nomi delle categorie. Si lancia con: dotnet run -- --encrypt-existing
//È sicuro rilanciarlo: ogni riga viene letta (in chiaro o cifrata) e riscritta cifrata
public static class EncryptionBackfill
{
    private const string Prefix = "enc:v1:";

    public static async Task RunAsync(AppDbContext db, TextWriter output)
    {
        //Tutto in un unico salvataggio: o si cifra tutto, o non cambia nulla
        var transactions = await db.Transactions.ToListAsync();
        foreach (var t in transactions)
        {
            db.Entry(t).Property(x => x.Description).IsModified = true;
            db.Entry(t).Property(x => x.Note).IsModified = true;
        }

        var categories = await db.Categories.ToListAsync();
        foreach (var c in categories)
        {
            //Il nome segnato come modificato porta anche al calcolo dell'impronta (vedi AppDbContext)
            db.Entry(c).Property(x => x.Name).IsModified = true;
        }

        var expenses = await db.RecurringExpenses.ToListAsync();
        foreach (var e in expenses)
        {
            db.Entry(e).Property(x => x.Name).IsModified = true;
        }

        var payments = await db.PlannedPayments.ToListAsync();
        foreach (var p in payments)
        {
            db.Entry(p).Property(x => x.Name).IsModified = true;
        }

        var usages = await db.VoucherUsages.ToListAsync();
        foreach (var u in usages)
        {
            db.Entry(u).Property(x => x.Note).IsModified = true;
        }

        await db.SaveChangesAsync();

        output.WriteLine($"Cifrati: {transactions.Count} movimenti, {categories.Count} categorie, " +
                         $"{expenses.Count} spese ricorrenti, {payments.Count} scadenze, {usages.Count} usi dei buoni.");

        //Controllo finale, con SQL diretto: non deve restare nessun testo in chiaro
        var remaining =
            await CountAsync(db, "Transactions", "Description")
            + await CountAsync(db, "Transactions", "Note")
            + await CountAsync(db, "Categories", "Name")
            + await CountAsync(db, "RecurringExpenses", "Name")
            + await CountAsync(db, "PlannedPayments", "Name")
            + await CountAsync(db, "VoucherUsages", "Note");

        var withoutKey = await db.Database
            .SqlQueryRaw<int>("SELECT COUNT(*)::int AS \"Value\" FROM \"Categories\" WHERE \"NameKey\" IS NULL")
            .SingleAsync();

        output.WriteLine(remaining == 0 && withoutKey == 0
            ? "Controllo finale riuscito: nessun testo in chiaro, tutte le categorie hanno l'impronta."
            : $"ATTENZIONE: restano {remaining} testi in chiaro e {withoutKey} categorie senza impronta.");
    }

    //Quanti valori della colonna non iniziano con il prefisso della cifratura
    private static Task<int> CountAsync(AppDbContext db, string table, string column)
    {
        var sql = $"SELECT COUNT(*)::int AS \"Value\" FROM \"{table}\" " +
                  $"WHERE \"{column}\" IS NOT NULL AND \"{column}\" NOT LIKE '{Prefix}%'";
        return db.Database.SqlQueryRaw<int>(sql).SingleAsync();
    }
}
