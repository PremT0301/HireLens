import React, { useState } from 'react';
import UploadZone from '../components/UploadZone';
import Dashboard from '../components/Dashboard';
import Skeleton from '../components/ui/Skeleton';

const StudentDashboard = () => {
    const [analyzing, setAnalyzing] = useState(false);
    const [showResults, setShowResults] = useState(false);

    const handleUpload = (file) => {
        // Simulate analysis
        setAnalyzing(true);
        setTimeout(() => {
            setAnalyzing(false);
            setShowResults(true);
        }, 2000);
    };

    return (
        <div className="container page-transition" style={{ paddingTop: '100px', paddingBottom: '4rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h1 className="gradient-text" style={{ fontSize: '3rem', marginBottom: '1rem', lineHeight: '1.2' }}>
                    Optimize Your <br /> Resume
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
                    Upload your resume to get instant AI-driven feedback and job matching suggestions.
                </p>
            </div>

            {/* Upload Section */}
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {!showResults && (
                    <div style={{ transition: 'all 0.5s', transform: analyzing ? 'scale(0.95)' : 'scale(1)' }}>
                        <UploadZone onUpload={handleUpload} isUploading={analyzing} />

                        {analyzing && (
                            <div style={{ marginTop: '3rem', maxWidth: '600px', margin: '3rem auto 0' }}>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem' }}>
                                    <Skeleton width="60px" height="60px" borderRadius="12px" />
                                    <div style={{ flex: 1 }}>
                                        <Skeleton width="60%" height="20px" style={{ marginBottom: '10px' }} />
                                        <Skeleton width="40%" height="16px" />
                                    </div>
                                </div>
                                <Skeleton width="100%" height="120px" borderRadius="16px" style={{ marginBottom: '1rem' }} />
                                <Skeleton width="100%" height="120px" borderRadius="16px" />
                            </div>
                        )}
                    </div>
                )}

                {showResults && (
                    <div style={{ animation: 'slideUp 0.5s ease-out' }}>
                        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '2rem' }}>Analysis Results</h2>
                            <button
                                onClick={() => setShowResults(false)}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid var(--glass-border)',
                                    color: 'var(--text-secondary)',
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                Upload New
                            </button>
                        </div>
                        <Dashboard />
                    </div>
                )}
            </div>
            <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
      `}</style>
        </div>
    );
};

export default StudentDashboard;
