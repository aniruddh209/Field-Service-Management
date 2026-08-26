using FieldServiceManagement.API.Data;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;
using FieldServiceManagement.API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
namespace FieldServiceManagement.API;
using FluentValidation;
using FieldServiceManagement.API.Validators.Technicians;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);
        

        builder.Services.AddControllers();
        builder.Services.AddValidatorsFromAssemblyContaining<Program>();
        
        
        builder.Services.AddScoped<AuthService>();
        builder.Services.AddScoped<JwtService>();
        builder.Services.AddScoped<TechnicianService>();
        builder.Services.AddScoped<ServiceRequestService>();
        builder.Services.AddScoped<WorkReportService>();
        builder.Services.AddScoped<AssetService>();
        builder.Services.AddScoped<CustomerAddressService>();
        builder.Services.AddScoped<InventoryService>();
        builder.Services.AddScoped<StockMovementService>();
        
        
        builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,

                    ValidIssuer = builder.Configuration["Jwt:Issuer"],
                    ValidAudience = builder.Configuration["Jwt:Audience"],

                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)
                    )
                };
            });
        builder.Services.AddAuthorization();

        // Register Entity Framework Core with SQL Server
        builder.Services.AddDbContext<AppDbContext>(options =>
            options.UseSqlServer(
                builder.Configuration.GetConnectionString("DefaultConnection")
            ));
        
        
        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowReact", policy =>
            {
                policy
                    .AllowAnyOrigin()
                    .AllowAnyHeader()
                    .AllowAnyMethod();
            });
        });
        
        builder.Services.AddOpenApi();

        var app = builder.Build();

        // HTTP request Things.
        if (app.Environment.IsDevelopment())
        {
            app.MapScalarApiReference();
            app.MapOpenApi();
        }

        app.UseHttpsRedirection();
        app.UseCors("AllowReact");
        app.UseAuthentication();
        app.UseAuthorization();
        
        app.MapControllers();

        app.Run();
    }
}