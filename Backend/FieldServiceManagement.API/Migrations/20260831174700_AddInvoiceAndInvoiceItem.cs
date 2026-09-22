using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FieldServiceManagement.API.Migrations
{

    public partial class AddInvoiceAndInvoiceItem : Migration
    {

        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Discount",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "DueDate",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "PaymentMethod",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "PaymentStatus",
                table: "Invoices");

            migrationBuilder.RenameColumn(
                name: "WarrantyDays",
                table: "Invoices",
                newName: "WorkReportId");

            migrationBuilder.RenameColumn(
                name: "ServiceCharge",
                table: "Invoices",
                newName: "TaxAmount");

            migrationBuilder.RenameColumn(
                name: "PartsCharge",
                table: "Invoices",
                newName: "SubTotal");

            migrationBuilder.RenameColumn(
                name: "PaidDate",
                table: "Invoices",
                newName: "PaidAt");

            migrationBuilder.RenameColumn(
                name: "ManagerId",
                table: "Invoices",
                newName: "GeneratedByUserId");

            migrationBuilder.RenameColumn(
                name: "IssueDate",
                table: "Invoices",
                newName: "IssuedAt");

            migrationBuilder.RenameColumn(
                name: "GST",
                table: "Invoices",
                newName: "PartsAmount");

            migrationBuilder.AlterColumn<string>(
                name: "Notes",
                table: "Invoices",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "InvoiceNumber",
                table: "Invoices",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Invoices",
                type: "nvarchar(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "InvoiceItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InvoiceId = table.Column<int>(type: "int", nullable: false),
                    InventoryItemId = table.Column<int>(type: "int", nullable: true),
                    ItemName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    SKU = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InvoiceItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InvoiceItems_InventoryItems_InventoryItemId",
                        column: x => x.InventoryItemId,
                        principalTable: "InventoryItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_InvoiceItems_Invoices_InvoiceId",
                        column: x => x.InvoiceId,
                        principalTable: "Invoices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_CustomerId",
                table: "Invoices",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_GeneratedByUserId",
                table: "Invoices",
                column: "GeneratedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_ServiceRequestId",
                table: "Invoices",
                column: "ServiceRequestId");

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_WorkReportId",
                table: "Invoices",
                column: "WorkReportId");

            migrationBuilder.CreateIndex(
                name: "IX_InvoiceItems_InventoryItemId",
                table: "InvoiceItems",
                column: "InventoryItemId");

            migrationBuilder.CreateIndex(
                name: "IX_InvoiceItems_InvoiceId",
                table: "InvoiceItems",
                column: "InvoiceId");

            migrationBuilder.AddForeignKey(
                name: "FK_Invoices_ServiceRequests_ServiceRequestId",
                table: "Invoices",
                column: "ServiceRequestId",
                principalTable: "ServiceRequests",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Invoices_Users_CustomerId",
                table: "Invoices",
                column: "CustomerId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Invoices_Users_GeneratedByUserId",
                table: "Invoices",
                column: "GeneratedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Invoices_WorkReports_WorkReportId",
                table: "Invoices",
                column: "WorkReportId",
                principalTable: "WorkReports",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }


        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Invoices_ServiceRequests_ServiceRequestId",
                table: "Invoices");

            migrationBuilder.DropForeignKey(
                name: "FK_Invoices_Users_CustomerId",
                table: "Invoices");

            migrationBuilder.DropForeignKey(
                name: "FK_Invoices_Users_GeneratedByUserId",
                table: "Invoices");

            migrationBuilder.DropForeignKey(
                name: "FK_Invoices_WorkReports_WorkReportId",
                table: "Invoices");

            migrationBuilder.DropTable(
                name: "InvoiceItems");

            migrationBuilder.DropIndex(
                name: "IX_Invoices_CustomerId",
                table: "Invoices");

            migrationBuilder.DropIndex(
                name: "IX_Invoices_GeneratedByUserId",
                table: "Invoices");

            migrationBuilder.DropIndex(
                name: "IX_Invoices_ServiceRequestId",
                table: "Invoices");

            migrationBuilder.DropIndex(
                name: "IX_Invoices_WorkReportId",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Invoices");

            migrationBuilder.RenameColumn(
                name: "WorkReportId",
                table: "Invoices",
                newName: "WarrantyDays");

            migrationBuilder.RenameColumn(
                name: "TaxAmount",
                table: "Invoices",
                newName: "ServiceCharge");

            migrationBuilder.RenameColumn(
                name: "SubTotal",
                table: "Invoices",
                newName: "PartsCharge");

            migrationBuilder.RenameColumn(
                name: "PartsAmount",
                table: "Invoices",
                newName: "GST");

            migrationBuilder.RenameColumn(
                name: "PaidAt",
                table: "Invoices",
                newName: "PaidDate");

            migrationBuilder.RenameColumn(
                name: "IssuedAt",
                table: "Invoices",
                newName: "IssueDate");

            migrationBuilder.RenameColumn(
                name: "GeneratedByUserId",
                table: "Invoices",
                newName: "ManagerId");

            migrationBuilder.AlterColumn<string>(
                name: "Notes",
                table: "Invoices",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(1000)",
                oldMaxLength: 1000,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "InvoiceNumber",
                table: "Invoices",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AddColumn<decimal>(
                name: "Discount",
                table: "Invoices",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<DateTime>(
                name: "DueDate",
                table: "Invoices",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "PaymentMethod",
                table: "Invoices",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PaymentStatus",
                table: "Invoices",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }
    }
}
