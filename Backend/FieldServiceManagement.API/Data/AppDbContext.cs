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


        // =========================================================
        // USER → TECHNICIAN
        // =========================================================
        // One User has one Technician.
        //
        // Technician.UserId is the foreign key.
        //
        // Example:
        //
        // User
        //   Id = 10
        //
        // Technician
        //   UserId = 10
        //
        // They belong together.

        modelBuilder.Entity<Technician>()
            .HasOne(t => t.User)
            .WithOne(u => u.Technician)
            .HasForeignKey<Technician>(t => t.UserId)
            .OnDelete(DeleteBehavior.Cascade);


        // =========================================================
        // CUSTOMER → SERVICE REQUEST
        // =========================================================
        // One Customer can have many ServiceRequests.
        //
        // ServiceRequest.CustomerId → User.Id
        //
        // Restrict prevents deleting a customer while
        // service request history still exists.

        modelBuilder.Entity<ServiceRequest>()
            .HasOne(sr => sr.Customer)
            .WithMany(u => u.ServiceRequests)
            .HasForeignKey(sr => sr.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);


        // =========================================================
        // CUSTOMER → ASSET
        // =========================================================
        // One Customer can have many Assets.
        //
        // Asset.CustomerId → User.Id
        //
        // IMPORTANT:
        // User property is "Assets", not "Asset".

        modelBuilder.Entity<Asset>()
            .HasOne(a => a.Customer)
            .WithMany(u => u.Assets)
            .HasForeignKey(a => a.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);


        // =========================================================
        // ASSET → SERVICE REQUEST
        // =========================================================
        // One Asset can be used by many ServiceRequests.
        //
        // ServiceRequest.AssetId → Asset.Id
        //
        // AssetId is nullable, so a request may have no asset.
        //
        // Restrict prevents SQL Server cascade-path problems
        // and protects service-request history.

        modelBuilder.Entity<ServiceRequest>()
            .HasOne(sr => sr.Asset)
            .WithMany(a => a.ServiceRequests)
            .HasForeignKey(sr => sr.AssetId)
            .OnDelete(DeleteBehavior.Restrict);


        // =========================================================
        // SERVICE → SERVICE REQUEST
        // =========================================================
        // One Service can be used by many ServiceRequests.
        //
        // ServiceRequest.ServiceId → Service.Id

        modelBuilder.Entity<ServiceRequest>()
            .HasOne(sr => sr.Service)
            .WithMany(s => s.ServiceRequests)
            .HasForeignKey(sr => sr.ServiceId)
            .OnDelete(DeleteBehavior.Restrict);


        // =========================================================
        // TECHNICIAN → SERVICE REQUEST
        // =========================================================
        // One Technician can have many ServiceRequests.
        //
        // TechnicianId is nullable.
        //
        // A request can exist before a technician is assigned.
        //
        // If technician is deleted, SQL Server sets
        // TechnicianId to NULL.

        modelBuilder.Entity<ServiceRequest>()
            .HasOne(sr => sr.Technician)
            .WithMany(t => t.ServiceRequests)
            .HasForeignKey(sr => sr.TechnicianId)
            .OnDelete(DeleteBehavior.SetNull);


        // =========================================================
        // SERVICE REQUEST → WORK REPORT
        // =========================================================
        // One ServiceRequest has one WorkReport.
        //
        // WorkReport.ServiceRequestId → ServiceRequest.Id
        //
        // Deleting a ServiceRequest removes its WorkReport.

        modelBuilder.Entity<WorkReport>()
            .HasOne(w => w.ServiceRequest)
            .WithOne()
            .HasForeignKey<WorkReport>(
                w => w.ServiceRequestId)
            .OnDelete(DeleteBehavior.Cascade);


        // =========================================================
        // TECHNICIAN → WORK REPORT
        // =========================================================
        // One Technician can create many WorkReports.
        //
        // WorkReport.TechnicianId → Technician.Id
        //
        // Restrict protects historical work reports.

        modelBuilder.Entity<WorkReport>()
            .HasOne(w => w.Technician)
            .WithMany()
            .HasForeignKey(w => w.TechnicianId)
            .OnDelete(DeleteBehavior.Restrict);


        // =========================================================
        // WORK REPORT → WORK REPORT PART
        // =========================================================
        // One WorkReport can contain many parts.
        //
        // WorkReportPart.WorkReportId → WorkReport.Id

        modelBuilder.Entity<WorkReportPart>()
            .HasOne(p => p.WorkReport)
            .WithMany(w => w.Parts)
            .HasForeignKey(p => p.WorkReportId)
            .OnDelete(DeleteBehavior.Cascade);


        // =========================================================
        // INVENTORY ITEM → WORK REPORT PART
        // =========================================================
        // One InventoryItem can appear in many WorkReportParts.
        //
        // WorkReportPart.InventoryItemId → InventoryItem.Id
        //
        // Restrict protects historical reports.

        modelBuilder.Entity<WorkReportPart>()
            .HasOne(p => p.InventoryItem)
            .WithMany(i => i.WorkReportParts)
            .HasForeignKey(p => p.InventoryItemId)
            .OnDelete(DeleteBehavior.Restrict);


        // =========================================================
        // INVENTORY ITEM → STOCK MOVEMENT
        // =========================================================
        // One InventoryItem can have many StockMovements.
        //
        // StockMovement.InventoryItemId → InventoryItem.Id
        //
        // Restrict protects inventory history.

        modelBuilder.Entity<StockMovement>()
            .HasOne(sm => sm.InventoryItem)
            .WithMany(i => i.StockMovements)
            .HasForeignKey(sm => sm.InventoryItemId)
            .OnDelete(DeleteBehavior.Restrict);


        // =========================================================
        // INVENTORY SKU
        // =========================================================
        // Every inventory item must have a unique SKU.

        modelBuilder.Entity<InventoryItem>()
            .HasIndex(i => i.SKU)
            .IsUnique();


        // =========================================================
        // WORK REPORT PART PRICES
        // =========================================================

        modelBuilder.Entity<WorkReportPart>()
            .Property(p => p.UnitPrice)
            .HasPrecision(18, 2);

        modelBuilder.Entity<WorkReportPart>()
            .Property(p => p.TotalPrice)
            .HasPrecision(18, 2);


        // =========================================================
        // WORK REPORT VALUES
        // =========================================================

        modelBuilder.Entity<WorkReport>()
            .Property(w => w.LabourHours)
            .HasPrecision(5, 2);

        modelBuilder.Entity<WorkReport>()
            .Property(w => w.SuggestedLabourCharge)
            .HasPrecision(18, 2);
    }


    // =========================================================
    // DATABASE TABLES
    // =========================================================

    public DbSet<User> Users { get; set; }

    public DbSet<Service> Services { get; set; }

    public DbSet<Technician> Technicians { get; set; }

    public DbSet<CustomerAddress> CustomerAddresses { get; set; }

    public DbSet<ServiceRequest> ServiceRequests { get; set; }

    public DbSet<WorkReport> WorkReports { get; set; }

    public DbSet<WorkReportPart> WorkReportParts { get; set; }

    public DbSet<InventoryItem> InventoryItems { get; set; }

    public DbSet<Invoice> Invoices { get; set; }

    public DbSet<Notification> Notifications { get; set; }

    public DbSet<StatusHistory> StatusHistories { get; set; }

    public DbSet<StockMovement> StockMovements { get; set; }

    public DbSet<Asset> Assets { get; set; }
}