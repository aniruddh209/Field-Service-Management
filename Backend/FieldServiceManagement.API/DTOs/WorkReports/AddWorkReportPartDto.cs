using System.ComponentModel.DataAnnotations;

namespace FieldServiceManagement.API.DTOs.WorkReports;

public class AddWorkReportPartDto
{
    [Required]
    public int InventoryItemId { get; set; }

    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }
}