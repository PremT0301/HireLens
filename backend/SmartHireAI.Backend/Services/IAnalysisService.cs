#nullable enable
using Microsoft.AspNetCore.Http;
using SmartHireAI.Backend.Models;
using System;
using System.Threading.Tasks;

namespace SmartHireAI.Backend.Services;

public interface IAnalysisService
{
    Task<AnalyzeResumeOutput?> AnalyzeResumeAsync(Guid userId, IFormFile resumeFile);
}
