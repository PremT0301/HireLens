#nullable enable
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using SmartHireAI.Backend.Data;
using SmartHireAI.Backend.DTOs;
using SmartHireAI.Backend.Services;

namespace SmartHireAI.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EnterpriseController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;

        public EnterpriseController(ApplicationDbContext context, IEmailService emailService, IConfiguration configuration)
        {
            _context = context;
            _emailService = emailService;
            _configuration = configuration;
        }

        [HttpPost("schedule-demo")]
        public async Task<IActionResult> ScheduleDemo([FromBody] ScheduleDemoRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var lead = new EnterpriseLead
            {
                LeadType = LeadType.Demo,
                FullName = request.FullName,
                Email = request.Email,
                Company = request.Company,
                JobTitle = request.JobTitle,
                CompanySize = request.CompanySize,
                Phone = request.Phone,
                Country = request.Country,
                PreferredDate = request.PreferredDate,
                PreferredTime = request.PreferredTime,
                HiringVolume = request.HiringVolume,
                Message = request.Message ?? string.Empty
            };

            _context.EnterpriseLeads.Add(lead);
            await _context.SaveChangesAsync();

            await SendAdminNotification(lead);

            return Ok(new { Message = "Thank you! Our enterprise team will contact you within 24 hours." });
        }

        [HttpPost("contact-sales")]
        public async Task<IActionResult> ContactSales([FromBody] ContactSalesRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var lead = new EnterpriseLead
            {
                LeadType = LeadType.Sales,
                FullName = request.FullName,
                Email = request.Email,
                Company = request.Company,
                JobTitle = request.JobTitle,
                Phone = request.Phone,
                Country = request.Country,
                InquiryType = request.InquiryType,
                Message = request.Message
            };

            _context.EnterpriseLeads.Add(lead);
            await _context.SaveChangesAsync();

            await SendAdminNotification(lead);

            return Ok(new { Message = "Thank you! Our enterprise team will contact you within 24 hours." });
        }

        private async Task SendAdminNotification(EnterpriseLead lead)
        {
            var adminEmail = _configuration["AppSettings:AdminNotificationEmail"];
            if (string.IsNullOrEmpty(adminEmail)) return;

            var subject = $"New Enterprise Lead - HireLens AI";
            var leadType = lead.LeadType == LeadType.Demo ? "Schedule Demo" : "Contact Sales";
            
            var body = $@"
                <div style='font-family: Arial, sans-serif; line-height: 1.6;'>
                    <h2>New Enterprise Lead Received</h2>
                    <p><strong>Lead Type:</strong> {leadType}</p>
                    <hr/>
                    <p><strong>Full Name:</strong> {lead.FullName}</p>
                    <p><strong>Email:</strong> {lead.Email}</p>
                    <p><strong>Company:</strong> {lead.Company}</p>
                    <p><strong>Job Title:</strong> {lead.JobTitle}</p>";

            if (lead.LeadType == LeadType.Demo)
            {
                body += $@"
                    <p><strong>Company Size:</strong> {lead.CompanySize}</p>
                    <p><strong>Hiring Volume:</strong> {lead.HiringVolume}</p>
                    <br/>
                    <p><strong>Preferred Demo Date:</strong> {lead.PreferredDate?.ToString("dd MMMM yyyy")}</p>
                    <p><strong>Preferred Time:</strong> {lead.PreferredTime}</p>";
            }
            else
            {
                body += $"<p><strong>Inquiry Type:</strong> {lead.InquiryType}</p>";
            }

            body += $@"
                    <p><strong>Country:</strong> {lead.Country}</p>
                    <p><strong>Phone:</strong> {lead.Phone ?? "N/A"}</p>
                    <br/>
                    <p><strong>Message:</strong></p>
                    <p>{lead.Message}</p>
                    <hr/>
                    <p>Please contact the lead directly.</p>
                </div>";

            try
            {
                await _emailService.SendEmailAsync(adminEmail, subject, body);
            }
            catch (Exception ex)
            {
                // Log error but don't fail the request
                Console.WriteLine($"Error sending admin notification: {ex.Message}");
            }
        }
    }
}
