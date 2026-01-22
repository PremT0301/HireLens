import React from 'react';
import './Skeleton.css';

const Skeleton = ({
    variant = 'text',
    width,
    height,
    borderRadius,
    count = 1,
    style,
    className = ''
}) => {
    // Variant-based defaults
    const getVariantStyles = () => {
        switch (variant) {
            case 'text':
                return {
                    width: width || '100%',
                    height: height || '16px',
                    borderRadius: borderRadius || '4px'
                };
            case 'title':
                return {
                    width: width || '60%',
                    height: height || '24px',
                    borderRadius: borderRadius || '4px'
                };
            case 'card':
                return {
                    width: width || '100%',
                    height: height || '200px',
                    borderRadius: borderRadius || '12px'
                };
            case 'circle':
                return {
                    width: width || '48px',
                    height: height || '48px',
                    borderRadius: '50%'
                };
            case 'avatar':
                return {
                    width: width || '40px',
                    height: height || '40px',
                    borderRadius: '50%'
                };
            case 'list':
                return {
                    width: width || '100%',
                    height: height || '60px',
                    borderRadius: borderRadius || '8px'
                };
            case 'chart':
                return {
                    width: width || '100%',
                    height: height || '300px',
                    borderRadius: borderRadius || '8px'
                };
            case 'table-row':
                return {
                    width: width || '100%',
                    height: height || '48px',
                    borderRadius: borderRadius || '4px'
                };
            default:
                return {
                    width: width || '100%',
                    height: height || '16px',
                    borderRadius: borderRadius || '4px'
                };
        }
    };

    const variantStyles = getVariantStyles();

    if (count > 1) {
        return (
            <div className="skeleton-group">
                {Array.from({ length: count }).map((_, index) => (
                    <div
                        key={index}
                        className={`skeleton ${className}`}
                        style={{
                            ...variantStyles,
                            ...style,
                            marginBottom: index < count - 1 ? '12px' : '0'
                        }}
                    />
                ))}
            </div>
        );
    }

    return (
        <div
            className={`skeleton ${className}`}
            style={{
                ...variantStyles,
                ...style
            }}
        />
    );
};

// Specialized skeleton components for common patterns
export const SkeletonCard = ({ children, loading, ...props }) => {
    if (!loading) return children;

    return (
        <div className="skeleton-card-wrapper">
            <Skeleton variant="card" {...props} />
        </div>
    );
};

export const SkeletonList = ({ count = 3, itemHeight = '60px', gap = '12px' }) => {
    return (
        <div className="skeleton-list" style={{ gap }}>
            {Array.from({ length: count }).map((_, index) => (
                <Skeleton key={index} variant="list" height={itemHeight} />
            ))}
        </div>
    );
};

export const SkeletonTable = ({ rows = 5, columns = 4 }) => {
    return (
        <div className="skeleton-table">
            {/* Header */}
            <div className="skeleton-table-header" style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                {Array.from({ length: columns }).map((_, index) => (
                    <Skeleton key={index} variant="text" height="20px" width={`${100 / columns}%`} />
                ))}
            </div>
            {/* Rows */}
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={rowIndex} style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <Skeleton key={colIndex} variant="text" height="16px" width={`${100 / columns}%`} />
                    ))}
                </div>
            ))}
        </div>
    );
};

export const SkeletonDashboard = () => {
    return (
        <div className="skeleton-dashboard">
            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <Skeleton variant="card" height="120px" />
                <Skeleton variant="card" height="120px" />
                <Skeleton variant="card" height="120px" />
                <Skeleton variant="card" height="120px" />
            </div>
            {/* Chart */}
            <Skeleton variant="chart" height="350px" style={{ marginBottom: '30px' }} />
            {/* List */}
            <SkeletonList count={5} />
        </div>
    );
};

export default Skeleton;
