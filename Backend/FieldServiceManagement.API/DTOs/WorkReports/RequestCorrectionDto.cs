namespace FieldServiceManagement.API.DTOs.WorkReports;

public class RequestCorrectionDto
{
    private string _correctionReason = string.Empty;

    public string CorrectionReason
    {
        get => string.IsNullOrWhiteSpace(_correctionReason) ? Feedback : _correctionReason;
        set => _correctionReason = value;
    }

    public string Feedback { get; set; } = string.Empty;
}