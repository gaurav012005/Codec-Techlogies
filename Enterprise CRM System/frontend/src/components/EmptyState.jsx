import { Inbox, Users, Building2, Target, ListTodo, GitBranch, BarChart3, Mail } from 'lucide-react';

const icons = {
    leads: Users,
    contacts: Users,
    companies: Building2,
    deals: Target,
    tasks: ListTodo,
    workflows: GitBranch,
    reports: BarChart3,
    emails: Mail,
    default: Inbox,
};

const EmptyState = ({ entity = 'default', title, description, action }) => {
    const Icon = icons[entity] || icons.default;

    return (
        <div className="empty-state">
            <div className="empty-state-icon">
                <Icon size={32} />
            </div>
            <div className="empty-state-title">
                {title || `No ${entity} yet`}
            </div>
            <div className="empty-state-desc">
                {description || `Get started by creating your first ${entity.replace(/s$/, '')}. They'll appear here once created.`}
            </div>
            {action && (
                <button className="btn btn-primary" onClick={action.onClick}>
                    {action.label}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
