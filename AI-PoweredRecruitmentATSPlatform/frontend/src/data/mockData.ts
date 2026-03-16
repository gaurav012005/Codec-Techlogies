export const mockJobs = [
    { _id: '1', title: 'Senior Frontend Engineer', department: 'Engineering', location: 'San Francisco, CA', type: 'full-time', experience: 'senior', status: 'active', pipeline: { sourced: 45, applied: 28, screening: 12, interview: 5, offered: 2, hired: 0 }, totalApplicants: 92, createdAt: '2026-02-28T10:00:00Z', closingDate: '2026-04-01T00:00:00Z' },
    { _id: '2', title: 'UX Design Lead', department: 'Design', location: 'Remote', type: 'remote', experience: 'lead', status: 'active', pipeline: { sourced: 32, applied: 20, screening: 8, interview: 3, offered: 1, hired: 0 }, totalApplicants: 64, createdAt: '2026-02-25T10:00:00Z', closingDate: '2026-03-20T00:00:00Z' },
    { _id: '3', title: 'Backend Engineer', department: 'Engineering', location: 'New York, NY', type: 'full-time', experience: 'mid', status: 'active', pipeline: { sourced: 60, applied: 38, screening: 15, interview: 7, offered: 0, hired: 0 }, totalApplicants: 120, createdAt: '2026-02-20T10:00:00Z' },
    { _id: '4', title: 'Product Manager', department: 'Product', location: 'Austin, TX', type: 'full-time', experience: 'senior', status: 'paused', pipeline: { sourced: 25, applied: 15, screening: 6, interview: 2, offered: 0, hired: 0 }, totalApplicants: 48, createdAt: '2026-02-15T10:00:00Z' },
    { _id: '5', title: 'Data Scientist', department: 'Data', location: 'Remote', type: 'remote', experience: 'mid', status: 'draft', pipeline: { sourced: 0, applied: 0, screening: 0, interview: 0, offered: 0, hired: 0 }, totalApplicants: 0, createdAt: '2026-03-01T10:00:00Z' },
    { _id: '6', title: 'DevOps Engineer', department: 'Engineering', location: 'Seattle, WA', type: 'contract', experience: 'senior', status: 'closed', pipeline: { sourced: 40, applied: 30, screening: 10, interview: 4, offered: 2, hired: 1 }, totalApplicants: 87, createdAt: '2026-01-10T10:00:00Z' },
    { _id: '7', title: 'Marketing Intern', department: 'Marketing', location: 'San Francisco, CA', type: 'internship', experience: 'entry', status: 'active', pipeline: { sourced: 80, applied: 55, screening: 20, interview: 8, offered: 0, hired: 0 }, totalApplicants: 163, createdAt: '2026-03-02T10:00:00Z' },
];

