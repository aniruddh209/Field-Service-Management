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


        modelBuilder.Entity<Technician>()
            .HasOne(t => t.User)
            .WithOne(u => u.Technician)
            .HasForeignKey<Technician>(t => t.UserId)
            .OnDelete(DeleteBehavior.Cascade);


        modelBuilder.Entity<ServiceRequest>()
            .HasOne(sr => sr.Customer)
            .WithMany(u => u.ServiceRequests)
            .HasForeignKey(sr => sr.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);


        modelBuilder.Entity<Asset>()
            .HasOne(a => a.Customer)
            .WithMany(u => u.Assets)
            .HasForeignKey(a => a.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);


        modelBuilder.Entity<ServiceRequest>()
            .HasOne(sr => sr.Asset)
            .WithMany(a => a.ServiceRequests)
            .HasForeignKey(sr => sr.AssetId)
            .OnDelete(DeleteBehavior.Restrict);


        modelBuilder.Entity<ServiceRequest>()
            .HasOne(sr => sr.Service)
            .WithMany(s => s.ServiceRequests)
            .HasForeignKey(sr => sr.ServiceId)
            .OnDelete(DeleteBehavior.Restrict);


        modelBuilder.Entity<ServiceRequest>()
            .HasOne(sr => sr.Technician)
            .WithMany(t => t.ServiceRequests)
            .HasForeignKey(sr => sr.TechnicianId)
            .OnDelete(DeleteBehavior.SetNull);


        modelBuilder.Entity<WorkReport>()
            .HasOne(w => w.ServiceRequest)
            .WithOne()
            .HasForeignKey<WorkReport>(
                w => w.ServiceRequestId)
            .OnDelete(DeleteBehavior.Cascade);


        modelBuilder.Entity<WorkReport>()
            .HasOne(w => w.Technician)
            .WithMany()
            .HasForeignKey(w => w.TechnicianId)
            .OnDelete(DeleteBehavior.Restrict);


        modelBuilder.Entity<WorkReportPart>()
            .HasOne(p => p.WorkReport)
            .WithMany(w => w.Parts)
            .HasForeignKey(p => p.WorkReportId)
            .OnDelete(DeleteBehavior.Cascade);


        modelBuilder.Entity<WorkReportPart>()
            .HasOne(p => p.InventoryItem)
            .WithMany(i => i.WorkReportParts)
            .HasForeignKey(p => p.InventoryItemId)
            .OnDelete(DeleteBehavior.Restrict);


        modelBuilder.Entity<StockMovement>()
            .HasOne(sm => sm.InventoryItem)
            .WithMany(i => i.StockMovements)
            .HasForeignKey(sm => sm.InventoryItemId)
            .OnDelete(DeleteBehavior.Restrict);


        modelBuilder.Entity<InventoryItem>()
            .HasIndex(i => i.SKU)
            .IsUnique();


        modelBuilder.Entity<WorkReportPart>()
            .Property(p => p.UnitPrice)
            .HasPrecision(18, 2);

        modelBuilder.Entity<WorkReportPart>()
            .Property(p => p.TotalPrice)
            .HasPrecision(18, 2);


        modelBuilder.Entity<WorkReport>()
            .Property(w => w.LabourHours)
            .HasPrecision(5, 2);

        modelBuilder.Entity<WorkReport>()
            .Property(w => w.SuggestedLabourCharge)
            .HasPrecision(18, 2);


        modelBuilder.Entity<Notification>()
            .HasOne(n => n.User)
            .WithMany(u => u.Notifications)
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Cascade);


        modelBuilder.Entity<Invoice>()
            .HasOne(i => i.Customer)
            .WithMany()
            .HasForeignKey(i => i.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);


        modelBuilder.Entity<Invoice>()
            .HasOne(i => i.GeneratedByUser)
            .WithMany()
            .HasForeignKey(i => i.GeneratedByUserId)
            .OnDelete(DeleteBehavior.Restrict);


        modelBuilder.Entity<Invoice>()
            .HasOne(i => i.ServiceRequest)
            .WithMany()
            .HasForeignKey(i => i.ServiceRequestId)
            .OnDelete(DeleteBehavior.Restrict);


        modelBuilder.Entity<InvoiceItem>()
            .HasOne(i => i.Invoice)
            .WithMany(i => i.Items)
            .HasForeignKey(i => i.InvoiceId)
            .OnDelete(DeleteBehavior.Cascade);


        modelBuilder.Entity<InvoiceItem>()
            .HasOne(i => i.InventoryItem)
            .WithMany()
            .HasForeignKey(i => i.InventoryItemId)
            .OnDelete(DeleteBehavior.SetNull);
    }


    public DbSet<User> Users { get; set; }

    public DbSet<Service> Services { get; set; }

    public DbSet<Technician> Technicians { get; set; }

    public DbSet<CustomerAddress> CustomerAddresses { get; set; }

    public DbSet<ServiceRequest> ServiceRequests { get; set; }

    public DbSet<WorkReport> WorkReports { get; set; }

    public DbSet<WorkReportPart> WorkReportParts { get; set; }

    public DbSet<InventoryItem> InventoryItems { get; set; }


    public DbSet<StatusHistory> StatusHistories { get; set; }

    public DbSet<StockMovement> StockMovements { get; set; }

    public DbSet<Asset> Assets { get; set; }

    public DbSet<Invoice> Invoices { get; set; }

    public DbSet<InvoiceItem> InvoiceItems { get; set; }

    public DbSet<Notification> Notifications { get; set; }
}