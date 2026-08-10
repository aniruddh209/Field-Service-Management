using FieldServiceManagement.API.Models;
using Microsoft.EntityFrameworkCore;

namespace FieldServiceManagement.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);


        // User → Technician (One-to-One)
        modelBuilder.Entity<Technician>()
            .HasOne(t => t.User)
            .WithOne(u => u.Technician)
            .HasForeignKey<Technician>(t => t.UserId)
            .OnDelete(DeleteBehavior.Cascade);      
        
        // Customer → ServiceRequest
        modelBuilder.Entity<ServiceRequest>()
            .HasOne(sr => sr.Customer)
            .WithMany(u => u.ServiceRequests)
            .HasForeignKey(sr => sr.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);
        
        // Service → ServiceRequest
        modelBuilder.Entity<ServiceRequest>()
            .HasOne(sr => sr.Service)
            .WithMany(s => s.ServiceRequests)
            .HasForeignKey(sr => sr.ServiceId)
            .OnDelete(DeleteBehavior.Restrict);
        
        // Technician → ServiceRequest
        modelBuilder.Entity<ServiceRequest>()
            .HasOne(sr => sr.Technician)
            .WithMany(t => t.ServiceRequests)
            .HasForeignKey(sr => sr.TechnicianId)
            .OnDelete(DeleteBehavior.SetNull);
        
    }
    
    public DbSet<User> Users { get; set; }

    public DbSet<Service> Services { get; set; }

    public DbSet<Technician> Technicians { get; set; }

    public DbSet<CustomerAddress> CustomerAddresses { get; set; }

    public DbSet<ServiceRequest> ServiceRequests { get; set; }

    public DbSet<WorkReport> WorkReports { get; set; }

    public DbSet<Invoice> Invoices { get; set; }

    public DbSet<Notification> Notifications { get; set; }

    public DbSet<StatusHistory> StatusHistories { get; set; }
}