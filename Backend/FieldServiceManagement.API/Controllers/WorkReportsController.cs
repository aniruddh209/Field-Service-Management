using FieldServiceManagement.API.Data;
using FieldServiceManagement.API.Models;
using Microsoft.AspNetCore.Mvc;

namespace FieldServiceManagement.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class WorkReportsController : ControllerBase
{
    private readonly AppDbContext _context;

    public WorkReportsController(AppDbContext context)
    {
        _context = context;
    }

    // GET : api/WorkReports
    [HttpGet]
    public IActionResult GetAllWorkReports()
    {
        return Ok(_context.WorkReports.ToList());
    }

    // GET : api/WorkReports/1
    [HttpGet("{id}")]
    public IActionResult GetWorkReportById(int id)
    {
        var report = _context.WorkReports.Find(id);

        if (report == null)
            return NotFound("Work Report Not Found");

        return Ok(report);
    }

    // POST : api/WorkReports
    [HttpPost]
    public IActionResult InsertWorkReport(WorkReport report)
    {
        _context.WorkReports.Add(report);
        _context.SaveChanges();

        return Ok("Work Report Added Successfully");
    }

    // PUT : api/WorkReports/1
    [HttpPut("{id}")]
    public IActionResult UpdateWorkReport(int id, WorkReport report)
    {
        if (id != report.Id)
            return BadRequest("Work Report Id Mismatch");

        var existingReport = _context.WorkReports.Find(id);

        if (existingReport == null)
            return NotFound("Work Report Not Found");

        existingReport.ServiceRequestId = report.ServiceRequestId;
        existingReport.TechnicianId = report.TechnicianId;
        existingReport.Diagnosis = report.Diagnosis;
        existingReport.WorkPerformed = report.WorkPerformed;
        existingReport.LabourHours = report.LabourHours;
        existingReport.SuggestedLabourCharge = report.SuggestedLabourCharge;
        existingReport.PartsUsed = report.PartsUsed;
        existingReport.Resolution = report.Resolution;
        existingReport.CustomerSignature = report.CustomerSignature;
        existingReport.TechnicianRemarks = report.TechnicianRemarks;
        existingReport.WarrantyDays = report.WarrantyDays;
        existingReport.ManagerReviewStatus = report.ManagerReviewStatus;
        existingReport.CorrectionReason = report.CorrectionReason;
        existingReport.SubmittedAt = report.SubmittedAt;

        _context.SaveChanges();

        return Ok("Work Report Updated Successfully");
    }

    // DELETE : api/WorkReports/1
    [HttpDelete("{id}")]
    public IActionResult DeleteWorkReport(int id)
    {
        var report = _context.WorkReports.Find(id);

        if (report == null)
            return NotFound("Work Report Not Found");

        _context.WorkReports.Remove(report);
        _context.SaveChanges();

        return Ok("Work Report Deleted Successfully");
    }
}