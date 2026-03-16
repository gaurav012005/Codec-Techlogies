import { AlertTriangle, RefreshCw } from 'lucide-react';

const ErrorState = ({ message, onRetry }) => {
    return (
        <div className="error-state">
            <div className="error-state-icon">
                <AlertTriangle size={28} />
            </div>
            <div className="error-state-title">Something went wrong</div>
            <div className="error-state-desc">
                {message || 'An unexpected error occurred. Please try again.'}
            </div>
            {onRetry && (
                <button className="btn btn-primary btn-sm" onClick={onRetry}>
                    <RefreshCw size={14} /> Try Again
                </button>
            )}
        </div>
    );
};

export default ErrorState;
