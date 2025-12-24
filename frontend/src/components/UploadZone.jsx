import React, { useState } from 'react';

const UploadZone = ({ onUpload, isUploading }) => {
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            onUpload(files[0]);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            onUpload(e.target.files[0]);
        }
    };

    return (
        <div
            className={`glass-panel upload-zone ${isDragOver ? 'drag-active' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
                padding: '3rem',
                textAlign: 'center',
                border: isDragOver ? '2px dashed var(--accent-secondary)' : '2px dashed var(--glass-border)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <input
                type="file"
                onChange={handleFileChange}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer'
                }}
            />

            <div style={{ pointerEvents: 'none' }}>
                {isUploading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        <div className="loading-spinner" style={{
                            width: '48px',
                            height: '48px',
                            border: '4px solid var(--glass-border)',
                            borderTop: '4px solid var(--accent-primary)',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }}></div>
                        <h3 className="gradient-text" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                            Uploading Resume...
                        </h3>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Please wait while we process your file
                        </p>
                        <style>{`
                            @keyframes spin {
                                0% { transform: rotate(0deg); }
                                100% { transform: rotate(360deg); }
                            }
                        `}</style>
                    </div>
                ) : (
                    <>
                        <div style={{
                            marginBottom: '1rem',
                            color: isDragOver ? 'var(--accent-secondary)' : 'var(--text-secondary)',
                            transition: 'color 0.3s'
                        }}>
                            {/* Cloud Icon SVG */}
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" />
                                <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                        </div>
                        <h3 className="gradient-text" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                            Upload your Resume
                        </h3>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Drag & Drop PDF or DOCX here
                        </p>
                    </>
                )}
            </div>

            {isDragOver && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(circle, rgba(217, 70, 239, 0.1) 0%, transparent 70%)',
                    pointerEvents: 'none'
                }} />
            )}
        </div>
    );
};

export default UploadZone;
