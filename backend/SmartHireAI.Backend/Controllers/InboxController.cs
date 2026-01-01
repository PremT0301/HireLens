using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartHireAI.Backend.Data;

namespace SmartHireAI.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InboxController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly Services.IEmailService _emailService;

    public InboxController(ApplicationDbContext context, Services.IEmailService emailService)
    {
        _context = context;
        _emailService = emailService;
    }

    // GET: api/inbox/threads
    [HttpGet("threads")]
    public async Task<ActionResult<IEnumerable<object>>> GetThreads()
    {
        void Log(string msg)
        {
            try { System.IO.File.AppendAllText("debug_inbox.txt", DateTime.Now + ": " + msg + Environment.NewLine); } catch { }
        }

        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdString, out var userId))
        {
            Log("[Inbox] No userId found.");
            return Unauthorized();
        }

        Log($"[Inbox] GetThreads called. UserIdString: {userIdString}");

        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            Log("[Inbox] User not found.");
            return Unauthorized();
        }

        Log($"[Inbox] User Role: {user.Role}");

        IQueryable<InboxThread> query = _context.InboxThreads
            .Include(t => t.JobApplication)
            .ThenInclude(ja => ja.JobDescription)
            .Include(t => t.Recruiter)
            .ThenInclude(r => r.User)
            .Include(t => t.Applicant)
            .ThenInclude(a => a.User);

        if (string.Equals(user.Role, "Recruiter", StringComparison.OrdinalIgnoreCase))
        {
            var recruiter = await _context.Recruiters.FirstOrDefaultAsync(r => r.User.UserId == userId);
            if (recruiter == null)
            {
                Log("[Inbox] Recruiter profile not found.");
                return NotFound("Recruiter profile not found");
            }
            Log($"[Inbox] Recruiter found: {recruiter.RecruiterId}");
            query = query.Where(t => t.RecruiterId == recruiter.RecruiterId);
        }
        else if (string.Equals(user.Role, "Applicant", StringComparison.OrdinalIgnoreCase))
        {
            var applicant = await _context.Applicants.FirstOrDefaultAsync(a => a.User.UserId == userId);
            if (applicant == null)
            {
                Log("[Inbox] Applicant profile not found.");
                return NotFound("Applicant profile not found");
            }
            Log($"[Inbox] Applicant found: {applicant.ApplicantId}");
            query = query.Where(t => t.ApplicantId == applicant.ApplicantId);
        }
        else
        {
            Log("[Inbox] Unknown role.");
            return Forbid();
        }

        var results = await query.ToListAsync();
        Log($"[Inbox] Query matched {results.Count} threads.");

        try
        {
            var threads = results
                .OrderByDescending(t => t.LastMessageAt)
                .Select(t => new
                {
                    t.ThreadId,
                    t.Subject,
                    t.LastMessageAt,
                    OtherPartyName = user.Role == "Recruiter" ? (t.Applicant?.User?.FullName ?? "Unknown Applicant") : (t.Recruiter?.CompanyName ?? "Unknown Company"),
                    OtherPartyImage = user.Role == "Recruiter" ? (t.Applicant?.User?.ProfileImage) : (t.Recruiter?.CompanyLogo),
                    HasUnread = t.Messages.Any(m => !m.IsRead && m.SenderId != userId)
                })
                .ToList();

            Log($"[Inbox] Mapped {threads.Count} threads successfully.");
            return Ok(threads);
        }
        catch (Exception ex)
        {
            Log($"[Inbox] Error mapping threads: {ex.Message}");
            return StatusCode(500, ex.Message);
        }
    }

    // GET: api/inbox/threads/{threadId}/messages
    [HttpGet("threads/{threadId}/messages")]
    public async Task<ActionResult<IEnumerable<object>>> GetMessages(Guid threadId)
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdString, out var userId)) return Unauthorized();

        var thread = await _context.InboxThreads
            .Include(t => t.Recruiter)
            .ThenInclude(r => r.User)
            .Include(t => t.Applicant)
            .ThenInclude(a => a.User)
            .FirstOrDefaultAsync(t => t.ThreadId == threadId);

        if (thread == null) return NotFound("Thread not found");

        // Authorization check
        bool isParticipant = false;
        if (thread.Recruiter.User.UserId == userId) isParticipant = true;
        if (thread.Applicant.User.UserId == userId) isParticipant = true;

        if (!isParticipant) return Forbid();

        var messages = await _context.InboxMessages
            .Where(m => m.ThreadId == threadId)
            .OrderBy(m => m.SentAt)
            .Select(m => new
            {
                m.MessageId,
                m.SenderId,
                m.SenderRole,
                m.Content,
                m.SentAt,
                m.IsRead,
                IsMine = m.SenderId == userId
            })
            .ToListAsync();

        // Mark as read
        var unreadMessages = await _context.InboxMessages
            .Where(m => m.ThreadId == threadId && !m.IsRead && m.SenderId != userId)
            .ToListAsync();

        if (unreadMessages.Any())
        {
            foreach (var msg in unreadMessages)
            {
                msg.IsRead = true;
            }
            await _context.SaveChangesAsync();
        }

        return Ok(messages);
    }

    // POST: api/inbox/threads/{threadId}/message
    [HttpPost("threads/{threadId}/message")]
    public async Task<IActionResult> SendMessage(Guid threadId, [FromBody] MessageInput input)
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdString, out var userId)) return Unauthorized();

        var user = await _context.Users.FindAsync(userId);
        if (user == null) return Unauthorized();

        var thread = await _context.InboxThreads
            .Include(t => t.Recruiter).ThenInclude(r => r.User)
            .Include(t => t.Applicant).ThenInclude(a => a.User)
            .FirstOrDefaultAsync(t => t.ThreadId == threadId);

        if (thread == null) return NotFound("Thread not found");

        if (thread.Recruiter.User.UserId != userId && thread.Applicant.User.UserId != userId)
            return Forbid();

        var message = new InboxMessage
        {
            MessageId = Guid.NewGuid(),
            ThreadId = threadId,
            SenderId = userId,
            SenderRole = user.Role,
            Content = input.Content,
            SentAt = DateTime.UtcNow,
            IsRead = false
        };

        _context.InboxMessages.Add(message);
        thread.LastMessageAt = DateTime.UtcNow;

        // Notify the recipient
        // Notify the recipient
        Guid recipientUserId;
        // We already have Recruiter User ID and Applicant userID from 'thread' variable

        if (string.Equals(user.Role, "Recruiter", StringComparison.OrdinalIgnoreCase))
        {
            recipientUserId = thread.Applicant.User.UserId;
        }
        else
        {
            recipientUserId = thread.Recruiter.User.UserId;
        }

        var notification = new Notification
        {
            NotificationId = Guid.NewGuid(),
            UserId = recipientUserId,
            Title = "New Message",
            Message = $"You have a new message from {user.FullName ?? "User"}",
            Type = "MessageReceived",
            ReferenceId = threadId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Notifications.Add(notification);

        // Send Email Notification
        var recipient = await _context.Users.FindAsync(recipientUserId);
        if (recipient != null && !string.IsNullOrEmpty(recipient.Email))
        {
            // Determine sender name safely
            string senderName = user.FullName ?? "A user";
            if (user.Role == "Recruiter")
            {
                // If sender is recruiter, try to get company name? 
                // Fetching complex objects again might be heavy, stick to name for now.
            }

            string emailSubject = "New Message on HireLens";
            string emailBody = $@"
                <div style='font-family: Arial, sans-serif;'>
                    <h2>New Message Received</h2>
                    <p>Hello {recipient.FullName},</p>
                    <p>You have a new message from <strong>{senderName}</strong>.</p>
                    <br/>
                    <div style='background-color: #f5f5f5; padding: 15px; border-radius: 5px; border-left: 4px solid #2563eb;'>
                         <p style='margin: 0; font-style: italic;'>""{input.Content}""</p>
                    </div>
                    <br/>
                    <p>Log in to HireLens to view the conversation.</p>
                </div>";

            _ = Task.Run(async () =>
            {
                try
                {
                    await _emailService.SendEmailAsync(recipient.Email, emailSubject, emailBody);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error sending inbox message notification: {ex.Message}");
                }
            });
        }

        await _context.SaveChangesAsync();

        return Ok(new { Message = "Message sent" });
    }

    // GET: api/inbox/notifications
    [HttpGet("notifications")]
    public async Task<ActionResult<IEnumerable<object>>> GetNotifications()
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdString, out var userId)) return Unauthorized();

        var notifications = await _context.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Take(50)
            .ToListAsync();

        return Ok(notifications);
    }

    // PATCH: api/inbox/notifications/{id}/read
    [HttpPatch("notifications/{id}/read")]
    public async Task<IActionResult> MarkNotificationRead(Guid id)
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdString, out var userId)) return Unauthorized();

        var notification = await _context.Notifications.FirstOrDefaultAsync(n => n.NotificationId == id && n.UserId == userId);
        if (notification == null) return NotFound();

        notification.IsRead = true;
        await _context.SaveChangesAsync();

        return Ok();
    }

    // PATCH: api/inbox/notifications/read-all
    [HttpPatch("notifications/read-all")]
    public async Task<IActionResult> MarkAllNotificationsRead()
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdString, out var userId)) return Unauthorized();

        var notifications = await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync();

        foreach (var n in notifications)
        {
            n.IsRead = true;
        }

        await _context.SaveChangesAsync();

        return Ok(new { Message = "All marked as read" });
    }

    public record MessageInput(string Content);
}
