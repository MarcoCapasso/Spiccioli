using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Spiccioli.Api.Data;
using Spiccioli.Api.Repositories;
using Spiccioli.Api.Services;
using Spiccioli.Api.Models;
using Spiccioli.Api.Common;

var builder = WebApplication.CreateBuilder(args);

//Legge la connection string dalle fonti di configurazione
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException(
        "Connection string 'DefaultConnection' mancante. Vedi README.");
        
//Registra il DbContext
builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(connectionString));

//Repository: uno per richiesta HTTP, come il DbContext che usano
builder.Services.AddScoped<ITransactionRepository, TransactionRepository>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();

//Service: stesso ciclo di vita dei Repository da cui dipendono
builder.Services.AddScoped<ITransactionService, TransactionService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ITokenService, TokenService>();

//Hash delle password algoritmo lento con salt, mai la password in chiaro
builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();


builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(
            new JsonStringEnumConverter(allowIntegerValues : false));
    });

//Impostazioni dei token, verificate all'avvio: senza una chiave valida il server non parte
builder.Services.AddOptions<JwtOptions>()
    .Bind(builder.Configuration.GetSection(JwtOptions.SectionName))
    .ValidateDataAnnotations()
    .ValidateOnStart();

builder.Services.AddOpenApi();
builder.Services.AddProblemDetails();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler();
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
