using System.ComponentModel.DataAnnotations;

namespace FieldServiceManagement.API.DTOs.WorkReports;

public class WorkReportPartInputDto
{
    [Required]
    public int InventoryItemId { get; set; }

    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }
}