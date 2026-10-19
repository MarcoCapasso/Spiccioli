using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.Text;
using System.Text.Json.Serialization;
using Microsoft.IdentityModel.Tokens;

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
builder.Services.AddScoped<IRecurringExpenseRepository, RecurringExpenseRepository>();

//Service: stesso ciclo di vita dei Repository da cui dipendono
builder.Services.AddScoped<ITransactionService, TransactionService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IProfileService, ProfileService>();
builder.Services.AddScoped<ICategoryValidator, CategoryValidator>();
builder.Services.AddScoped<IRecurringExpenseService, RecurringExpenseService>();

//Hash delle password algoritmo lento con salt, mai la password in chiaro
builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();

//L'orologio come dipendenza: l'ora di sistema nell'applicazione
builder.Services.AddSingleton(TimeProvider.System);


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

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var jwt = builder.Configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>()
            ?? throw new InvalidOperationException("Sezione 'Jwt' mancante nella configurazione. Vedi README.");

        //Mantiene i nomi nel claim così come dal token
        options.MapInboundClaims = false;

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwt.Issuer,
            ValidateAudience = true,
            ValidAudience = jwt.Audience,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Key)),
        };
    });

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

//Prima si stabilisce chi è l'utente (dal token), poi si decide cosa può fare
app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();