export const mockCandidates = [
    { _id: '1', firstName: 'Sarah', lastName: 'Jenkins', email: 'sarah@example.com', headline: 'Senior UX Designer · 8 years', location: 'San Francisco, CA', source: 'linkedin', aiScore: 98, skills: [{ name: 'Figma', level: 'expert' }, { name: 'React', level: 'advanced' }, { name: 'User Research', level: 'expert' }], tags: ['Top Talent', 'Design Lead'], rating: 5, appliedJobs: [{ job: { title: 'UX Design Lead' }, stage: 'interview' }], createdAt: '2026-02-28T10:00:00Z' },
    { _id: '2', firstName: 'James', lastName: 'Wilson', email: 'james@example.com', headline: 'Full-Stack Engineer · 6 years', location: 'New York, NY', source: 'referral', aiScore: 96, skills: [{ name: 'TypeScript', level: 'expert' }, { name: 'Node.js', level: 'advanced' }, { name: 'AWS', level: 'intermediate' }], tags: ['Referral'], rating: 4, appliedJobs: [{ job: { title: 'Senior Frontend Engineer' }, stage: 'screening' }], createdAt: '2026-02-27T10:00:00Z' },
    { _id: '3', firstName: 'Elena', lastName: 'Rodriguez', email: 'elena@example.com', headline: 'Product Manager · 5 years', location: 'Austin, TX', source: 'indeed', aiScore: 94, skills: [{ name: 'Agile', level: 'expert' }, { name: 'SQL', level: 'advanced' }, { name: 'Analytics', level: 'advanced' }], tags: [], rating: 4, appliedJobs: [{ job: { title: 'Product Manager' }, stage: 'applied' }], createdAt: '2026-02-25T10:00:00Z' },
    { _id: '4', firstName: 'Michael', lastName: 'Park', email: 'michael@example.com', headline: 'Backend Developer · 7 years', location: 'Seattle, WA', source: 'linkedin', aiScore: 91, skills: [{ name: 'Python', level: 'expert' }, { name: 'Django', level: 'advanced' }, { name: 'PostgreSQL', level: 'advanced' }], tags: ['Backend Expert'], rating: 4, appliedJobs: [{ job: { title: 'Backend Engineer' }, stage: 'offered' }], createdAt: '2026-02-20T10:00:00Z' },
    { _id: '5', firstName: 'Priya', lastName: 'Patel', email: 'priya@example.com', headline: 'Data Scientist · 4 years', location: 'Remote', source: 'job_board', aiScore: 89, skills: [{ name: 'Python', level: 'expert' }, { name: 'TensorFlow', level: 'advanced' }, { name: 'SQL', level: 'advanced' }], tags: ['ML Specialist'], rating: 3, appliedJobs: [{ job: { title: 'Data Scientist' }, stage: 'sourced' }], createdAt: '2026-03-01T10:00:00Z' },
    { _id: '6', firstName: 'Jordan', lastName: 'Lee', email: 'jordan@example.com', headline: 'DevOps Engineer · 5 years', location: 'Chicago, IL', source: 'direct', aiScore: 87, skills: [{ name: 'Kubernetes', level: 'expert' }, { name: 'Terraform', level: 'advanced' }, { name: 'CI/CD', level: 'expert' }], tags: [], rating: 4, appliedJobs: [{ job: { title: 'DevOps Engineer' }, stage: 'interview' }], createdAt: '2026-02-22T10:00:00Z' },
    { _id: '7', firstName: 'Aisha', lastName: 'Thompson', email: 'aisha@example.com', headline: 'Marketing Manager · 6 years', location: 'Los Angeles, CA', source: 'linkedin', aiScore: 82, skills: [{ name: 'SEO', level: 'expert' }, { name: 'Content', level: 'advanced' }, { name: 'Analytics', level: 'intermediate' }], tags: [], rating: 3, appliedJobs: [{ job: { title: 'Marketing Intern' }, stage: 'applied' }], createdAt: '2026-03-02T10:00:00Z' },
    { _id: '8', firstName: 'David', lastName: 'Kim', email: 'david@example.com', headline: 'iOS Developer · 4 years', location: 'San Francisco, CA', source: 'referral', aiScore: 85, skills: [{ name: 'Swift', level: 'expert' }, { name: 'SwiftUI', level: 'advanced' }, { name: 'Objective-C', level: 'intermediate' }], tags: ['Mobile'], rating: 4, appliedJobs: [{ job: { title: 'Senior Frontend Engineer' }, stage: 'rejected' }], createdAt: '2026-02-18T10:00:00Z' },
];

export const mockGetJobDetail = (id: string | undefined) => {
    const base = mockJobs.find(j => j._id === id) || mockJobs[0];
    return {
        ...base,
        salary: { min: 100000, max: 150000, currency: 'USD' },
        description: `We are looking for a ${base.title} to join our ${base.department} team...`,
        requirements: ['3+ years experience', 'Strong communication skills', 'Problem-solving abilities'],
        responsibilities: ['Build high quality solutions', 'Collaborate with team'],
        skills: ['Relevant Skill 1', 'Relevant Skill 2'],
        benefits: ['401k match', 'Health insurance', 'Remote work options'],
        postedBy: { firstName: 'Alex', lastName: 'Rivera' },
        aiScore: 85,
    };
};

export const mockGetCandidateDetail = (id: string | undefined) => {
    const base = mockCandidates.find(c => c._id === id) || mockCandidates[0];
    return {
        ...base,
        phone: '+1 (555) 123-4567',
        summary: `Experienced professional looking for a new challenge...`,
        socialLinks: { linkedin: 'linkedin.com/in/profile', github: 'github.com/profile' },
        experience: [{ title: base.headline.split('·')[0].trim(), company: 'Previous Co', location: base.location, startDate: '2020-01', endDate: 'Present', current: true, description: 'Led key initiatives...' }],
        education: [{ degree: 'B.S. Related Field', institution: 'University', field: 'Core Field', startDate: '2016', endDate: '2020' }],
        aiAnalysis: { strengths: ['Strong background', 'Relevant skills'], gaps: ['Missing specialized cert'], cultureFit: 92, technicalFit: 88, experienceFit: 95 },
    };
};
