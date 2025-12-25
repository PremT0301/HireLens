export const API_BASE_URL = "http://localhost:5033/api";

export const endpoints = {
    analyzeResume: `${API_BASE_URL}/analysis/analyze-resume`,
    matchJob: `${API_BASE_URL}/analysis/match-job`,
    applications: `${API_BASE_URL}/applications`,
    jobs: `${API_BASE_URL}/jobs`,
    health: "http://localhost:5033/health"
};
