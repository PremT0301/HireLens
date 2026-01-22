import React from 'react';
import { FileX, Inbox, Users, Briefcase, MessageSquare, Calendar, Search } from 'lucide-react';
import './EmptyState.css';

const EmptyState = ({
    icon: Icon,
    iconName,
    title,
    description,
    actionLabel,
    onAction,
    variant = 'default' // default, minimal, centered
}) => {
    // Icon mapping for common scenarios
    const getIcon = () => {
        if (Icon) return Icon;

        const iconMap = {
            'no-applications': Inbox,
            'no-jobs': Briefcase,
            'no-candidates': Users,
            'no-messages': MessageSquare,
            'no-sessions': Calendar,
            'no-results': Search,
            'no-data': FileX
        };

        return iconMap[iconName] || FileX;
    };

    const IconComponent = getIcon();

    return (
        <div className={`empty-state empty-state--${variant}`}>
            <div className="empty-state__icon-wrapper">
                <IconComponent className="empty-state__icon" size={64} strokeWidth={1.5} />
            </div>

            <div className="empty-state__content">
                <h3 className="empty-state__title">{title}</h3>
                {description && (
                    <p className="empty-state__description">{description}</p>
                )}
            </div>

            {actionLabel && onAction && (
                <button
                    className="empty-state__action"
                    onClick={onAction}
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
};

// Predefined empty states for common scenarios
export const NoApplicationsState = ({ onAction }) => (
    <EmptyState
        iconName="no-applications"
        title="No applications yet"
        description="You haven't applied to any jobs. Start exploring opportunities to find your perfect match!"
        actionLabel="Browse Jobs"
        onAction={onAction}
    />
);

export const NoJobsState = ({ onAction }) => (
    <EmptyState
        iconName="no-jobs"
        title="No jobs available"
        description="There are no job postings matching your profile at the moment. Check back soon for new opportunities!"
        actionLabel={onAction ? "Refresh" : undefined}
        onAction={onAction}
    />
);

export const NoCandidatesState = ({ onAction }) => (
    <EmptyState
        iconName="no-candidates"
        title="No candidates in your talent pool"
        description="Once applicants start applying to your jobs, they'll appear here for you to review."
        actionLabel={onAction ? "Post a Job" : undefined}
        onAction={onAction}
    />
);

export const NoMessagesState = () => (
    <EmptyState
        iconName="no-messages"
        title="No messages yet"
        description="Your inbox is empty. Messages from recruiters will appear here."
        variant="minimal"
    />
);

export const NoSessionsState = ({ onAction }) => (
    <EmptyState
        iconName="no-sessions"
        title="No interview sessions yet"
        description="Create your first interview practice session to start preparing for your dream job!"
        actionLabel="Create Session"
        onAction={onAction}
    />
);

export const NoSearchResultsState = ({ searchTerm }) => (
    <EmptyState
        iconName="no-results"
        title="No results found"
        description={searchTerm ? `No results found for "${searchTerm}". Try adjusting your search criteria.` : "No results found. Try adjusting your filters."}
        variant="minimal"
    />
);

export const NoPostedJobsState = ({ onAction }) => (
    <EmptyState
        iconName="no-jobs"
        title="No job postings yet"
        description="You haven't posted any jobs. Create your first job posting to start attracting top talent!"
        actionLabel="Create Job"
        onAction={onAction}
    />
);

export const NoAnalyticsDataState = () => (
    <EmptyState
        iconName="no-data"
        title="No analytics data available"
        description="Analytics will appear once you have applications and candidate interactions."
        variant="minimal"
    />
);

export default EmptyState;
