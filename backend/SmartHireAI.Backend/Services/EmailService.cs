using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;

namespace SmartHireAI.Backend.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task SendEmailAsync(string to, string subject, string body)
    {
        var emailSettings = _configuration.GetSection("EmailSettings");
        var smtpServer = emailSettings["SmtpServer"];
        var port = emailSettings.GetValue<int>("Port", 587);
        var senderName = emailSettings["SenderName"];
        var senderEmail = emailSettings["SenderEmail"];
        var password = emailSettings["Password"];

        if (string.IsNullOrEmpty(smtpServer) || string.IsNullOrEmpty(senderEmail) || string.IsNullOrEmpty(password))
        {
            throw new Exception("Email settings are not configured properly.");
        }

        using var client = new SmtpClient(smtpServer, port)
        {
            Credentials = new NetworkCredential(senderEmail, password),
            EnableSsl = true
        };

        var mailMessage = new MailMessage
        {
            From = new MailAddress(senderEmail!, senderName),
            Subject = subject,
            Body = body,
            IsBodyHtml = true
        };
        mailMessage.To.Add(to);

        await client.SendMailAsync(mailMessage);
    }
}
