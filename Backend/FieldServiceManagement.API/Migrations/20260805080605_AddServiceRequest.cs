using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FieldServiceManagement.API.Migrations
{

    public partial class AddServiceRequest : Migration
    {

        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AddressId",
                table: "ServiceRequests");

            migrationBuilder.DropColumn(
                name: "AssignedTechnicianId",
                table: "ServiceRequests");

            migrationBuilder.DropColumn(
                name: "ClosedAt",
                table: "ServiceRequests");

            migrationBuilder.DropColumn(
                name: "ManagerId",
                table: "ServiceRequests");

            migrationBuilder.DropColumn(
                name: "PreferredTime",
                table: "ServiceRequests");

            migrationBuilder.DropColumn(
                name: "Priority",
                table: "ServiceRequests");

            migrationBuilder.DropColumn(
                name: "ProblemTitle",
                table: "ServiceRequests");

            migrationBuilder.DropColumn(
                name: "RequestNumber",
                table: "ServiceRequests");

            migrationBuilder.RenameColumn(
                name: "CompletedAt",
                table: "ServiceRequests",
                newName: "UpdatedAt");

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "ServiceRequests",
                type: "nvarchar(30)",
                maxLength: 30,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "ProblemDescription",
                table: "ServiceRequests",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<decimal>(
                name: "EstimatedPrice",
                table: "ServiceRequests",
                type: "decimal(10,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "ServiceRequests",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ServiceAddress",
                table: "ServiceRequests",
                type: "nvarchar(300)",
                maxLength: 300,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "TechnicianId",
                table: "ServiceRequests",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Technicians_UserId",
                table: "Technicians",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ServiceRequests_CustomerId",
                table: "ServiceRequests",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceRequests_ServiceId",
                table: "ServiceRequests",
                column: "ServiceId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceRequests_TechnicianId",
                table: "ServiceRequests",
                column: "TechnicianId");

            migrationBuilder.AddForeignKey(
                name: "FK_ServiceRequests_Services_ServiceId",
                table: "ServiceRequests",
                column: "ServiceId",
                principalTable: "Services",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ServiceRequests_Technicians_TechnicianId",
                table: "ServiceRequests",
                column: "TechnicianId",
                principalTable: "Technicians",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_ServiceRequests_Users_CustomerId",
                table: "ServiceRequests",
                column: "CustomerId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Technicians_Users_UserId",
                table: "Technicians",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }


        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ServiceRequests_Services_ServiceId",
                table: "ServiceRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_ServiceRequests_Technicians_TechnicianId",
                table: "ServiceRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_ServiceRequests_Users_CustomerId",
                table: "ServiceRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_Technicians_Users_UserId",
                table: "Technicians");

            migrationBuilder.DropIndex(
                name: "IX_Technicians_UserId",
                table: "Technicians");

            migrationBuilder.DropIndex(
                name: "IX_ServiceRequests_CustomerId",
                table: "ServiceRequests");

            migrationBuilder.DropIndex(
                name: "IX_ServiceRequests_ServiceId",
                table: "ServiceRequests");

            migrationBuilder.DropIndex(
                name: "IX_ServiceRequests_TechnicianId",
                table: "ServiceRequests");

            migrationBuilder.DropColumn(
                name: "EstimatedPrice",
                table: "ServiceRequests");

            migrationBuilder.DropColumn(
                name: "Notes",
                table: "ServiceRequests");

            migrationBuilder.DropColumn(
                name: "ServiceAddress",
                table: "ServiceRequests");

            migrationBuilder.DropColumn(
                name: "TechnicianId",
                table: "ServiceRequests");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "ServiceRequests",
                newName: "CompletedAt");

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "ServiceRequests",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(30)",
                oldMaxLength: 30);

            migrationBuilder.AlterColumn<string>(
                name: "ProblemDescription",
                table: "ServiceRequests",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500);

            migrationBuilder.AddColumn<int>(
                name: "AddressId",
                table: "ServiceRequests",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "AssignedTechnicianId",
                table: "ServiceRequests",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "ClosedAt",
                table: "ServiceRequests",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ManagerId",
                table: "ServiceRequests",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "PreferredTime",
                table: "ServiceRequests",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Priority",
                table: "ServiceRequests",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ProblemTitle",
                table: "ServiceRequests",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "RequestNumber",
                table: "ServiceRequests",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }
    }
}
