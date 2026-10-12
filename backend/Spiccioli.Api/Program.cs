using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using Spiccioli.Api.Data;
using Spiccioli.Api.Repositories;
using Spiccioli.Api.Services;

var builder = WebApplication.CreateBuilder(args);

//Legge la connection string dalle fonti di configurazione
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException(
        "Connection string 'DefaultConnection' mancante. Vedi README.");
        
//Registra il DbContext
builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(connectionString));

//Repository e Service: uno per richiesta HTTP, come il DbContext che usano
builder.Services.AddScoped<ITransactionRepository, TransactionRepository>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<ITransactionService, TransactionService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();


builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(
            new JsonStringEnumConverter(allowIntegerValues : false));
    });

builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
