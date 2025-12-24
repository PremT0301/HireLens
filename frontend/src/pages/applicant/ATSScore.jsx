import React, { useState } from 'react';
import UploadZone from '../../components/UploadZone';
import Dashboard from '../../components/Dashboard';

const ATSScore = () => {
    const [analyzing, setAnalyzing] = useState(false);
    const [showResults, setShowResults] = useState(false);

    const handleUpload = (file) => {
        setAnalyzing(true);
        setTimeout(() => {
            setAnalyzing(false);
            setShowResults(true);
        }, 2000);
    };

    return (
        <div>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '1rem' }}>ATS Analysis</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Detailed breakdown of how your resume performs against algorithms</p>
            </div>

            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                {!showResults && (
                    <div style={{ transition: 'all 0.5s' }}>
                        <UploadZone onUpload={handleUpload} />
                        {analyzing && (
                            <div style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--accent-secondary)' }}>
                                <p style={{ fontSize: '1.2rem', animation: 'pulse 1.5s infinite' }}>Scanning document...</p>
                            </div>
                        )}
                    </div>
                )}

                {showResults && (
                    <div style={{ animation: 'slideUp 0.5s ease-out' }}>
                        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '1.5rem' }}>Scan Results</h2>
                            <button
                                onClick={() => setShowResults(false)}
                                className="btn-ghost"
                                style={{ border: '1px solid var(--glass-border)' }}
                            >
                                Scan Another
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

export default ATSScore;
