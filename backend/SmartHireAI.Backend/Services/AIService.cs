using System.Text.Json;
using System.Net.Http.Json;
using SmartHireAI.Backend.Models;

namespace SmartHireAI.Backend.Services;

public interface IAIService
{
    Task<AnalyzeResumeOutput?> AnalyzeResumeAsync(string text);
    Task<GapAnalysisOutput?> MatchJobAsync(string resumeText, string jobDescription);
    Task<bool> CheckHealthAsync();
}

public class AIService : IAIService
{
    private readonly HttpClient _httpClient;
    private readonly JsonSerializerOptions _jsonOptions;

    public AIService(HttpClient httpClient)
    {
        _httpClient = httpClient;
        _httpClient.BaseAddress = new Uri("http://localhost:8000"); // Python Service URL
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower
        };
    }

    public async Task<AnalyzeResumeOutput?> AnalyzeResumeAsync(string text)
    {
        try
        {
            var input = new ResumeInput(text);
            var response = await _httpClient.PostAsJsonAsync("/analyze-resume", input, _jsonOptions);

            if (response.IsSuccessStatusCode)
            {
                return await response.Content.ReadFromJsonAsync<AnalyzeResumeOutput>(_jsonOptions);
            }

            var error = await response.Content.ReadAsStringAsync();
            Console.WriteLine($"AI Service Error: {response.StatusCode} - {error}");
            return null;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"AI Service Exception: {ex.Message}");
            return null;
        }
    }

    public async Task<GapAnalysisOutput?> MatchJobAsync(string resumeText, string jobDescription)
    {
        try
        {
            var input = new ResumeJobInput(resumeText, jobDescription);
            var response = await _httpClient.PostAsJsonAsync("/match-job", input, _jsonOptions);

            if (response.IsSuccessStatusCode)
            {
                return await response.Content.ReadFromJsonAsync<GapAnalysisOutput>(_jsonOptions);
            }

            var error = await response.Content.ReadAsStringAsync();
            Console.WriteLine($"AI MatchJob Error: {response.StatusCode} - {error}");
            return null;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"AI MatchJob Exception: {ex.Message}");
            return null;
        }
    }

    public async Task<bool> CheckHealthAsync()
    {
        try
        {
            var response = await _httpClient.GetAsync("/health");
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }
}
