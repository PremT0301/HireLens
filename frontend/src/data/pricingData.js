export const applicantPlans = [
    {
        name: 'Explorer',
        price: '0',
        duration: 'forever',
        features: [
            '3 Resume Analyses per month',
            'Basic Skill Gap Report',
            'Basic ATS Score',
            'Access to Job Feed'
        ],
        notIncluded: [
            'Interview Copilot',
            'Advanced Resume Feedback'
        ],
        limitations: [
            '3 analyses per month',
            'No exportable reports',
            'Limited AI depth'
        ],
        btnText: 'Get Started Free',
        highlight: false,
        ctaLink: '/signup'
    },
    {
        name: 'Pro Applicant',
        price: {
            monthly: '499',
            annual: '399'
        },
        duration: 'month',
        features: [
            'Unlimited Resume Analyses',
            'Advanced Skill Gap Analysis',
            'Interview Copilot Access',
            'ATS Optimization Score',
            'Resume Improvement Suggestions',
            'Exportable Reports (PDF)'
        ],
        limitations: [
            'Single user only'
        ],
        btnText: 'Upgrade to Pro',
        highlight: true,
        ctaLink: '/signup'
    },
    {
        name: 'Elite Career+',
        price: {
            monthly: '999',
            annual: '799'
        },
        duration: 'month',
        features: [
            'Everything in Pro',
            'Personalized AI Career Roadmap',
            'Real-time Job Match Alerts',
            'Priority Resume Review Engine',
            'Early Access to New AI Features'
        ],
        btnText: 'Go Elite',
        highlight: false,
        ctaLink: '/signup'
    }
];

export const recruiterPlans = [
    {
        name: 'Starter Recruiter',
        price: '0',
        duration: 'year',
        features: [
            '1 Admin Account Only',
            'Up to 5 Job Postings per Year',
            'Each Job Active for 10 Days',
            'Basic Candidate Ranking'
        ],
        notIncluded: [
            'Talent Pool Search',
            'Advanced Gap Analysis',
            'Admin Analytics Dashboard'
        ],
        limitations: [
            'Max 1 user account',
            'No team collaboration',
            'Limited AI scoring depth'
        ],
        btnText: 'Start Free',
        highlight: false,
        ctaLink: '/signup'
    },
    {
        name: 'Growth Recruiter',
        price: {
            monthly: '4,999',
            annual: '3,999'
        },
        duration: 'month',
        features: [
            'Up to 5 Team Accounts',
            '50 Job Postings per Year',
            'Each Job Active for 30 Days',
            'Advanced AI Candidate Ranking',
            'Skill Gap Analysis Dashboard',
            'Interview Scheduling Tools',
            'Talent Pool Search Access',
            'Basic Analytics'
        ],
        limitations: [
            'Max 5 seats',
            'No API Access',
            'Standard SLA'
        ],
        btnText: 'Upgrade to Growth',
        highlight: true,
        ctaLink: '/signup'
    },
    {
        name: 'Enterprise Recruiter',
        price: 'Custom',
        duration: 'scale',
        features: [
            'Unlimited Team Accounts',
            'Unlimited Job Postings',
            'Job Active for 90 Days',
            'Dedicated AI Instance',
            'Advanced Admin Analytics Suite',
            'API Access',
            'White-label Option',
            'SLA & Priority Support',
            'On-Premises Deployment Option',
            'Custom AI Model Training'
        ],
        btnText: 'Contact Sales',
        highlight: false,
        ctaLink: '#'
    }
];

export const comparisonData = {
    applicant: [
        { feature: 'Resume Analyses', explorer: '3/mo', pro: 'Unlimited', elite: 'Unlimited' },
        { feature: 'Skill Gap Analysis', explorer: 'Basic', pro: 'Advanced', elite: 'Personalized' },
        { feature: 'Interview Copilot', explorer: 'No', pro: 'Included', elite: 'Priority' },
        { feature: 'ATS Optimization', explorer: 'Basic', pro: 'Advanced', elite: 'Priority' },
        { feature: 'Job Matching', explorer: 'Basic Feed', pro: 'Standard', elite: 'Real-time Alerts' }
    ],
    recruiter: [
        { feature: 'Team Accounts', starter: '1 Admin', growth: 'Up to 5 Seats', enterprise: 'Unlimited' },
        { feature: 'Job Postings', starter: '5 / year', growth: '50 / year', enterprise: 'Unlimited' },
        { feature: 'Job Duration', starter: '10 Days', growth: '30 Days', enterprise: '90 Days' },
        { feature: 'AI Ranking', starter: 'Basic', growth: 'Advanced', enterprise: 'Custom Model' },
        { feature: 'Analytics', starter: 'None', growth: 'Basic', enterprise: 'Advanced Suite' }
    ]
};
