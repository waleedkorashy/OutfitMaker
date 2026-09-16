using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.OpenApi;
using OutFitMaker.API.Utilities;
using OutFitMaker.DataAccess.DbContext;
using OutFitMaker.DataAccess.Seeding;
using OutFitMaker.Domain.Constants.Statics;
using OutFitMaker.Domain.Helper;
using OutFitMaker.Domain.Interfaces.Main;
using OutFitMaker.Domain.Models.Security;
using OutFitMaker.Services.IServices.Security;
using Scalar.AspNetCore;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Only bind the fixed dev URL in Development. In production (IIS / hosting
// panel) the port and binding come from ASPNETCORE_URLS or the web.config.
if (builder.Environment.IsDevelopment())
{
    builder.WebHost.UseUrls("http://localhost:5111");
}

builder.Services.AddControllers();
builder.Services.AddAutoMapper(_ => { }, typeof(Program));

var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>() ?? Array.Empty<string>();

builder.Services.AddCors(options =>
{
    options.AddPolicy(GlobalStatices.CorsPolicy, policy =>
    {
        if (allowedOrigins.Length > 0)
        {
            policy.WithOrigins(allowedOrigins)
                .AllowAnyMethod()
                .AllowAnyHeader();
        }
        else
        {
            policy.AllowAnyOrigin()
                .AllowAnyMethod()
                .AllowAnyHeader();
        }
    });
});

builder.Services.AddIdentity<UserSet, RoleSet>()
    .AddEntityFrameworkStores<OutFitMakerDbContext>()
    .AddDefaultTokenProviders();

builder.Services.AddDbContext<OutFitMakerDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString(GlobalStatices.OutFitMakerConnectionString),
        b => b.MigrationsAssembly(typeof(OutFitMakerDbContext).Assembly.FullName)));

builder.Services.AddJWT(builder.Configuration)
    .ConfigIdentityOptions()
    .ConfigureApiBehaviorOptions();

builder.Services.AddAuthorization();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "OutFitMaker API",
        Version = "v1",
        Description = "AI-powered fashion e-commerce API. Sign in with a Customer account, then use the returned token as a Bearer token for order and favorites endpoints."
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Paste the token returned by 'User/SignIn'."
    });

    c.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference("Bearer", document)] = new List<string>()
    });
});

builder.Services.Configure<AiApiOptions>(builder.Configuration.GetSection(AiApiOptions.SectionName));
builder.Services.Configure<EncryptionKey>(builder.Configuration.GetSection("EncryptionKey"));
builder.Services.AddHttpContextAccessor();
builder.Services.AddHttpClient();

builder.Services.InjectedDependencies();

Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .WriteTo.Console()
    .CreateLogger();
builder.Host.UseSerilog();

var app = builder.Build();

await SeedData(app);

var imagesDirectory = Path.Combine(app.Environment.ContentRootPath, "Images");
if (!Directory.Exists(imagesDirectory) || !Directory.EnumerateFiles(imagesDirectory).Any())
{
    var sourceImages = Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "Images");
    if (Directory.Exists(sourceImages))
        imagesDirectory = Path.GetFullPath(sourceImages);
}
if (!Directory.Exists(imagesDirectory))
    Directory.CreateDirectory(imagesDirectory);

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(imagesDirectory),
    RequestPath = "/Images"
});

app.UseCors(GlobalStatices.CorsPolicy);
app.MapSwagger("/openapi/{documentName}.json");
app.MapScalarApiReference(options =>
{
    options.WithTitle("OutFitMaker API");
    options.WithDefaultHttpClient(ScalarTarget.CSharp, ScalarClient.HttpClient);
});

app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();

static async Task SeedData(IHost host)
{
    try
    {
        using var scope = host.Services.CreateScope();

        // Apply any pending EF migrations so a fresh production database gets the
        // full schema automatically (ProductsStock included via its migration).
        var db = scope.ServiceProvider.GetRequiredService<OutFitMakerDbContext>();
        await db.Database.MigrateAsync();

        var roleService = scope.ServiceProvider.GetService<IRoleCreationService>();
        await roleService!.CreateRolesAsync();

        var userService = scope.ServiceProvider.GetService<IUserCreationService>();
        await userService!.CreateUsersAsync();

        var sizeService = scope.ServiceProvider.GetService<ISizeCreationServices>();
        await sizeService!.CreateSizesAsync();
    }
    catch (Exception ex)
    {
        // Log loudly but DO NOT crash the app: a bad/missing connection string,
        // a locked DB, or a stalled migration turns 500.30 into a readable log
        // entry and lets the API still boot (static content, docs, health probe).
        Log.Error(ex, "Database startup seeding/migration failed. Check " +
            "ConnectionStrings__OutFitMakerConnection on the hosting panel.");
    }
}