using System.Text;
using UglyToad.PdfPig;

namespace SmartHireAI.Backend.Services;

public interface IResumeParserService
{
    Task<string> ParseResumeAsync(IFormFile file);
}

public class ResumeParserService : IResumeParserService
{
    private readonly ILogger<ResumeParserService> _logger;

    public ResumeParserService(ILogger<ResumeParserService> logger)
    {
        _logger = logger;
    }

    public async Task<string> ParseResumeAsync(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            throw new ArgumentException("File is empty");
        }

        var extension = Path.GetExtension(file.FileName).ToLower();

        if (extension == ".pdf")
        {
            return await ParsePdfAsync(file);
        }
        else if (extension == ".txt")
        {
            using var reader = new StreamReader(file.OpenReadStream());
            return await reader.ReadToEndAsync();
        }

        throw new NotSupportedException($"File type {extension} is not supported. Please upload PDF or TXT.");
    }

    private async Task<string> ParsePdfAsync(IFormFile file)
    {
        try
        {
            var sb = new StringBuilder();

            using (var stream = new MemoryStream())
            {
                await file.CopyToAsync(stream);
                stream.Position = 0; // Reset position

                using (var document = PdfDocument.Open(stream))
                {
                    foreach (var page in document.GetPages())
                    {
                        sb.AppendLine(page.Text);
                    }
                }
            }

            return sb.ToString();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to parse PDF");
            throw new Exception("Failed to extract text from PDF.", ex);
        }
    }
}
