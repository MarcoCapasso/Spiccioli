using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.Text.Json.Serialization;
using Microsoft.IdentityModel.Tokens;

using Spiccioli.Api.Data;
using Spiccioli.Api.Repositories;
using Spiccioli.Api.Services;
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
builder.Services.AddScoped<IMonthlyBudgetRepository, MonthlyBudgetRepository>();

//Service: stesso ciclo di vita dei Repository da cui dipendono
builder.Services.AddScoped<ITransactionService, TransactionService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IProfileService, ProfileService>();
builder.Services.AddScoped<IRecurringExpenseService, RecurringExpenseService>();
builder.Services.AddScoped<IMonthlyBudgetService, MonthlyBudgetService>();
builder.Services.AddScoped<IPlannedPaymentSynchronizer, PlannedPaymentSynchronizer>();
builder.Services.AddScoped<IPlannedPaymentService, PlannedPaymentService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();

//Crea l'utente al primo accesso; la cache ricorda chi esiste già
builder.Services.AddScoped<IUserProvisioner, UserProvisioner>();
builder.Services.AddMemoryCache();

//Verifica una categoria, a disposizione degli altri Service
builder.Services.AddScoped<ICategoryValidator, CategoryValidator>();

//L'orologio come dipendenza: l'ora di sistema nell'applicazione
builder.Services.AddSingleton(TimeProvider.System);


builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(
            new JsonStringEnumConverter(allowIntegerValues : false));
    });

//Impostazioni di Supabase Auth, verificate all'avvio
builder.Services.AddOptions<SupabaseOptions>()
    .Bind(builder.Configuration.GetSection(SupabaseOptions.SectionName))
    .ValidateDataAnnotations()
    .ValidateOnStart();

//Le origini da cui il browser può chiamare l'API
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

//Verifica dei token di Supabase: firma con le chiavi pubbliche, scoperte dall'Authority
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var supabase = builder.Configuration.GetSection(SupabaseOptions.SectionName).Get<SupabaseOptions>()
            ?? throw new InvalidOperationException("Sezione 'Supabase' mancante nella configurazione. Vedi README.");

        //Da qui ASP.NET Core scarica le chiavi pubbliche, e le aggiorna da solo
        options.Authority = supabase.Authority;

        //Mantiene i nomi dei claim come sono nel token ("sub", "email")
        options.MapInboundClaims = false;

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = supabase.Authority,
            ValidateAudience = true,
            ValidAudience = SupabaseOptions.Audience,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
        };

        //Dopo ogni token valido prima di qualunque Controller
        options.Events = new JwtBearerEvents
        {
            OnTokenValidated = async context =>
            {
                var provisioner = context.HttpContext.RequestServices.GetRequiredService<IUserProvisioner>();
                await provisioner.EnsureExistsAsync(context.Principal!);
            },
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

//Il permesso del browser
app.UseCors();

//Prima si stabilisce chi è l'utente (dal token), poi si decide cosa può fare
app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();
