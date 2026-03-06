#nullable enable
using System.ComponentModel.DataAnnotations;

namespace SmartHireAI.Backend.DTOs
{
    public class ScheduleDemoRequest
    {
        [Required]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Company { get; set; } = string.Empty;

        [Required]
        public string JobTitle { get; set; } = string.Empty;

        [Required]
        public string CompanySize { get; set; } = string.Empty;

        public string? Phone { get; set; }

        [Required]
        public string Country { get; set; } = string.Empty;

        [Required]
        public DateTime PreferredDate { get; set; }

        [Required]
        public string PreferredTime { get; set; } = string.Empty;

        public string? HiringVolume { get; set; }

        public string? Message { get; set; }
    }

    public class ContactSalesRequest
    {
        [Required]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Company { get; set; } = string.Empty;

        [Required]
        public string JobTitle { get; set; } = string.Empty;

        [Required]
        public string Country { get; set; } = string.Empty;

        public string? Phone { get; set; }

        [Required]
        public string InquiryType { get; set; } = string.Empty;

        [Required]
        [MinLength(10)]
        public string Message { get; set; } = string.Empty;
    }
}
